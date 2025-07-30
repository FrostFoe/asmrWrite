"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotes } from "@/stores/use-notes";
import { cn, getTextFromEditorJS } from "@/lib/utils";
import { importNotes } from "@/lib/storage";
import { toast } from "sonner";
import Loading from "@/app/loading";
import { NotesGrid } from "./_components/notes-grid";
import { NotesList } from "./_components/notes-list";
import NotesHeader, { SortOption, ViewMode } from "./_components/notes-header";
import EmptyState from "./_components/empty-state";
import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function PasscodeDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isSettingNew,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (passcode: string) => void;
  isSettingNew: boolean;
}) {
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (isSettingNew) {
      if (passcode.length !== 4) {
        setError("পাসকোড অবশ্যই ৪ সংখ্যার হতে হবে।");
        return;
      }
      if (passcode !== confirmPasscode) {
        setError("পাসকোড দুটি মিলেনি।");
        return;
      }
    }
    setError("");
    onConfirm(passcode);
    setPasscode("");
    setConfirmPasscode("");
  };

  const handleClose = () => {
    setPasscode("");
    setConfirmPasscode("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSettingNew ? "নতুন পাসকোড সেট করুন" : "পাসকোড লিখুন"}
          </DialogTitle>
          <DialogDescription>
            {isSettingNew
              ? "নোট লক করার জন্য একটি ৪-সংখ্যার পাসকোড তৈরি করুন।"
              : "নোটটি দেখার জন্য আপনার ৪-সংখ্যার পাসকোডটি লিখুন।"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="password"
            maxLength={4}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ""))}
            placeholder="৪-সংখ্যার পাসকোড"
          />
          {isSettingNew && (
            <Input
              type="password"
              maxLength={4}
              value={confirmPasscode}
              onChange={(e) =>
                setConfirmPasscode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="পাসকোডটি আবার লিখুন"
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            বাতিল
          </Button>
          <Button onClick={handleConfirm}>নিশ্চিত করুন</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const { font, passcode, setSetting } = useSettingsStore();

  const {
    notes: initialNotes,
    isLoading,
    hasFetched,
    fetchNotes,
    createNote,
    addImportedNotes,
    updateNote,
  } = useNotes();

  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [passcodeCallback, setPasscodeCallback] = useState<
    (() => void) | null
  >(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes();
    }
  }, [fetchNotes, hasFetched]);

  const handleNewNote = useCallback(async () => {
    try {
      const noteId = await createNote();
      if (noteId) {
        toast.success("নতুন নোট তৈরি হয়েছে!");
        router.push(`/editor/${noteId}`);
      }
    } catch (error) {
      toast.error("নোট তৈরি করতে ব্যর্থ হয়েছে।");
      console.error(error);
    }
  }, [createNote, router]);

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          const imported = await importNotes(file);
          addImportedNotes(imported);
          toast.success(
            `${imported.length} টি নোট সফলভাবে ইমপোর্ট করা হয়েছে!`,
          );
        } catch (error) {
          toast.error(
            "নোট ইম্পোর্ট করতে ব্যর্থ হয়েছে। ফাইল ফরম্যাট সঠিক কিনা তা পরীক্ষা করুন।",
          );
          console.error(error);
        } finally {
          if (importInputRef.current) {
            importInputRef.current.value = "";
          }
        }
      }
    },
    [addImportedNotes],
  );

  const handleUnlockRequest = useCallback(
    (noteId: string, callback: () => void) => {
      const note = initialNotes.find((n) => n.id === noteId);
      if (!note) return;

      // If note is already unlocked, just run callback
      if (!note.isLocked) {
        callback();
        return;
      }

      // If note is locked, prompt for passcode
      if (!passcode) {
        // No passcode set, must set one first.
        // This case is handled by the lock button, but as a fallback.
        toast.error("প্রথমে একটি পাসকোড সেট করুন।");
        return;
      }
      setCurrentNoteId(noteId);
      setPasscodeCallback(() => () => {
        // on success
        if (note.isLocked) {
          updateNote(noteId, { isLocked: false });
          toast.success("নোটটি আনলক করা হয়েছে।");
        }
        callback();
      });
      setIsPasscodeDialogOpen(true);
    },
    [initialNotes, passcode, updateNote],
  );
  
  const handleLockRequest = useCallback(
    (noteId: string, callback: () => void) => {
        setCurrentNoteId(noteId);
        if (passcode) {
            // Passcode exists, just execute the callback which will toggle lock state
            callback();
        } else {
            // No passcode, must set one
            setPasscodeCallback(() => () => {
                callback();
            });
            setIsPasscodeDialogOpen(true);
        }
    },
    [passcode],
);

  const handlePasscodeConfirm = (enteredPasscode: string) => {
    if (passcode) {
      // Verifying existing passcode
      if (enteredPasscode === passcode) {
        passcodeCallback?.();
        toast.success("সঠিক পাসকোড!");
      } else {
        toast.error("ভুল পাসকোড!");
      }
    } else {
      // Setting new passcode
      setSetting("passcode", enteredPasscode);
      passcodeCallback?.();
      toast.success("পাসকোড সফলভাবে সেট করা হয়েছে!");
    }
    setIsPasscodeDialogOpen(false);
    setPasscodeCallback(null);
    setCurrentNoteId(null);
  };

  const filteredNotes = useMemo(() => {
    if (!debouncedSearchQuery) {
      return initialNotes;
    }
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    return initialNotes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(lowercasedQuery);
      const contentMatch =
        !note.isLocked &&
        getTextFromEditorJS(note.content)
          .toLowerCase()
          .includes(lowercasedQuery);
      const tagMatch = note.tags?.some((tag) =>
        tag.toLowerCase().includes(lowercasedQuery),
      );
      return titleMatch || contentMatch || tagMatch;
    });
  }, [initialNotes, debouncedSearchQuery]);

  const sortedNotes = useMemo(() => {
    const sorted = [...filteredNotes].sort((a, b) => {
      const [key, order] = sortOption.split("-") as [
        keyof Note,
        "asc" | "desc",
      ];
      const valA = a[key] || 0;
      const valB = b[key] || 0;

      if (key === "title") {
        return String(valA).localeCompare(String(valB));
      }
      if (
        (key === "createdAt" || key === "updatedAt") &&
        (typeof valA === "number" || typeof valA === "string") &&
        (typeof valB === "number" || typeof valB === "string")
      ) {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }

      const numA = typeof valA === "number" ? valA : 0;
      const numB = typeof valB === "number" ? valB : 0;
      return order === "asc" ? numA - numB : numB - numA;
    });

    return sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [filteredNotes, sortOption]);

  if (isLoading && !hasFetched) {
    return <Loading />;
  }

  const onUnlockHandler = useCallback((noteId: string, cb: () => void) => {
      const note = initialNotes.find(n => n.id === noteId);
      if (!note) return;

      if(note.isLocked) {
        handleUnlockRequest(noteId, cb);
      } else {
        handleLockRequest(noteId, cb);
      }
  }, [initialNotes, handleUnlockRequest, handleLockRequest]);

  return (
    <div
      className={cn(
        "relative h-full space-y-8 p-4 sm:p-6 lg:pl-72 lg:p-8",
        font.split(" ")[0],
      )}
    >
      <NotesHeader
        sortOption={sortOption}
        setSortOption={setSortOption}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      {sortedNotes.length > 0 ? (
        viewMode === "grid" ? (
          <NotesGrid notes={sortedNotes} onUnlock={onUnlockHandler} />
        ) : (
          <NotesList notes={sortedNotes} onUnlock={onUnlockHandler} />
        )
      ) : (
        <EmptyState
          onNewNote={handleNewNote}
          onImportClick={handleImportClick}
          isSearching={!!debouncedSearchQuery}
        />
      )}
      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".json"
      />
      <PasscodeDialog
        isOpen={isPasscodeDialogOpen}
        onOpenChange={setIsPasscodeDialogOpen}
        onConfirm={handlePasscodeConfirm}
        isSettingNew={!passcode}
      />
    </div>
  );
}

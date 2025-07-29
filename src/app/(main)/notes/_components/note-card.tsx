"use client";

import React, { memo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/lib/types";
import { getTextFromEditorJS, cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotes } from "@/stores/use-notes";
import { MoreVertical, Edit, Trash2, Pin, PinOff, Tag, X } from "lucide-react";
import { toast } from "sonner";

interface NoteCardProps {
  note: Note;
}

function ManageTagsDialog({
  note,
  isOpen,
  onOpenChange,
}: {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const { updateNote } = useNotes();
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTags(note.tags || []);
  }, [note.tags]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!newTag) {
        toast.error("ট্যাগ খালি রাখা যাবে না।");
        return;
      }
      if (tags.includes(newTag)) {
        toast.error(`ট্যাগ "${newTag}" ইতিমধ্যে যোগ করা হয়েছে।`);
        return;
      }
      if (tags.length >= 5) {
        toast.error("আপনি সর্বোচ্চ ৫টি ট্যাগ যোগ করতে পারবেন।");
        return;
      }
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSaveTags = async () => {
    await updateNote(note.id, { tags });
    toast.success("ট্যাগ সফলভাবে সেভ হয়েছে।");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>"{note.title}" এর ট্যাগ পরিচালনা করুন</DialogTitle>
          <DialogDescription>
            এই নোটের জন্য ট্যাগ যোগ করুন বা সরান। Enter চেপে ট্যাগ যোগ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="নতুন ট্যাগ যোগ করুন..."
              className="pl-9"
            />
          </div>
          <div className="flex min-h-[48px] flex-wrap gap-2 rounded-md border p-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="rounded-full hover:bg-muted-foreground/20"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                কোনও ট্যাগ নেই।
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button onClick={handleSaveTags}>সেভ করুন</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NoteCardComponent({ note }: NoteCardProps) {
  const font = useSettingsStore((state) => state.font);
  const { trashNote, updateNote, togglePin, notes } = useNotes();
  const fontClass = font.split(" ")[0];

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (note.updatedAt) {
      setFormattedDate(
        formatDistanceToNow(new Date(note.updatedAt), {
          addSuffix: true,
          locale: bn,
        }),
      );
    }
  }, [note.updatedAt]);

  const contentPreview = React.useMemo(() => {
    const text = getTextFromEditorJS(note.content);
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  }, [note.content]);

  const handleTrash = () => {
    trashNote(note.id);
    toast.success("নোটটি ট্র্যাশে পাঠানো হয়েছে।");
  };

  const handleTogglePin = () => {
    const pinnedNotesCount = notes.filter((n) => n.isPinned).length;
    if (!note.isPinned && pinnedNotesCount >= 3) {
      toast.error("আপনি সর্বোচ্চ ৩টি নোট পিন করতে পারবেন।");
      return;
    }
    togglePin(note.id);
    toast.success(
      note.isPinned ? "নোটটি আনপিন করা হয়েছে।" : "নোটটি পিন করা হয়েছে।",
    );
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("শিরোনাম খালি রাখা যাবে না।");
      return;
    }
    await updateNote(note.id, { title: newTitle });
    setIsRenameOpen(false);
    toast.success("নোট রিনেম করা হয়েছে।");
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  return (
    <>
      <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="h-full"
      >
        <Card
          className={cn(
            "flex h-full flex-col border-2 transition-all duration-300 ease-in-out hover:shadow-2xl",
            note.isPinned
              ? "border-primary/50 shadow-primary/20"
              : "border-transparent",
            fontClass,
          )}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center gap-2">
                {note.isPinned && (
                  <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
                <CardTitle className="line-clamp-1 text-xl font-semibold">
                  <Link href={`/editor/${note.id}`} className="hover:underline">
                    {note.title || "শিরোনামহীন নোট"}
                  </Link>
                </CardTitle>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onSelect={handleTogglePin}>
                  {note.isPinned ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" />
                      <span>আনপিন করুন</span>
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" />
                      <span>পিন করুন</span>
                    </>
                  )}
                </DropdownMenuItem>

                <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>রিনেম করুন</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>নোট রিনেম করুন</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRename}>
                      <div className="grid gap-4 py-4">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="নতুন শিরোনাম"
                          autoFocus
                        />
                      </div>
                      <Button type="submit">সেভ করুন</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <DropdownMenuItem onSelect={() => setIsTagsOpen(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  <span>ট্যাগ এডিট করুন</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>ট্র্যাশে পাঠান</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                      <AlertDialogDescription>
                        এই নোটটি ট্র্যাশে পাঠানো হবে। আপনি ট্র্যাশ থেকে এটি
                        পুনরুদ্ধার করতে পারবেন।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleTrash}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        ট্র্যাশে পাঠান
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <Link
            href={`/editor/${note.id}`}
            className="block h-full flex-grow p-6 pt-0"
          >
            <CardContent className="space-y-4 p-0">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {contentPreview || "কোনও অতিরিক্ত বিষয়বস্তু নেই।"}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Link>
          <CardFooter className="flex justify-end p-6 pt-0 text-xs text-muted-foreground">
            <span>{formattedDate}</span>
          </CardFooter>
        </Card>
      </motion.div>
      <ManageTagsDialog
        note={note}
        isOpen={isTagsOpen}
        onOpenChange={setIsTagsOpen}
      />
    </>
  );
}

export const NoteCard = memo(NoteCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    JSON.stringify(prevProps.note.content) ===
      JSON.stringify(nextProps.note.content) &&
    JSON.stringify(prevProps.note.tags) === JSON.stringify(nextProps.note.tags)
  );
});
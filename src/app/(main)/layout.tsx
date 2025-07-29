"use client";

import React, { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import ScrollProgress from "@/components/ui/scroll-progress";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotes } from "@/stores/use-notes";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ExpandableFab } from "@/components/ui/expandable-fab";
import { toast } from "sonner";
import BottomNav from "@/components/layout/bottom-nav";
import { importNotes } from "@/lib/storage";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const font = useSettingsStore((state) => state.font);
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor/");
  const router = useRouter();
  const { createNote, addImportedNotes } = useNotes();
  const importInputRef = React.useRef<HTMLInputElement>(null);

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

  const fabActions = [
    { label: "নতুন নোট", action: handleNewNote, icon: "FilePlus" },
    { label: "নোট ইম্পোর্ট করুন", action: handleImportClick, icon: "Upload" },
  ];

  return (
    <div className="flex h-full bg-background">
      <ScrollProgress />
      <AnimatePresence>
        {!isEditorPage && <Sidebar />}
      </AnimatePresence>
      <div className={cn("flex-1", !isEditorPage && "lg:pl-72")}>
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 h-full">
          {children}
        </main>
      </div>
      <AnimatePresence>
        {!isEditorPage && (
          <>
            <BottomNav actions={fabActions} />
            <ExpandableFab actions={fabActions} />
          </>
        )}
      </AnimatePresence>
      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".json"
      />
    </div>
  );
}

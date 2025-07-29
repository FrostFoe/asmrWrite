"use client";

import React, { useCallback } from "react";
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const font = useSettingsStore((state) => state.font);
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor/");
  const router = useRouter();
  const { createNote } = useNotes();

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

  return (
    <div className="flex h-full bg-background">
      <ScrollProgress />
      <Sidebar />
      <div className={cn("flex-1", "lg:pl-72")}>
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 h-full">
          {children}
        </main>
      </div>
      <AnimatePresence>
        {!isEditorPage && (
          <>
            <BottomNav onNewNote={handleNewNote} />
            <ExpandableFab onNewNote={handleNewNote} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import Sidebar from "@/components/layout/sidebar";
import ScrollProgress from "@/components/ui/scroll-progress";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const font = useSettingsStore((state) => state.font);
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor/");

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
        {!isEditorPage && <BottomNav />}
      </AnimatePresence>
    </div>
  );
}

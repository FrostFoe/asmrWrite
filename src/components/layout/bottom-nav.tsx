"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Trash2, BarChart, FilePlus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useRouter } from "next/navigation";
import { useNotes } from "@/stores/use-notes";
import { toast } from "sonner";

const navItems = [
  { href: "/notes", label: "নোট", icon: Home },
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: BarChart },
  { href: "new-note", label: "নতুন", icon: FilePlus, isAction: true },
  { href: "/trash", label: "ট্র্যাশ", icon: Trash2 },
  { href: "/settings", label: "সেটিংস", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];
  const router = useRouter();
  const { createNote } = useNotes();

  const handleNewNote = async (e: React.MouseEvent) => {
    e.preventDefault();
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
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm lg:hidden"
    >
      <nav className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive =
            item.href === "/notes"
              ? pathname === item.href
              : !item.isAction && pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={handleNewNote}
                className="flex h-12 w-12 -translate-y-4 flex-col items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90"
              >
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              href={item.href}
              key={item.label}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors",
                isActive
                  ? `text-primary ${fontClass}`
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-item"
                  className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
}

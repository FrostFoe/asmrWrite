"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Trash2, LayoutDashboard, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/notes", label: "নোট", icon: Home },
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
];

const navItemsRight = [
  { href: "/trash", label: "ট্র্যাশ", icon: Trash2 },
  { href: "/settings", label: "সেটিংস", icon: Settings },
];

export default function BottomNav({ onNewNote }: { onNewNote: () => void }) {
  const pathname = usePathname();
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];

  const NavLink = ({
    item,
  }: {
    item: { href: string; label: string; icon: React.ElementType };
  }) => {
    const isActive =
      (item.href === "/notes" &&
        (pathname === "/notes" || pathname.startsWith("/editor"))) ||
      (item.href !== "/notes" && pathname.startsWith(item.href));

    return (
      <Link
        href={item.href}
        key={item.label}
        className={cn(
          "relative flex flex-col items-center justify-center gap-1 p-2 text-xs transition-colors w-16 h-16",
          isActive
            ? `text-primary ${fontClass}`
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-center pb-[env(safe-area-inset-bottom)] relative">
        <nav className="flex items-center justify-around w-full">
          <div className="flex justify-around" style={{ flex: 1 }}>
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          <div className="relative -top-4">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                className="h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                size="icon"
                onClick={onNewNote}
                aria-label="Create new note"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </motion.div>
          </div>

          <div className="flex justify-around" style={{ flex: 1 }}>
            {navItemsRight.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

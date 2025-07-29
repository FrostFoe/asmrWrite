"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Trash2, BarChart, Plus, Upload, FilePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/notes", label: "নোট", icon: Home },
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: BarChart },
];

const navItemsRight = [
  { href: "/trash", label: "ট্র্যাশ", icon: Trash2 },
  { href: "/settings", label: "সেটিংস", icon: Settings },
];

const icons: { [key: string]: React.ElementType } = {
  FilePlus,
  Upload,
};

interface FabAction {
  label: string;
  icon: string;
  action: () => void;
}

export default function BottomNav({ actions }: { actions: FabAction[] }) {
  const pathname = usePathname();
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];
  const [isOpen, setIsOpen] = useState(false);

  const staggerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: 1,
      },
    },
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  const mainButtonVariants = {
    open: { rotate: 45 },
    closed: { rotate: 0 },
  };

  const NavLink = ({ item }: { item: { href: string, label: string, icon: React.ElementType } }) => {
    const isActive =
      item.href === "/notes"
        ? pathname === item.href
        : pathname.startsWith(item.href);
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
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={staggerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center space-y-4 lg:hidden"
          >
            {actions.map((action) => {
              const IconComponent = icons[action.icon];
              return (
                <motion.div
                  key={action.label}
                  variants={itemVariants}
                  className="flex flex-col-reverse items-center space-y-2"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                >
                   <Button
                    className="h-12 w-12 rounded-full shadow-md"
                    variant="secondary"
                    size="icon"
                  >
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                  </Button>
                  <span className="bg-card text-card-foreground text-sm font-medium py-1 px-3 rounded-md shadow-sm border">
                    {action.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm lg:hidden"
      >
        <div className="flex h-16 items-center justify-center pb-[env(safe-area-inset-bottom)] relative">
          <nav className="flex items-center justify-around w-full">
            <div className="flex justify-around" style={{ flex: 1 }}>
              {navItems.map((item) => <NavLink key={item.href} item={item} />)}
            </div>

            <div className="relative -top-4">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  className={cn(
                    "h-16 w-16 rounded-full shadow-lg transition-colors duration-300",
                    isOpen
                      ? "bg-destructive hover:bg-destructive/90"
                      : "bg-primary hover:bg-primary/90",
                  )}
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? "Close actions" : "Open actions"}
                >
                  <motion.div
                    variants={mainButtonVariants}
                    animate={isOpen ? "open" : "closed"}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="h-8 w-8" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>

            <div className="flex justify-around" style={{ flex: 1 }}>
              {navItemsRight.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

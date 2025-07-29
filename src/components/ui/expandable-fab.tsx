"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandableFabProps {
  onNewNote: () => void;
}

export function ExpandableFab({ onNewNote }: ExpandableFabProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50 hidden flex-col items-end lg:flex">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          className="h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90"
          size="icon"
          onClick={onNewNote}
          aria-label="Create new note"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </motion.div>
    </div>
  );
}

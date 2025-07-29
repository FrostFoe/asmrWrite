"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

function EmptyTrashState() {
  const iconVariants = {
    hidden: { scale: 0.5, rotate: -15, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/50 p-8 text-center"
    >
      <motion.div
        variants={iconVariants}
        initial="hidden"
        animate="visible"
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <Trash2 className="h-8 w-8 text-primary" />
      </motion.div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        ট্র্যাশ খালি
      </h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        আপনি যখন কোনো নোট ডিলিট করবেন, তখন সেটি এখানে এসে জমা হবে।
      </p>
    </motion.div>
  );
}
export default EmptyTrashState;

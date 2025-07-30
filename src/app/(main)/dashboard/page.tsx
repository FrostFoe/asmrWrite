"use client";

import { useMemo } from "react";
import { Book, Tag, Type, Flame, Target, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  isToday,
  isWithinInterval,
  subDays,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";

import { useNotes } from "@/stores/use-notes";
import { useSettingsStore } from "@/stores/use-settings";
import { cn } from "@/lib/utils";
import Loading from "@/app/loading";
import StatCard from "./_components/stat-card";
import ChallengeCard from "./_components/challenge-card";

const getWordCount = (note: any): number => {
  if (!note.content || !note.content.blocks) return 0;
  return (
    note.content.blocks
      .map((block: any) => block.data.text || "")
      .join(" ") || ""
  )
    .split(/\s+/)
    .filter(Boolean).length;
};

export default function DashboardPage() {
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];
  const notes = useNotes((state) => state.notes);
  const isLoading = useNotes((state) => state.isLoading);

  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((acc, note) => acc + getWordCount(note), 0);

    const tagCounts: { [key: string]: number } = {};
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const wordsToday = notes
      .filter((note) => isToday(new Date(note.updatedAt)))
      .reduce((acc, note) => acc + getWordCount(note), 0);

    const notesThisWeek = notes.filter((note) =>
      isWithinInterval(new Date(note.createdAt), {
        start: subDays(new Date(), 6),
        end: new Date(),
      }),
    ).length;

    const uniqueDays = [
      ...new Set(
        notes.map((note) => startOfDay(new Date(note.updatedAt)).toISOString()),
      ),
    ]
      .map((dateString) => new Date(dateString))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    if (uniqueDays.length > 0) {
      const today = startOfDay(new Date());
      const isWritingToday =
        uniqueDays.findIndex(
          (d) => d.getTime() === today.getTime(),
        ) !== -1;
      if (isWritingToday || differenceInCalendarDays(today, uniqueDays[0]) === 1) {
        streak = 1;
        for (let i = 0; i < uniqueDays.length - 1; i++) {
          const diff = differenceInCalendarDays(uniqueDays[i], uniqueDays[i + 1]);
          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
        if(!isWritingToday && differenceInCalendarDays(today, uniqueDays[0]) > 1) streak = 0;
      }
    }


    return {
      totalNotes,
      totalWords,
      totalTags: Object.keys(tagCounts).length,
      wordsToday,
      notesThisWeek,
      writingStreak: streak,
    };
  }, [notes]);

  if (isLoading) {
    return <Loading />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="h-full space-y-8 p-4 sm:p-6 lg:pl-72 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          ড্যাশবোর্ড
        </h1>
        <p className="mt-2 text-muted-foreground">
          আপনার লেখার পরিসংখ্যান ও অগ্রগতি দেখুন।
        </p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="মোট নোট" value={stats.totalNotes} icon={Book} />
        <StatCard
          title="মোট শব্দ"
          value={stats.totalWords.toLocaleString()}
          icon={Type}
        />
        <StatCard title="আজকের শব্দ" value={stats.wordsToday.toLocaleString()} icon={Target} />
        <StatCard title="ব্যবহৃত ট্যাগ" value={stats.totalTags} icon={Tag} />
      </motion.div>

      <div className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          আপনার চ্যালেঞ্জসমূহ
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <ChallengeCard
            icon={Target}
            title="দৈনিক শব্দচয়ন"
            description="আপনার দৈনিক লেখার লক্ষ্য পূরণ করুন।"
            currentValue={stats.wordsToday}
            targetValue={100}
            unit="শব্দ"
          />
          <ChallengeCard
            icon={Award}
            title="সাপ্তাহিক নোট যাত্রা"
            description="এই সপ্তাহে নতুন নোট তৈরি করে আপনার জ্ঞান ভান্ডার সমৃদ্ধ করুন।"
            currentValue={stats.notesThisWeek}
            targetValue={5}
            unit="নোট"
          />
          <ChallengeCard
            icon={Flame}
            title="টানা লেখার ধারা"
            description="প্রতিদিন লিখে আপনার লেখার অভ্যাসকে আরও শক্তিশালী করুন।"
            currentValue={stats.writingStreak}
            targetValue={7}
            unit="দিন"
          />
        </motion.div>
      </div>
    </div>
  );
}

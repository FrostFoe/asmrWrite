"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChallengeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

function ChallengeCard({
  icon: Icon,
  title,
  description,
  currentValue,
  targetValue,
  unit,
}: ChallengeCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={cardVariants}>
      <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Icon className="h-8 w-8 text-primary" />
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div>
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span className="text-primary">
                {currentValue.toLocaleString()} / {targetValue.toLocaleString()}{" "}
                {unit}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ChallengeCard;

    
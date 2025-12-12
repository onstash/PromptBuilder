import { motion } from "motion/react";

interface SocialProofProps {
  show?: boolean;
}

export function SocialProof({ show = false }: SocialProofProps) {
  if (!show) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-6 px-6 bg-foreground text-background"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm md:text-base font-mono uppercase tracking-wide">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary" />
            Works with ChatGPT
          </span>
          <span className="hidden md:inline text-muted-foreground">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary" />
            Works with Claude
          </span>
          <span className="hidden md:inline text-muted-foreground">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent" />
            Works with Gemini
          </span>
        </div>
      </div>
    </motion.section>
  );
}

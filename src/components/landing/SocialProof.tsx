import { motion } from "motion/react";
import { Bot, Sparkles, Zap } from "lucide-react";

interface SocialProofProps {
  show?: boolean;
}

export function SocialProof({ show = false }: SocialProofProps) {
  if (!show) return null;

  return (
    <section className="py-12 px-6 bg-muted border-y-4 border-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <Bot className="w-8 h-8 text-primary mb-2" />
            <span className="text-lg md:text-xl font-black text-foreground">
              Works with ChatGPT, Claude & Gemini
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <Zap className="w-8 h-8 text-secondary mb-2" />
            <span className="text-lg md:text-xl font-black text-foreground">
              No signup required
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <Sparkles className="w-8 h-8 text-accent mb-2" />
            <span className="text-lg md:text-xl font-black text-foreground">Free forever</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

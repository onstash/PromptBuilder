import { motion } from "motion/react";
import { Zap, Users, Sparkles } from "lucide-react";

interface SocialProofProps {
  show?: boolean;
}

export function SocialProof({ show = false }: SocialProofProps) {
  if (!show) return null;

  return (
    <section className="py-16 px-6 bg-muted border-y-4 border-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <Zap className="w-8 h-8 text-primary mb-2" />
            <span className="text-3xl md:text-4xl font-black text-foreground">10K+</span>
            <span className="text-sm text-muted-foreground font-mono uppercase">
              Prompts Generated
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <Users className="w-8 h-8 text-secondary mb-2" />
            <span className="text-3xl md:text-4xl font-black text-foreground">2K+</span>
            <span className="text-sm text-muted-foreground font-mono uppercase">Developers</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <Sparkles className="w-8 h-8 text-accent mb-2" />
            <span className="text-3xl md:text-4xl font-black text-foreground">5★</span>
            <span className="text-sm text-muted-foreground font-mono uppercase">Rating</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

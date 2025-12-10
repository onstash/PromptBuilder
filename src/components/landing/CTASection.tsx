import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Icon */}
        <div className="inline-flex p-4 bg-background border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] mb-8">
          <Rocket className="w-8 h-8 text-foreground" />
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-primary-foreground mb-6 uppercase tracking-tight">
          Ready to Build
          <span className="block text-background">Better Prompts?</span>
        </h2>

        <p className="text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
          Join developers and creators using our prompt builder to get better AI
          responses.
        </p>

        <Button
          asChild
          size="lg"
          variant="secondary"
          className="text-lg px-10 py-6 h-auto uppercase font-black tracking-wide"
        >
          <Link to="/prompt-builder/basic" className="flex items-center gap-2">
            Get Started Free
            <Rocket className="w-5 h-5" />
          </Link>
        </Button>

        <p className="mt-6 text-sm text-primary-foreground/60 font-mono uppercase tracking-wider">
          No signup • No credit card • Start in seconds
        </p>
      </motion.div>
    </section>
  );
}

import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Decorative shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]" />
      <div className="absolute bottom-32 right-20 w-24 h-24 bg-secondary border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-accent border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] rotate-12" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] font-mono text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wider font-bold">
              Professional Prompt Engineering
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-8xl font-black text-foreground mb-6 leading-none tracking-tight uppercase">
            Build Better
            <span className="block text-primary">AI Prompts</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
            Transform your ideas into powerful, structured prompts. No expertise
            required — just configure and go.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 h-auto uppercase font-bold tracking-wide"
            >
              <Link
                to="/prompt-builder/basic"
                className="flex items-center gap-2"
              >
                Start Building
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto uppercase font-bold tracking-wide"
            >
              <a href="#features">See Features</a>
            </Button>
          </div>

          {/* Trust signal */}
          <p className="mt-8 text-sm text-muted-foreground font-mono uppercase tracking-wider">
            ✦ No signup required • Start instantly • 100% free ✦
          </p>
        </motion.div>

        {/* Brutalist preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 relative"
        >
          <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-6">
            <div className="flex gap-2 mb-4">
              <div className="w-4 h-4 bg-primary border-2 border-foreground" />
              <div className="w-4 h-4 bg-secondary border-2 border-foreground" />
              <div className="w-4 h-4 bg-accent border-2 border-foreground" />
            </div>
            <div className="space-y-3 text-left font-mono">
              <div className="h-4 w-3/4 bg-primary" />
              <div className="h-4 w-1/2 bg-muted" />
              <div className="h-4 w-5/6 bg-muted" />
              <div className="h-4 w-2/3 bg-muted" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

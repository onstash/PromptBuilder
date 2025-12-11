import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Decorative shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-primary border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hidden md:block" />
      <div className="absolute bottom-32 right-20 w-20 h-20 bg-secondary border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hidden md:block" />
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-accent border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] rotate-12 hidden md:block" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Headline */}
          <h1 className="text-5xl md:text-8xl font-black text-foreground mb-6 leading-none tracking-tight uppercase">
            Build Better
            <span className="block text-primary">AI Prompts</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Professional prompt engineering made simple. Configure, generate,
            copy.
          </p>

          {/* Single CTA */}
          <Button
            asChild
            size="lg"
            className="text-lg px-10 py-7 h-auto uppercase font-black tracking-wide"
          >
            <Link
              to="/wizard"
              search={{ d: null, vld: 0 }}
              className="flex items-center gap-3"
            >
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          {/* Trust Signal */}
          <p className="mt-6 text-sm text-muted-foreground font-mono">
            Free • No signup • Start in seconds
          </p>
        </motion.div>

        {/* Problem Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12"
        >
          <p className="text-sm text-muted-foreground font-mono mb-4 uppercase tracking-wider">
            The problem with typical prompts:
          </p>
          <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-6 text-left">
            <div className="flex gap-2 mb-4">
              <div className="w-4 h-4 bg-destructive border-2 border-foreground" />
              <div className="w-4 h-4 bg-muted border-2 border-foreground" />
              <div className="w-4 h-4 bg-muted border-2 border-foreground" />
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="text-muted-foreground line-through">
                "Write me a React component for a dashboard"
              </div>
              <div className="text-destructive text-xs">
                ✗ Vague • No context • Inconsistent results
              </div>
            </div>
          </div>

          <div className="my-4 text-2xl font-black text-primary">↓</div>

          <p className="text-sm text-muted-foreground font-mono mb-4 uppercase tracking-wider">
            With Prompt Builder:
          </p>
          <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-6 text-left">
            <div className="flex gap-2 mb-4">
              <div className="w-4 h-4 bg-primary border-2 border-foreground" />
              <div className="w-4 h-4 bg-secondary border-2 border-foreground" />
              <div className="w-4 h-4 bg-accent border-2 border-foreground" />
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="text-foreground">
                <span className="text-primary">Role:</span> Senior Frontend
                Engineer
              </div>
              <div className="text-foreground">
                <span className="text-primary">Context:</span> React 18,
                TypeScript, Tailwind
              </div>
              <div className="text-foreground">
                <span className="text-primary">Task:</span> Dashboard with
                charts, dark mode
              </div>
              <div className="text-foreground">
                <span className="text-primary">Output:</span> Step-by-step with
                code
              </div>
              <div className="mt-3 text-primary">
                ✓ Structured • Consistent • Professional results
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";
import { MousePointer, Sliders, Copy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointer,
    title: "Choose",
    description: "Select General Purpose or Frontend Engineering mode.",
    color: "bg-primary",
  },
  {
    number: "02",
    icon: Sliders,
    title: "Configure",
    description: "Tell the AI exactly what you need with simple controls.",
    color: "bg-secondary",
  },
  {
    number: "03",
    icon: Copy,
    title: "Generate",
    description: "Get your optimized prompt instantly and copy it.",
    color: "bg-accent",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 uppercase tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to create professional prompts.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step number */}
              <div
                className={`inline-flex items-center justify-center w-20 h-20 ${step.color} border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] mb-6`}
              >
                <step.icon className="w-8 h-8 text-foreground" />
              </div>

              {/* Content */}
              <div className="bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6">
                <span className="text-primary font-mono text-sm font-bold">STEP {step.number}</span>
                <h3 className="text-2xl font-black text-foreground mt-2 mb-3 uppercase">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-4 text-4xl text-foreground font-black">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";
import { MousePointer, Sliders, Copy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointer,
    title: "Choose Your Use Case",
    description:
      "Select General Purpose or Frontend Engineering mode based on your needs.",
  },
  {
    number: "02",
    icon: Sliders,
    title: "Configure Settings",
    description:
      "Customize context, reasoning depth, tone, and output preferences.",
  },
  {
    number: "03",
    icon: Copy,
    title: "Generate & Copy",
    description:
      "Get your optimized prompt instantly and copy it to your clipboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-400">
            Three simple steps to create professional prompts.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-pink-500/40 to-cyan-500/20 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center group"
              >
                {/* Step number badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-lg mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <span className="text-purple-400 font-mono text-sm">
                    Step {step.number}
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-2 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

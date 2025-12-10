import { motion } from "motion/react";
import { Code, FileText, Lightbulb, GraduationCap } from "lucide-react";

const useCases = [
  {
    icon: Code,
    title: "Code Generation",
    description:
      "Generate React components, APIs, and utilities with best practices baked in.",
    example: '"Create a responsive navbar with dark mode toggle..."',
    color: "cyan",
  },
  {
    icon: FileText,
    title: "Content Writing",
    description:
      "Craft blog posts, documentation, and marketing copy that resonates.",
    example: '"Write a technical guide for setting up..."',
    color: "pink",
  },
  {
    icon: Lightbulb,
    title: "Problem Solving",
    description:
      "Get structured, step-by-step solutions to complex challenges.",
    example: '"Debug this performance issue in my app..."',
    color: "amber",
  },
  {
    icon: GraduationCap,
    title: "Learning & Research",
    description:
      "Deep-dive into technical topics with comprehensive explanations.",
    example: '"Explain React Server Components in depth..."',
    color: "purple",
  },
];

const colorClasses = {
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function UseCases() {
  return (
    <section className="py-24 px-6 bg-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Built for Every Use Case
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Whether you're coding, writing, or learning — we've got you covered.
          </p>
        </motion.div>

        {/* Use cases grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`p-3 rounded-xl border ${colorClasses[useCase.color as keyof typeof colorClasses]}`}
                >
                  <useCase.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {useCase.description}
                  </p>
                  <div className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700/50">
                    <code className="text-xs text-slate-300 font-mono">
                      {useCase.example}
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

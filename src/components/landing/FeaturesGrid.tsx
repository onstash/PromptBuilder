import { motion } from "motion/react";
import { Target, Settings2, Code2, Eye } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Smart Context Gathering",
    description:
      "Structure your context for optimal AI understanding and responses.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Settings2,
    title: "Advanced Controls",
    description: "Fine-tune reasoning depth, tone, output format, and more.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Code2,
    title: "Frontend Engineering Mode",
    description:
      "Specialized prompts for React, TypeScript, and web development.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See your prompt as you build it with instant live updates.",
    gradient: "from-amber-500 to-orange-500",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features to help you craft the perfect prompt every time.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

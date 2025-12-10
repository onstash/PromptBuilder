import { motion } from "motion/react";
import { Code, FileText, Lightbulb, GraduationCap } from "lucide-react";

const useCases = [
  {
    icon: Code,
    title: "Code Generation",
    description:
      "Generate React components, APIs, and utilities with best practices.",
    example: "Create a responsive navbar...",
    color: "bg-primary",
  },
  {
    icon: FileText,
    title: "Content Writing",
    description: "Craft blog posts, docs, and marketing copy that resonates.",
    example: "Write a technical guide...",
    color: "bg-secondary",
  },
  {
    icon: Lightbulb,
    title: "Problem Solving",
    description: "Get structured, step-by-step solutions to challenges.",
    example: "Debug this performance issue...",
    color: "bg-accent",
  },
  {
    icon: GraduationCap,
    title: "Learning",
    description: "Deep-dive into technical topics with explanations.",
    example: "Explain React Server Components...",
    color: "bg-primary",
  },
];

export function UseCases() {
  return (
    <section className="py-24 px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 uppercase tracking-tight">
            Use Cases
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
              className="bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`p-3 ${useCase.color} border-4 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]`}
                >
                  <useCase.icon className="w-6 h-6 text-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-black text-foreground mb-2 uppercase">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {useCase.description}
                  </p>
                  <div className="px-4 py-2 bg-muted border-2 border-foreground font-mono text-sm">
                    "{useCase.example}"
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

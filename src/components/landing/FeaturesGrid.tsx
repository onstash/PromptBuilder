import { motion } from "motion/react";
import { Target, Settings2, Code2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Smart Context",
    description: "Structure your context for optimal AI understanding.",
    color: "bg-primary",
  },
  {
    icon: Settings2,
    title: "Advanced Controls",
    description: "Fine-tune reasoning depth, tone, and output format.",
    color: "bg-secondary",
  },
  {
    icon: Code2,
    title: "Frontend Mode",
    description: "Specialized prompts for React, TypeScript & web dev.",
    color: "bg-accent",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "See your prompt as you build it with instant updates.",
    color: "bg-primary",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 uppercase tracking-tight">
            Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you craft the perfect prompt.
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
            >
              <Card className="group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_hsl(var(--foreground))] transition-all duration-200">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 ${feature.color} border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-foreground mb-2 uppercase">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

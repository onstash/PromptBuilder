import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { EXAMPLE_PROMPTS, getExampleUrl } from "@/data/example-prompts";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";

export function ExamplesShowcase() {
  const trackEvent = useTrackMixpanel();

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 uppercase tracking-tight">
            Try an Example
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Click any example to see it in action. Edit and make it yours.
          </p>
        </motion.div>

        {/* Examples grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLE_PROMPTS.map((example, index) => {
            const searchParams = getExampleUrl(example);

            return (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to="/wizard"
                  search={searchParams}
                  onClick={() => {
                    trackEvent("example_clicked", {
                      page: "landing",
                      example_id: example.id,
                      example_title: example.title,
                    });
                  }}
                  className="group block h-full bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all duration-200 flex flex-col"
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 ${example.color} border-4 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] mb-4`}
                  >
                    <example.icon className="w-6 h-6 text-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-black text-foreground mb-2 uppercase">
                    {example.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    {example.description}
                  </p>

                  {/* Try it link */}
                  <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold group-hover:gap-3 transition-all mt-auto">
                    Try it
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Decorative gradient blob */}
        <div className="relative">
          <div className="absolute inset-0 -top-20 flex items-center justify-center">
            <div className="w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 mb-8">
              <Rocket className="w-8 h-8 text-purple-400" />
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Build
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Better Prompts?
              </span>
            </h2>

            <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
              Join thousands of developers and creators using our prompt builder
              to get better AI responses.
            </p>

            <Link
              to="/prompt-builder/basic"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
            >
              Get Started Free
              <Rocket className="w-5 h-5" />
            </Link>

            <p className="mt-6 text-sm text-slate-500">
              No signup required • No credit card • Start in seconds
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

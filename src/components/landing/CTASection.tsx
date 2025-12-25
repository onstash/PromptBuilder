import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";

export function CTASection() {
  const trackEvent = useTrackMixpanel();
  return (
    <section className="py-20 px-6 bg-primary">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black text-primary-foreground mb-6 uppercase tracking-tight">
          Ready to try it?
        </h2>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="text-lg px-10 py-7 h-auto uppercase font-black tracking-wide"
          onClick={() => {
            trackEvent("button_clicked_cta_landing_get_started_for_free");
          }}
        >
          <Link to="/wizard" search={{ d: null, vld: 0 }} className="flex items-center gap-3">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

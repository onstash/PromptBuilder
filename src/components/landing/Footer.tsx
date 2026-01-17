import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-6 px-6 bg-foreground text-background">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-mono flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by{" "}
          <a
            href="https://x.com/shtosan?utm=https://prompt-builder-ten-xi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            hastons
          </a>
        </p>
      </div>
    </footer>
  );
}

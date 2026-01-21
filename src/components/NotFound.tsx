import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-8">
          <h1 className="text-6xl font-black text-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold uppercase mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button asChild size="lg" className="w-full uppercase font-bold text-md">
            <Link to="/" reloadDocument>
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

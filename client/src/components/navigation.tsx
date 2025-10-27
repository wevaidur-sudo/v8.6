import { Sparkles, BookOpen, Save, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/calculate", label: "Calculate Kundli", icon: Sparkles },
    { path: "/saved", label: "Saved Charts", icon: Save },
    { path: "/learn", label: "Learn", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover-elevate rounded-md px-3 py-2 -ml-3" data-testid="link-home">
            {/* Sri Yantra Icon */}
            <div className="w-8 h-8 relative">
              <svg viewBox="0 0 40 40" className="text-primary">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path
                  d="M 20 2 L 20 38 M 2 20 L 38 20"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              </svg>
            </div>
            <span className="text-2xl font-serif font-bold text-foreground">
              ParāSara-X
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid={`link-${item.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            data-testid="button-mobile-menu"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
}

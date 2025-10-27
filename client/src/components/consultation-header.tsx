import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConsultationHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-[#0a0a1a]/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: App Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 40 40" className="text-primary">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
                <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
                <path
                  d="M 20 2 L 20 38 M 2 20 L 38 20"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
                {/* Sacred geometry triangles */}
                <path
                  d="M 20 8 L 28 24 L 12 24 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold text-foreground">
                ParāSara-X
              </span>
              <span className="text-xs text-primary/70 tracking-wide">
                Vedic Astrologer
              </span>
            </div>
          </div>

          {/* Center: Tagline (hidden on mobile) */}
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground tracking-wide">
              Professional Vedic Intelligence
            </p>
          </div>

          {/* Right: Settings */}
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Settings className="w-5 h-5 text-primary/70" />
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Sparkles } from "lucide-react";

export function SageAvatar() {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      {/* Avatar Circle with Sacred Geometry */}
      <div className="relative w-40 h-40 mb-6">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-slow" />
        
        {/* Main avatar container */}
        <div className="relative w-full h-full rounded-full border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm overflow-hidden">
          {/* Inner sacred geometry */}
          <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full opacity-30">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgb(212, 175, 55)" strokeWidth="1" />
            <circle cx="80" cy="80" r="50" fill="none" stroke="rgb(212, 175, 55)" strokeWidth="0.8" />
            <circle cx="80" cy="80" r="30" fill="none" stroke="rgb(212, 175, 55)" strokeWidth="0.6" />
            {/* Lotus petals pattern */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8;
              const rad = (angle * Math.PI) / 180;
              const x = 80 + 60 * Math.cos(rad);
              const y = 80 + 60 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1="80"
                  y1="80"
                  x2={x}
                  y2={y}
                  stroke="rgb(212, 175, 55)"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              );
            })}
          </svg>
          
          {/* Central icon/symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-primary animate-pulse-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Orbital rings */}
        <div className="absolute -inset-2 rounded-full border border-primary/20 animate-spin-slow" />
        <div className="absolute -inset-4 rounded-full border border-primary/10 animate-spin-reverse" />
      </div>

      {/* Sage Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Sage Parashara
        </h2>
        <div className="flex items-center justify-center gap-2 text-primary/80">
          <div className="h-px w-8 bg-primary/40" />
          <p className="text-sm tracking-widest uppercase">
            Celestial Guide
          </p>
          <div className="h-px w-8 bg-primary/40" />
        </div>
      </div>

      {/* Mudra/Gesture indication */}
      <div className="mt-4 text-xs text-muted-foreground text-center max-w-md">
        <p className="italic">
          "Through the cosmic dance of the grahas, I shall illuminate your path"
        </p>
      </div>
    </div>
  );
}

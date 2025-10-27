import { Button } from "@/components/ui/button";
import { Sparkles, Stars } from "lucide-react";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Cosmic_nebula_hero_background_905cfb59.png";

export default function HomePage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Cosmic nebula"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
          
          {/* Subtle Sri Yantra watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <svg
              width="600"
              height="600"
              viewBox="0 0 200 200"
              className="animate-twinkle"
            >
              {/* Simplified sacred geometry pattern */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </svg>
          </div>

          {/* Twinkling stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              >
                <Stars className="w-2 h-2 text-primary" />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="space-y-8 animate-fade-in">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground">
                ParāSara-X
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light tracking-wide">
              Professional Vedic Astrology Software
            </p>

            {/* Trust Indicator */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card/30 backdrop-blur-lg border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm md:text-base text-muted-foreground">
                Unmatched Calculation Accuracy & Technical Depth
              </span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button
                size="lg"
                className="text-lg px-12 py-6 h-auto animate-glow-pulse hover-elevate active-elevate-2"
                data-testid="button-generate-kundli"
                onClick={() => navigate("/consult")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Consult Sage Parashara
              </Button>
            </div>

            {/* Additional Info */}
            <p className="text-sm text-muted-foreground pt-8 max-w-2xl mx-auto">
              Experience personalized Vedic astrology consultations with Sage Parashara, powered by professional-grade
              calculations and classical interpretations from ancient texts. Your cosmic intelligence awaits.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full p-1">
            <div className="w-1.5 h-3 bg-primary rounded-full mx-auto animate-bounce" />
          </div>
        </div>
      </section>
    </div>
  );
}

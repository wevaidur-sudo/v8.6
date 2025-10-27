import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { BirthDetailForm } from "@/components/birth-detail-form";
import { ConsultationHeader } from "@/components/consultation-header";
import type { BirthData, Kundli } from "@shared/astro-schema";
import { generateKundli } from "@/lib/kundli-generator";

type ViewState = "birthForm" | "processing" | "complete";

export default function ConsultationPage() {
  const [, navigate] = useLocation();
  const [viewState, setViewState] = useState<ViewState>("birthForm");
  const [isProcessing, setIsProcessing] = useState(false);
  const [kundliData, setKundliData] = useState<Kundli | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, [viewState]);

  const handleBirthDataSubmit = async (birthDataInput: BirthData) => {
    setIsProcessing(true);
    setViewState("processing");

    setTimeout(async () => {
      try {
        const kundli = await generateKundli(birthDataInput);
        setKundliData(kundli);
        
        // Save to localStorage
        const savedKundlis = localStorage.getItem("kundlis");
        const kundlis: Kundli[] = savedKundlis ? JSON.parse(savedKundlis) : [];
        kundlis.push(kundli);
        localStorage.setItem("kundlis", JSON.stringify(kundlis));
        
        // Navigate to results
        navigate(`/kundli/${kundli.id}`);
      } catch (error) {
        console.error("Error generating kundli:", error);
        setIsProcessing(false);
        setViewState("birthForm");
      }
    }, 1500);
  };

  const handleNewConsultation = () => {
    setViewState("birthForm");
    setKundliData(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
      {/* Professional Header */}
      <ConsultationHeader />

      {/* Cosmic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Twinkling stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Subtle zodiac wheel in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_120s_linear_infinite]">
            <circle cx="100" cy="100" r="95" fill="none" stroke="rgb(212, 175, 55)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgb(212, 175, 55)" strokeWidth="0.3" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="rgb(212, 175, 55)" strokeWidth="0.3" />
          </svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 relative z-10">
        {/* Content Area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto pb-32 space-y-8 px-4 pt-8">
          {/* Birth Form State */}
          {viewState === "birthForm" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Enter Your Birth Details
                </h2>
                <p className="text-muted-foreground">
                  Precise birth time and location are essential for accurate
                  astrological analysis
                </p>
              </div>
              <BirthDetailForm
                onSubmit={handleBirthDataSubmit}
                onCancel={handleNewConsultation}
              />
            </div>
          )}

          {/* Processing State */}
          {viewState === "processing" && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="bg-card/20 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-muted-foreground">
                    Calculating planetary positions and analyzing chart...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

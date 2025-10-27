import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ChartDisplay } from "@/components/chart-display";
import { PlanetaryData } from "@/components/planetary-data";
import { AllDashaSystems } from "@/components/all-dasha-systems";
import { Remedies } from "@/components/remedies";
import { TransitAnalysis } from "@/components/transit-analysis";
import { DivisionalCharts } from "@/components/divisional-charts";
import { EnhancedAshtakavargaDisplay } from "@/components/ashtakavarga-display-enhanced";
import { AnnualChart } from "@/components/annual-chart";
import { Navigation } from "@/components/navigation";
import { YogasDisplay } from "@/components/yogas-display";
import { type Kundli } from "@shared/astro-schema";
import { calculateCurrentTransits } from "@/lib/transit-calculations";
import { Download, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KundliResultsPage() {
  const [, params] = useRoute("/kundli/:id");
  const [, navigate] = useLocation();
  const [kundli, setKundli] = useState<Kundli | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load kundli from localStorage
    const loadKundli = () => {
      const savedKundlis = localStorage.getItem("kundlis");
      if (savedKundlis) {
        const kundlis: Kundli[] = JSON.parse(savedKundlis);
        const found = kundlis.find(k => k.id === params?.id);
        if (found) {
          // Parse date strings back to Date objects
          found.generatedAt = new Date(found.generatedAt);
          
          // Parse Vimshottari Dasha dates
          found.dashaSystem.mahadashas = found.dashaSystem.mahadashas.map(md => ({
            ...md,
            startDate: new Date(md.startDate),
            endDate: new Date(md.endDate),
          }));
          if (found.dashaSystem.currentMahadasha) {
            found.dashaSystem.currentMahadasha.startDate = new Date(found.dashaSystem.currentMahadasha.startDate);
            found.dashaSystem.currentMahadasha.endDate = new Date(found.dashaSystem.currentMahadasha.endDate);
          }
          if (found.dashaSystem.currentAntardasha) {
            found.dashaSystem.currentAntardasha.startDate = new Date(found.dashaSystem.currentAntardasha.startDate);
            found.dashaSystem.currentAntardasha.endDate = new Date(found.dashaSystem.currentAntardasha.endDate);
          }
          
          // Parse all other dasha system dates
          if (found.allDashaSystems) {
            // Yogini Dasha
            if (found.allDashaSystems.yogini) {
              found.allDashaSystems.yogini.mahadashas = found.allDashaSystems.yogini.mahadashas.map(md => ({
                ...md,
                startDate: new Date(md.startDate),
                endDate: new Date(md.endDate),
              }));
              if (found.allDashaSystems.yogini.currentMahadasha) {
                found.allDashaSystems.yogini.currentMahadasha.startDate = new Date(found.allDashaSystems.yogini.currentMahadasha.startDate);
                found.allDashaSystems.yogini.currentMahadasha.endDate = new Date(found.allDashaSystems.yogini.currentMahadasha.endDate);
              }
            }
            
            // Ashtottari Dasha
            if (found.allDashaSystems.ashtottari) {
              found.allDashaSystems.ashtottari.mahadashas = found.allDashaSystems.ashtottari.mahadashas.map(md => ({
                ...md,
                startDate: new Date(md.startDate),
                endDate: new Date(md.endDate),
              }));
              if (found.allDashaSystems.ashtottari.currentMahadasha) {
                found.allDashaSystems.ashtottari.currentMahadasha.startDate = new Date(found.allDashaSystems.ashtottari.currentMahadasha.startDate);
                found.allDashaSystems.ashtottari.currentMahadasha.endDate = new Date(found.allDashaSystems.ashtottari.currentMahadasha.endDate);
              }
            }
            
            // Chara Dasha
            if (found.allDashaSystems.chara) {
              found.allDashaSystems.chara.mahadashas = found.allDashaSystems.chara.mahadashas.map(md => ({
                ...md,
                startDate: new Date(md.startDate),
                endDate: new Date(md.endDate),
              }));
              if (found.allDashaSystems.chara.currentMahadasha) {
                found.allDashaSystems.chara.currentMahadasha.startDate = new Date(found.allDashaSystems.chara.currentMahadasha.startDate);
                found.allDashaSystems.chara.currentMahadasha.endDate = new Date(found.allDashaSystems.chara.currentMahadasha.endDate);
              }
            }
            
            // Kalachakra Dasha
            if (found.allDashaSystems.kalachakra) {
              found.allDashaSystems.kalachakra.mahadashas = found.allDashaSystems.kalachakra.mahadashas.map(md => ({
                ...md,
                startDate: new Date(md.startDate),
                endDate: new Date(md.endDate),
              }));
              if (found.allDashaSystems.kalachakra.currentMahadasha) {
                found.allDashaSystems.kalachakra.currentMahadasha.startDate = new Date(found.allDashaSystems.kalachakra.currentMahadasha.startDate);
                found.allDashaSystems.kalachakra.currentMahadasha.endDate = new Date(found.allDashaSystems.kalachakra.currentMahadasha.endDate);
              }
            }
          }
          
          setKundli(found);
        }
      }
      setLoading(false);
    };

    loadKundli();
  }, [params?.id]);

  const handleDownloadPDF = async () => {
    if (!kundli) return;

    try {
      const { generateKundliPDF } = await import("@/lib/pdf-export");
      await generateKundliPDF(kundli);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!kundli) return;
    
    const savedKundlis = localStorage.getItem("kundlis");
    const kundlis: Kundli[] = savedKundlis ? JSON.parse(savedKundlis) : [];
    
    // Check if already saved
    if (!kundlis.find(k => k.id === kundli.id)) {
      kundlis.push(kundli);
      localStorage.setItem("kundlis", JSON.stringify(kundlis));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Kundli...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!kundli) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <p className="text-foreground text-lg">Kundli not found</p>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                {kundli.birthData.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{kundli.birthData.dateOfBirth}</span>
                <span>•</span>
                <span>{kundli.birthData.timeOfBirth}</span>
                <span>•</span>
                <span>{kundli.birthData.placeOfBirth}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                data-testid="button-save-kundli"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={handleDownloadPDF}
                data-testid="button-download-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Birth Chart */}
        <ChartDisplay kundli={kundli} />

        {/* Planetary Positions */}
        <PlanetaryData
          planets={kundli.chartData.planetPositions}
          strengths={kundli.planetaryStrength}
        />

        {/* Yogas & Planetary Combinations */}
        {kundli.yogas && kundli.yogas.length > 0 && (
          <YogasDisplay yogas={kundli.yogas} />
        )}

        {/* Current Transits */}
        {(() => {
          const transitData = calculateCurrentTransits(
            new Date(),
            kundli.birthData.latitude,
            kundli.birthData.longitude,
            kundli.birthData.timezone,
            kundli.chartData.planetPositions,
            kundli.chartData.ascendant
          );
          
          return (
            <TransitAnalysis
              birthData={kundli.birthData}
              natalPlanets={kundli.chartData.planetPositions}
              natalHouses={kundli.chartData.houses}
              ascendantSign={kundli.chartData.ascendant}
            />
          );
        })()}

        {/* Dasha Systems */}
        {kundli.allDashaSystems && (
          <AllDashaSystems allDashaSystems={kundli.allDashaSystems} />
        )}

        {/* Divisional Charts */}
        <DivisionalCharts
          natalPlanets={kundli.chartData.planetPositions}
          ascendantSign={kundli.chartData.ascendant}
        />

        {/* Ashtakavarga - Complete System with Advanced Features */}
        <EnhancedAshtakavargaDisplay
          individual={kundli.ashtakavarga.individual}
          sarva={kundli.ashtakavarga.sarva}
          prastara={kundli.completeAshtakavarga?.prastara}
          trikonaShodhana={kundli.completeAshtakavarga?.trikonaShodhana}
          ekadhipatyaShodhana={kundli.completeAshtakavarga?.ekadhipatyaShodhana}
          kakshyaLords={kundli.completeAshtakavarga?.kakshyaLords}
          shodhita={kundli.completeAshtakavarga?.shodhita}
          divisionalAshtakavarga={kundli.divisionalAshtakavarga}
        />

        {/* Annual Chart */}
        <AnnualChart
          birthData={kundli.birthData}
          natalPlanets={kundli.chartData.planetPositions}
        />

        {/* Remedies */}
        <Remedies remedies={kundli.remedies} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>
            Generated with ParāSara-X • Based on classical Vedic astrology texts
          </p>
          <p className="mt-2 text-xs">
            This report is for informational and spiritual guidance purposes only.
            Not a substitute for professional medical, legal, or financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type BirthData, type PlanetPosition, type HouseData, ZodiacSign } from "@shared/astro-schema";
import { calculateCurrentTransits, type TransitEffect } from "@/lib/transit-calculations";
import { Orbit, TrendingUp, AlertCircle } from "lucide-react";

interface TransitAnalysisProps {
  birthData: BirthData;
  natalPlanets: PlanetPosition[];
  natalHouses: HouseData[];
  ascendantSign: ZodiacSign;
}

export function TransitAnalysis({ birthData, natalPlanets, natalHouses, ascendantSign }: TransitAnalysisProps) {
  const currentDate = new Date();
  const transitData = calculateCurrentTransits(
    currentDate,
    birthData.latitude,
    birthData.longitude,
    birthData.timezone,
    natalPlanets,
    ascendantSign
  );

  const majorTransits = transitData.effects.filter(e => e.strength === "strong");
  const moderateTransits = transitData.effects.filter(e => e.strength === "moderate");
  const sadeSati = transitData.effects.find(e => e.aspect === "Sade Sati");

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong": return "bg-primary/20 text-primary border-primary/30";
      case "moderate": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "weak": return "bg-muted/20 text-muted-foreground border-muted/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Orbit className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">
            Current Transits (Gochar)
          </h2>
          <p className="text-muted-foreground mt-1">
            Live planetary movements and their effects on your natal chart
          </p>
        </div>
      </div>

      {sadeSati && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <CardTitle className="text-yellow-500">Sade Sati Period Active</CardTitle>
                <CardDescription>
                  Saturn is transiting through a critical position relative to your Moon
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">{sadeSati.effects}</p>
            <p className="text-sm text-muted-foreground mt-2">
              This is a transformative 7.5-year period requiring patience, discipline, and spiritual practices.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Positions</TabsTrigger>
          <TabsTrigger value="major">Major Effects</TabsTrigger>
          <TabsTrigger value="all">All Transits</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planetary Positions Today</CardTitle>
              <CardDescription>
                Current sidereal positions as of {currentDate.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transitData.positions.map((pos) => (
                  <div
                    key={pos.planet}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{pos.planet}</span>
                      {pos.isRetrograde && (
                        <Badge variant="outline" className="text-xs">Retrograde</Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground">
                        Sign: <span className="text-foreground">{pos.currentSign}</span>
                      </div>
                      <div className="text-muted-foreground">
                        House: <span className="text-foreground">{pos.currentHouse}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Degree: <span className="text-foreground">{pos.degree.toFixed(2)}°</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="major" className="space-y-4">
          {majorTransits.length > 0 ? (
            majorTransits.map((transit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {transit.transitPlanet} Transit
                      </CardTitle>
                      <CardDescription>{transit.aspect}</CardDescription>
                    </div>
                    <Badge className={getStrengthColor(transit.strength)}>
                      {transit.strength} effect
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Transiting through <span className="text-foreground font-medium">House {transit.transitHouse}</span>
                    {" "}• Natal House {transit.natalHouse}
                  </div>
                  <p className="text-sm text-foreground/90">{transit.description}</p>
                  <div className="p-3 rounded-lg bg-accent/50 border border-border">
                    <p className="text-sm text-foreground/80">{transit.effects}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No major transit effects currently active
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {transitData.effects.map((transit, index) => (
              <Card key={index} className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">
                          {transit.transitPlanet}
                        </span>
                        <span className="text-muted-foreground text-sm">→</span>
                        <span className="text-sm text-muted-foreground">
                          House {transit.transitHouse}
                        </span>
                        <Badge variant="outline" className={getStrengthColor(transit.strength)}>
                          {transit.strength}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/80">{transit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type BirthData, type PlanetPosition } from "@shared/astro-schema";
import { calculateAnnualChart, type AnnualChart as AnnualChartType } from "@/lib/varshaphala-calculations";
import { Calendar, Sun, ChevronLeft, ChevronRight } from "lucide-react";

interface AnnualChartProps {
  birthData: BirthData;
  natalPlanets: PlanetPosition[];
}

export function AnnualChart({ birthData, natalPlanets }: AnnualChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const natalSun = natalPlanets.find(p => p.planet === "Sun");
  if (!natalSun) return null;

  const annualChart = calculateAnnualChart(birthData, selectedYear, natalSun.longitude);

  const handlePreviousYear = () => setSelectedYear(y => y - 1);
  const handleNextYear = () => setSelectedYear(y => y + 1);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">
            Varṣaphala (Annual Chart)
          </h2>
          <p className="text-muted-foreground mt-1">
            Solar return chart for yearly predictions
          </p>
        </div>
      </div>

      {/* Year Selector */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousYear}
              disabled={selectedYear <= 1950}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{selectedYear}</div>
              <div className="text-sm text-muted-foreground">
                Solar Return: {annualChart.solarReturnDate.toLocaleDateString()} at{" "}
                {annualChart.solarReturnDate.toLocaleTimeString()}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextYear}
              disabled={selectedYear >= 2050}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Theme */}
      <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            Theme for {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground leading-relaxed">{annualChart.yearlyTheme}</p>
        </CardContent>
      </Card>

      {/* Chart Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ascendant & Planetary Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Details</CardTitle>
            <CardDescription>Planetary positions for {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/50 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Ascendant</div>
              <div className="text-xl font-bold text-foreground">
                {annualChart.ascendantSign}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {annualChart.ascendant.toFixed(2)}°
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-2">Planetary Positions</div>
              <div className="space-y-2">
                {annualChart.planetPositions.map((planet) => (
                  <div
                    key={planet.planet}
                    className="flex items-center justify-between p-2 rounded bg-card/50 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{planet.planet}</span>
                      {planet.isRetrograde && (
                        <Badge variant="outline" className="text-xs">R</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-foreground">{planet.sign}</div>
                      <div className="text-xs text-muted-foreground">H{planet.house}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Yearly Predictions</CardTitle>
            <CardDescription>Key influences for {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {annualChart.predictions.length > 0 ? (
              <ul className="space-y-3">
                {annualChart.predictions.map((prediction, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-border">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm text-foreground">{prediction}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Analyzing planetary positions for detailed predictions...
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* House Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>House-wise Analysis for {selectedYear}</CardTitle>
          <CardDescription>
            Each house represents different life areas in your annual chart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {annualChart.houses.slice(0, 12).map((house) => (
              <div
                key={house.houseNumber}
                className="p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">House {house.houseNumber}</span>
                  <span className="text-xs text-muted-foreground">{house.sign}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Lord: {house.lord}
                </div>
                {house.planetsInHouse.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {house.planetsInHouse.map((planet) => (
                      <Badge key={planet} variant="secondary" className="text-xs">
                        {planet}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">About Varṣaphala:</strong> The annual chart (solar return) is cast for the moment 
            when the Sun returns to its exact natal position each year. It provides insights into the themes, opportunities, 
            and challenges for the upcoming year. Compare the annual chart positions with your natal chart for deeper analysis.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

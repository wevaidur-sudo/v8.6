import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type DashaSystem, type MahadashaPeriod, DashaPlanet } from "@shared/astro-schema";
import { Calendar, Clock } from "lucide-react";

interface DashaTimelineProps {
  dashaSystem: DashaSystem;
}

export function DashaTimeline({ dashaSystem }: DashaTimelineProps) {
  return (
    <Card className="p-8 bg-card/95 backdrop-blur-sm border-primary/20" data-testid="dasha-timeline">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Vimshottari Dasha
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent" />
          <p className="text-sm text-muted-foreground mt-4">
            The 120-year cycle divided among the nine planets
          </p>
        </div>

        {/* Current Dasha */}
        {dashaSystem.currentMahadasha && dashaSystem.currentAntardasha && (
          <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Current Period</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mahadasha:</span>
                <Badge className="bg-primary text-primary-foreground">
                  {dashaSystem.currentMahadasha.planet}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Antardasha:</span>
                <Badge variant="outline">
                  {dashaSystem.currentAntardasha.planet}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>
                  {dashaSystem.currentMahadasha.startDate.toLocaleDateString()} -{" "}
                  {dashaSystem.currentMahadasha.endDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Visualization */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Mahadasha Periods
          </h3>
          
          <div className="space-y-3">
            {dashaSystem.mahadashas.slice(0, 9).map((mahadasha, index) => (
              <DashaPeriodCard
                key={index}
                mahadasha={mahadasha}
                isCurrent={
                  dashaSystem.currentMahadasha?.planet === mahadasha.planet
                }
              />
            ))}
          </div>
        </div>

        {/* Birth Dasha Info */}
        <div className="p-4 rounded-md bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Birth Dasha:</span>{" "}
            {dashaSystem.birthDasha} with {dashaSystem.birthDashaBalance.toFixed(2)}{" "}
            years remaining
          </p>
        </div>
      </div>
    </Card>
  );
}

interface DashaPeriodCardProps {
  mahadasha: MahadashaPeriod;
  isCurrent: boolean;
}

function DashaPeriodCard({ mahadasha, isCurrent }: DashaPeriodCardProps) {
  const getPlanetColor = (planet: DashaPlanet): string => {
    const colors: Record<DashaPlanet, string> = {
      [DashaPlanet.Sun]: "bg-chart-4",
      [DashaPlanet.Moon]: "bg-chart-1",
      [DashaPlanet.Mars]: "bg-destructive",
      [DashaPlanet.Mercury]: "bg-chart-3",
      [DashaPlanet.Jupiter]: "bg-primary",
      [DashaPlanet.Venus]: "bg-chart-2",
      [DashaPlanet.Saturn]: "bg-chart-5",
      [DashaPlanet.Rahu]: "bg-secondary",
      [DashaPlanet.Ketu]: "bg-muted",
    };
    return colors[planet] || "bg-muted";
  };

  return (
    <div
      className={`relative p-4 rounded-md border ${
        isCurrent
          ? "bg-primary/5 border-primary/50"
          : "bg-muted/10 border-border"
      } hover-elevate transition-all`}
      data-testid={`dasha-period-${mahadasha.planet.toLowerCase()}`}
    >
      {/* Timeline indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{
        background: `hsl(var(--${getPlanetColor(mahadasha.planet).replace('bg-', '')}))`
      }} />

      <div className="pl-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={isCurrent ? "bg-primary" : "bg-muted"}>
              {mahadasha.planet}
            </Badge>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{mahadasha.startDate.toLocaleDateString()}</span>
            <span>→</span>
            <span>{mahadasha.endDate.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {mahadasha.durationYears} years
          </p>
        </div>
      </div>
    </div>
  );
}

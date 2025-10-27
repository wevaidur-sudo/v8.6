import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type PlanetPosition, type ShadbalaStrength, Planet, PlanetaryDignity } from "@shared/astro-schema";
import { Sun, Moon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PlanetaryDataProps {
  planets: PlanetPosition[];
  strengths?: ShadbalaStrength[];
}

export function PlanetaryData({ planets, strengths }: PlanetaryDataProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Planetary Positions
        </h2>
        <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planets
          .filter(p => p.planet !== Planet.Ascendant)
          .map((planet) => {
            const strength = strengths?.find(s => s.planet === planet.planet);
            return (
              <PlanetCard key={planet.planet} planet={planet} strength={strength} />
            );
          })}
      </div>
    </div>
  );
}

interface PlanetCardProps {
  planet: PlanetPosition;
  strength?: ShadbalaStrength;
}

function PlanetCard({ planet, strength }: PlanetCardProps) {
  const getPlanetIcon = (planetName: Planet) => {
    if (planetName === Planet.Sun) return Sun;
    if (planetName === Planet.Moon) return Moon;
    return Sun; // Default icon
  };

  const getDignityColor = (dignity: PlanetaryDignity): string => {
    switch (dignity) {
      case PlanetaryDignity.Exalted:
        return "bg-chart-3 text-chart-3"; // Green
      case PlanetaryDignity.Debilitated:
        return "bg-destructive text-destructive"; // Red
      case PlanetaryDignity.OwnSign:
      case PlanetaryDignity.Moolatrikona:
        return "bg-primary text-primary"; // Gold
      default:
        return "bg-secondary text-secondary";
    }
  };

  const Icon = getPlanetIcon(planet.planet);
  const dignityColor = getDignityColor(planet.dignity);
  const strengthPercent = strength ? (strength.totalVirupas / 500) * 100 : 0;

  return (
    <Card className="p-6 bg-card/95 hover-elevate border-border space-y-4" data-testid={`card-planet-${planet.planet.toLowerCase()}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {planet.planet}
            </h3>
            <p className="text-xs text-muted-foreground">
              {planet.nakshatra} - Pada {planet.nakshatraPada}
            </p>
          </div>
        </div>
        
        {planet.isRetrograde && (
          <Badge variant="outline" className="text-xs">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            Retrograde
          </Badge>
        )}
      </div>

      {/* Position Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sign</span>
          <span className="text-sm font-medium text-foreground">{planet.sign}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Degree</span>
          <span className="text-sm font-mono text-foreground">
            {planet.degree.toFixed(2)}°
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">House</span>
          <span className="text-sm font-medium text-foreground">
            {planet.house}
          </span>
        </div>
      </div>

      {/* Dignity Badge */}
      <div>
        <Badge className={dignityColor} data-testid={`badge-dignity-${planet.planet.toLowerCase()}`}>
          {planet.dignity}
        </Badge>
        {planet.isCombust && (
          <Badge variant="destructive" className="ml-2">
            Combust
          </Badge>
        )}
      </div>

      {/* Strength Meter */}
      {strength && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Strength</span>
            <span className="text-xs font-mono text-foreground">
              {strength.totalVirupas.toFixed(0)} Virupas
            </span>
          </div>
          <Progress
            value={Math.min(strengthPercent, 100)}
            className="h-2"
            data-testid={`progress-strength-${planet.planet.toLowerCase()}`}
          />
          {strength.isStrong && (
            <p className="text-xs text-chart-3">
              ✓ Meets minimum requirement
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

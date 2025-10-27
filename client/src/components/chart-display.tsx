import { Card } from "@/components/ui/card";
import { type Kundli, ZodiacSign, Planet } from "@shared/astro-schema";

interface ChartDisplayProps {
  kundli: Kundli;
}

export function ChartDisplay({ kundli }: ChartDisplayProps) {
  return (
    <div className="space-y-8">
      {/* D1 (Rashi) Chart */}
      <Card className="p-6 bg-card/95 backdrop-blur-sm border-primary/20" data-testid="chart-d1">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Birth Chart (Rashi)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ascendant: {kundli.chartData.ascendant}
              </p>
            </div>
          </div>

          {/* Circular Chart Rendering */}
          <CircularChart kundli={kundli} />
        </div>
      </Card>

      {/* D9 (Navamsa) Chart */}
      {kundli.navamsa && (
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-primary/20" data-testid="chart-d9">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Navamsa Chart (D9)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Divisional chart for marriage and spiritual potential
              </p>
            </div>

            {/* Navamsa Planet Positions Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kundli.navamsa.planetPositions.map((planet) => (
                <div
                  key={planet.planet}
                  className="p-4 rounded-md bg-muted/20 border border-border hover-elevate"
                  data-testid={`navamsa-planet-${planet.planet.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{planet.planet}</span>
                    <span className="text-xs text-muted-foreground">{planet.sign}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {planet.longitude.toFixed(2)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function CircularChart({ kundli }: { kundli: Kundli }) {
  // Circular chart similar to Parashara's Light 9
  // 12 houses arranged in a circle, with house 1 (Ascendant) at 9 o'clock position (East)
  
  const getHouseSign = (houseNum: number): ZodiacSign => {
    const house = kundli.chartData.houses.find(h => h.houseNumber === houseNum);
    return house?.sign || ZodiacSign.Aries;
  };

  const getPlanetsInHouse = (houseNum: number): Planet[] => {
    const house = kundli.chartData.houses.find(h => h.houseNumber === houseNum);
    return house?.planetsInHouse || [];
  };

  const getSignSymbol = (sign: ZodiacSign): string => {
    const symbols: Record<ZodiacSign, string> = {
      [ZodiacSign.Aries]: "♈",
      [ZodiacSign.Taurus]: "♉",
      [ZodiacSign.Gemini]: "♊",
      [ZodiacSign.Cancer]: "♋",
      [ZodiacSign.Leo]: "♌",
      [ZodiacSign.Virgo]: "♍",
      [ZodiacSign.Libra]: "♎",
      [ZodiacSign.Scorpio]: "♏",
      [ZodiacSign.Sagittarius]: "♐",
      [ZodiacSign.Capricorn]: "♑",
      [ZodiacSign.Aquarius]: "♒",
      [ZodiacSign.Pisces]: "♓",
    };
    return symbols[sign];
  };

  const getPlanetSymbol = (planet: Planet): string => {
    const symbols: Record<Planet, string> = {
      [Planet.Sun]: "☉",
      [Planet.Moon]: "☽",
      [Planet.Mars]: "♂",
      [Planet.Mercury]: "☿",
      [Planet.Jupiter]: "♃",
      [Planet.Venus]: "♀",
      [Planet.Saturn]: "♄",
      [Planet.Rahu]: "☊",
      [Planet.Ketu]: "☋",
      [Planet.Ascendant]: "Asc",
    };
    return symbols[planet];
  };

  const centerX = 200;
  const centerY = 200;
  const outerRadius = 170;
  const innerRadius = 120;
  const signRadius = 145;
  const planetRadius = 100;

  // Generate house division lines and labels
  const houses = [];
  for (let i = 1; i <= 12; i++) {
    // Start from 9 o'clock (180°) and go counter-clockwise
    // Each house is 30 degrees
    const startAngle = 180 + (i - 1) * 30;
    const endAngle = startAngle + 30;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const midRad = ((startAngle + 15) * Math.PI) / 180;

    // House division line
    const lineX = centerX + outerRadius * Math.cos(startRad);
    const lineY = centerY - outerRadius * Math.sin(startRad);

    // House number position (outer)
    const houseNumX = centerX + (outerRadius + 15) * Math.cos(midRad);
    const houseNumY = centerY - (outerRadius + 15) * Math.sin(midRad);

    // Sign symbol position (middle ring)
    const signX = centerX + signRadius * Math.cos(midRad);
    const signY = centerY - signRadius * Math.sin(midRad);

    // Planet position (inner area)
    const planetX = centerX + planetRadius * Math.cos(midRad);
    const planetY = centerY - planetRadius * Math.sin(midRad);

    const houseSign = getHouseSign(i);
    const planets = getPlanetsInHouse(i);

    houses.push({
      houseNum: i,
      lineX,
      lineY,
      houseNumX,
      houseNumY,
      signX,
      signY,
      planetX,
      planetY,
      sign: houseSign,
      planets,
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        {/* Background */}
        <rect width="400" height="400" fill="hsl(var(--card))" />
        
        {/* Outer circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
        />

        {/* Middle circle (sign ring boundary) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Inner decorative circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={70}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Center point */}
        <circle
          cx={centerX}
          cy={centerY}
          r={3}
          fill="hsl(var(--primary))"
        />

        {/* House division lines */}
        {houses.map((house) => (
          <line
            key={`line-${house.houseNum}`}
            x1={centerX}
            y1={centerY}
            x2={house.lineX}
            y2={house.lineY}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* House numbers (outer) */}
        {houses.map((house) => (
          <text
            key={`num-${house.houseNum}`}
            x={house.houseNumX}
            y={house.houseNumY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="11"
            fontWeight="600"
          >
            {house.houseNum}
          </text>
        ))}

        {/* Zodiac signs (middle ring) */}
        {houses.map((house) => (
          <text
            key={`sign-${house.houseNum}`}
            x={house.signX}
            y={house.signY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--primary))"
            fontSize="20"
            fontWeight="500"
          >
            {getSignSymbol(house.sign)}
          </text>
        ))}

        {/* Planets (inner area) */}
        {houses.map((house) => (
          house.planets.length > 0 && (
            <g key={`planets-${house.houseNum}`}>
              {house.planets.map((planet, idx) => (
                <text
                  key={`${house.houseNum}-${planet}-${idx}`}
                  x={house.planetX}
                  y={house.planetY + (idx * 12) - ((house.planets.length - 1) * 6)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(var(--chart-4))"
                  fontSize="14"
                  fontWeight="700"
                >
                  {getPlanetSymbol(planet)}
                </text>
              ))}
            </g>
          )
        ))}

        {/* Cardinal directions markers */}
        <text x={centerX + outerRadius + 25} y={centerY} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))" fontSize="10" opacity="0.6">E</text>
        <text x={centerX - outerRadius - 25} y={centerY} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))" fontSize="10" opacity="0.6">W</text>
        <text x={centerX} y={centerY - outerRadius - 25} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))" fontSize="10" opacity="0.6">N</text>
        <text x={centerX} y={centerY + outerRadius + 25} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))" fontSize="10" opacity="0.6">S</text>
      </svg>
    </div>
  );
}


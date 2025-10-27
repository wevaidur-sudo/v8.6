import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PlanetPosition, type HouseData, ZodiacSign } from "@shared/astro-schema";
import { 
  calculateD2Chart,
  calculateD3Chart,
  calculateD4Chart,
  calculateD5Chart,
  calculateD6Chart,
  calculateD7Chart,
  calculateD8Chart,
  calculateD10Chart,
  calculateD11Chart,
  calculateD12Chart,
  calculateD16Chart,
  calculateD20Chart,
  calculateD24Chart,
  calculateD27Chart,
  calculateD30Chart,
  calculateD40Chart,
  calculateD45Chart,
  calculateD60Chart,
  type DivisionalChart 
} from "@/lib/divisional-charts";
import { 
  Grid3x3, Briefcase, Baby, Users, Car, GraduationCap, 
  DollarSign, Sword, Heart, Skull, TrendingUp, Sparkles,
  BookOpen, Shield, Home, UserCheck, Layers
} from "lucide-react";

interface DivisionalChartsProps {
  natalPlanets: PlanetPosition[];
  ascendantSign: ZodiacSign;
}

interface ChartConfig {
  id: string;
  data: DivisionalChart;
  icon: typeof Grid3x3;
  color: string;
  bgColor: string;
  borderColor: string;
  category: "essential" | "important" | "advanced";
  description: string;
}

export function DivisionalCharts({ natalPlanets, ascendantSign }: DivisionalChartsProps) {
  const [selectedChart, setSelectedChart] = useState<string>("d10");

  const allCharts: ChartConfig[] = [
    { 
      id: "d2", 
      data: calculateD2Chart(natalPlanets, ascendantSign), 
      icon: DollarSign, 
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      category: "important",
      description: "Wealth & Finances"
    },
    { 
      id: "d3", 
      data: calculateD3Chart(natalPlanets, ascendantSign), 
      icon: Users, 
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      category: "important",
      description: "Siblings & Courage"
    },
    { 
      id: "d4", 
      data: calculateD4Chart(natalPlanets, ascendantSign), 
      icon: Home, 
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      category: "important",
      description: "Property & Residence"
    },
    { 
      id: "d5", 
      data: calculateD5Chart(natalPlanets, ascendantSign), 
      icon: Sparkles, 
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      category: "important",
      description: "Fame & Merit"
    },
    { 
      id: "d6", 
      data: calculateD6Chart(natalPlanets, ascendantSign), 
      icon: Heart, 
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      category: "important",
      description: "Health & Enemies"
    },
    { 
      id: "d7", 
      data: calculateD7Chart(natalPlanets, ascendantSign), 
      icon: Baby, 
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      category: "essential",
      description: "Children & Progeny"
    },
    { 
      id: "d8", 
      data: calculateD8Chart(natalPlanets, ascendantSign), 
      icon: Skull, 
      color: "text-gray-400",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/20",
      category: "important",
      description: "Longevity & Accidents"
    },
    { 
      id: "d10", 
      data: calculateD10Chart(natalPlanets, ascendantSign), 
      icon: Briefcase, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      category: "essential",
      description: "Career & Profession"
    },
    { 
      id: "d11", 
      data: calculateD11Chart(natalPlanets, ascendantSign), 
      icon: TrendingUp, 
      color: "text-lime-400",
      bgColor: "bg-lime-500/10",
      borderColor: "border-lime-500/20",
      category: "important",
      description: "Gains & Income"
    },
    { 
      id: "d12", 
      data: calculateD12Chart(natalPlanets, ascendantSign), 
      icon: Users, 
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      category: "essential",
      description: "Parents & Ancestors"
    },
    { 
      id: "d16", 
      data: calculateD16Chart(natalPlanets, ascendantSign), 
      icon: Car, 
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      category: "essential",
      description: "Vehicles & Comforts"
    },
    { 
      id: "d20", 
      data: calculateD20Chart(natalPlanets, ascendantSign), 
      icon: Sparkles, 
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      category: "essential",
      description: "Spiritual Progress"
    },
    { 
      id: "d24", 
      data: calculateD24Chart(natalPlanets, ascendantSign), 
      icon: GraduationCap, 
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      category: "essential",
      description: "Education & Learning"
    },
    { 
      id: "d27", 
      data: calculateD27Chart(natalPlanets, ascendantSign), 
      icon: Shield, 
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      category: "advanced",
      description: "Strengths & Weaknesses"
    },
    { 
      id: "d30", 
      data: calculateD30Chart(natalPlanets, ascendantSign), 
      icon: Sword, 
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      category: "advanced",
      description: "Misfortunes & Karma"
    },
    { 
      id: "d40", 
      data: calculateD40Chart(natalPlanets, ascendantSign), 
      icon: UserCheck, 
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      category: "advanced",
      description: "Maternal Lineage"
    },
    { 
      id: "d45", 
      data: calculateD45Chart(natalPlanets, ascendantSign), 
      icon: BookOpen, 
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      category: "advanced",
      description: "Character & Conduct"
    },
    { 
      id: "d60", 
      data: calculateD60Chart(natalPlanets, ascendantSign), 
      icon: Layers, 
      color: "text-fuchsia-400",
      bgColor: "bg-fuchsia-500/10",
      borderColor: "border-fuchsia-500/20",
      category: "advanced",
      description: "Past Life Karma"
    },
  ];

  const currentChart = allCharts.find(c => c.id === selectedChart) || allCharts[7]; // Default to D10
  const Icon = currentChart.icon;

  const essentialCharts = allCharts.filter(c => c.category === "essential");
  const importantCharts = allCharts.filter(c => c.category === "important");
  const advancedCharts = allCharts.filter(c => c.category === "advanced");

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Grid3x3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">
            Divisional Charts (Vargas)
          </h2>
          <p className="text-muted-foreground mt-1">
            16 specialized charts revealing different life areas
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-96">
          <Select value={selectedChart} onValueChange={setSelectedChart}>
            <SelectTrigger>
              <SelectValue placeholder="Select a divisional chart" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Essential Charts (Shadvargas)</SelectLabel>
                {essentialCharts.map((chart) => (
                  <SelectItem key={chart.id} value={chart.id}>
                    {chart.id.toUpperCase()} - {chart.description}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Important Charts</SelectLabel>
                {importantCharts.map((chart) => (
                  <SelectItem key={chart.id} value={chart.id}>
                    {chart.id.toUpperCase()} - {chart.description}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Advanced Charts (Shodasavargas)</SelectLabel>
                {advancedCharts.map((chart) => (
                  <SelectItem key={chart.id} value={chart.id}>
                    {chart.id.toUpperCase()} - {chart.description}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="text-sm">
          {allCharts.length} Charts Available
        </Badge>
      </div>

      <Card className={`${currentChart.borderColor} ${currentChart.bgColor}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${currentChart.bgColor} border ${currentChart.borderColor}`}>
              <Icon className={`w-5 h-5 ${currentChart.color}`} />
            </div>
            <div>
              <CardTitle>{currentChart.data.interpretation.name}</CardTitle>
              <CardDescription>{currentChart.data.interpretation.purpose}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Ascendant</div>
            <div className="text-lg font-semibold text-foreground">{currentChart.data.ascendant}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-foreground mb-3">Planetary Positions</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {currentChart.data.planetPositions.map((planet, index) => (
                <div
                  key={`${planet.planet}-${index}`}
                  className="p-2 rounded bg-card/50 border border-border text-sm"
                >
                  <div className="font-medium text-foreground">{planet.planet}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {planet.sign} • H{planet.house}
                  </div>
                  {planet.dignity !== "Neutral Sign" && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {planet.dignity}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-foreground mb-2">Key Interpretative Factors</div>
            <ul className="space-y-1">
              {currentChart.data.interpretation.keyFactors.map((factor, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">About Divisional Charts:</strong> Also known as Vargas or Amsas, divisional charts are created by mathematically dividing each zodiac sign into specific segments. The Shadvargas (6 essential charts) and Shodasavargas (16 charts) provide increasingly refined insights into different life domains. Strong planetary placements in these charts indicate favorable outcomes in their respective areas.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

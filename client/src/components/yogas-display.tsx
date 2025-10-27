import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Yoga, YogaType, Planet } from "@shared/astro-schema";
import { Sparkles, TrendingUp, Star, Users, Home, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface YogasDisplayProps {
  yogas: Yoga[];
}

export function YogasDisplay({ yogas }: YogasDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getCategoryIcon = (type: YogaType) => {
    switch (type) {
      case YogaType.Rajayoga:
      case YogaType.NeechaBhangaRajayoga:
      case YogaType.VipreetRajayoga:
      case YogaType.DharmaKarmadhipatiYoga:
      case YogaType.AdhiYoga:
      case YogaType.LakshmiYoga:
        return Star;
      case YogaType.DhanaYoga:
        return TrendingUp;
      case YogaType.MahapurushaYoga:
        return Sparkles;
      case YogaType.NabhasaAkritiYoga:
      case YogaType.NabhasaSankhyaYoga:
      case YogaType.NabhasaAsrayaYoga:
      case YogaType.NabhasaDalaYoga:
        return Users;
      case YogaType.BhavaYoga:
        return Home;
      case YogaType.ArishtaYoga:
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const getCategoryColor = (type: YogaType): string => {
    switch (type) {
      case YogaType.Rajayoga:
      case YogaType.NeechaBhangaRajayoga:
      case YogaType.VipreetRajayoga:
      case YogaType.DharmaKarmadhipatiYoga:
      case YogaType.AdhiYoga:
      case YogaType.LakshmiYoga:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case YogaType.DhanaYoga:
        return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case YogaType.MahapurushaYoga:
        return "from-purple-500/20 to-violet-500/20 border-purple-500/30";
      case YogaType.NabhasaAkritiYoga:
      case YogaType.NabhasaSankhyaYoga:
      case YogaType.NabhasaAsrayaYoga:
      case YogaType.NabhasaDalaYoga:
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      case YogaType.BhavaYoga:
        return "from-indigo-500/20 to-blue-500/20 border-indigo-500/30";
      case YogaType.ArishtaYoga:
        return "from-red-500/20 to-orange-500/20 border-red-500/30";
      default:
        return "from-slate-500/20 to-gray-500/20 border-slate-500/30";
    }
  };

  const getStrengthBadgeColor = (strength: string): string => {
    switch (strength) {
      case "strong":
        return "bg-chart-3 text-white";
      case "moderate":
        return "bg-chart-4 text-white";
      case "weak":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const yogasByCategory = yogas.reduce((acc, yoga) => {
    if (!acc[yoga.type]) {
      acc[yoga.type] = [];
    }
    acc[yoga.type].push(yoga);
    return acc;
  }, {} as Record<YogaType, Yoga[]>);

  const categories = Object.keys(yogasByCategory) as YogaType[];

  const sortedCategories = categories.sort((a, b) => {
    const priority: Record<string, number> = {
      [YogaType.Rajayoga]: 1,
      [YogaType.DhanaYoga]: 2,
      [YogaType.MahapurushaYoga]: 3,
      [YogaType.NabhasaAkritiYoga]: 4,
      [YogaType.NabhasaSankhyaYoga]: 4,
      [YogaType.NabhasaAsrayaYoga]: 4,
      [YogaType.NabhasaDalaYoga]: 4,
      [YogaType.SunaphaYoga]: 5,
      [YogaType.VesiYoga]: 6,
      [YogaType.ParivartanaYoga]: 7,
      [YogaType.ConjunctionYoga]: 8,
      [YogaType.BhavaYoga]: 9,
      [YogaType.ArishtaYoga]: 10,
    };
    return (priority[a] || 99) - (priority[b] || 99);
  });

  const filteredYogas = selectedCategory === "all" 
    ? yogas 
    : yogasByCategory[selectedCategory as YogaType] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Yogas & Planetary Combinations
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent" />
          <p className="text-sm text-muted-foreground mt-3">
            {yogas.length} yoga{yogas.length !== 1 ? 's' : ''} detected from classical Vedic texts
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-muted/50 p-2">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All Yogas ({yogas.length})
          </TabsTrigger>
          {sortedCategories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category.replace(/Yoga$/, '')} ({yogasByCategory[category].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredYogas.length === 0 ? (
            <Card className="p-8 text-center bg-card/50">
              <p className="text-muted-foreground">No yogas detected in this category.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredYogas.map((yoga, index) => (
                <YogaCard key={`${yoga.name}-${index}`} yoga={yoga} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface YogaCardProps {
  yoga: Yoga;
}

function YogaCard({ yoga }: YogaCardProps) {
  const Icon = getCategoryIcon(yoga.type);
  const categoryColor = getCategoryColor(yoga.type);

  return (
    <Card 
      className={`p-6 bg-gradient-to-br ${categoryColor} backdrop-blur-sm hover-elevate transition-all duration-300`}
      data-testid={`yoga-card-${yoga.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                {yoga.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {yoga.type.replace(/Yoga$/, '')}
                </Badge>
                <Badge className={getStrengthBadgeColor(yoga.strength)}>
                  {yoga.strength.charAt(0).toUpperCase() + yoga.strength.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-md bg-card/50 border border-border/50">
            <p className="text-sm text-muted-foreground font-medium mb-1">Formation:</p>
            <p className="text-sm text-foreground">{yoga.description}</p>
          </div>

          <div className="p-3 rounded-md bg-card/50 border border-border/50">
            <p className="text-sm text-muted-foreground font-medium mb-1">Effects:</p>
            <p className="text-sm text-foreground leading-relaxed">{yoga.effects}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {yoga.formationPlanets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Planets:</span>
                <span>{yoga.formationPlanets.join(', ')}</span>
              </div>
            )}
            {yoga.houses.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Houses:</span>
                <span>{yoga.houses.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function getCategoryIcon(type: YogaType) {
  switch (type) {
    case YogaType.Rajayoga:
    case YogaType.NeechaBhangaRajayoga:
    case YogaType.VipreetRajayoga:
    case YogaType.DharmaKarmadhipatiYoga:
    case YogaType.AdhiYoga:
    case YogaType.LakshmiYoga:
      return Star;
    case YogaType.DhanaYoga:
      return TrendingUp;
    case YogaType.MahapurushaYoga:
      return Sparkles;
    case YogaType.NabhasaAkritiYoga:
    case YogaType.NabhasaSankhyaYoga:
    case YogaType.NabhasaAsrayaYoga:
    case YogaType.NabhasaDalaYoga:
      return Users;
    case YogaType.BhavaYoga:
      return Home;
    case YogaType.ArishtaYoga:
      return AlertTriangle;
    default:
      return Shield;
  }
}

function getCategoryColor(type: YogaType): string {
  switch (type) {
    case YogaType.Rajayoga:
    case YogaType.NeechaBhangaRajayoga:
    case YogaType.VipreetRajayoga:
    case YogaType.DharmaKarmadhipatiYoga:
    case YogaType.AdhiYoga:
    case YogaType.LakshmiYoga:
      return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
    case YogaType.DhanaYoga:
      return "from-green-500/20 to-emerald-500/20 border-green-500/30";
    case YogaType.MahapurushaYoga:
      return "from-purple-500/20 to-violet-500/20 border-purple-500/30";
    case YogaType.NabhasaAkritiYoga:
    case YogaType.NabhasaSankhyaYoga:
    case YogaType.NabhasaAsrayaYoga:
    case YogaType.NabhasaDalaYoga:
      return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
    case YogaType.BhavaYoga:
      return "from-indigo-500/20 to-blue-500/20 border-indigo-500/30";
    case YogaType.ArishtaYoga:
      return "from-red-500/20 to-orange-500/20 border-red-500/30";
    default:
      return "from-slate-500/20 to-gray-500/20 border-slate-500/30";
  }
}

function getStrengthBadgeColor(strength: string): string {
  switch (strength) {
    case "strong":
      return "bg-chart-3 text-white";
    case "moderate":
      return "bg-chart-4 text-white";
    case "weak":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

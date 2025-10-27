import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type AshtakavargaScore, type SarvaAshtakavarga, type DivisionalAshtakavarga, Planet } from "@shared/astro-schema";
import { getAshtakavargaForPlanet } from "@/lib/ashtakavarga-calculations";
import { useState } from "react";

interface AshtakavargaDisplayProps {
  individual: AshtakavargaScore[];
  sarva: SarvaAshtakavarga[];
  divisionalAshtakavarga?: DivisionalAshtakavarga[];
}

const HOUSE_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const CONTRIBUTORS = [
  { planet: Planet.Sun, label: "Sun" },
  { planet: Planet.Moon, label: "Moon" },
  { planet: Planet.Mars, label: "Mars" },
  { planet: Planet.Mercury, label: "Mercury" },
  { planet: Planet.Jupiter, label: "Jupiter" },
  { planet: Planet.Venus, label: "Venus" },
  { planet: Planet.Saturn, label: "Saturn" },
  { planet: Planet.Ascendant, label: "Asc" },
];

export function AshtakavargaDisplay({ individual, sarva, divisionalAshtakavarga }: AshtakavargaDisplayProps) {
  const [selectedChart, setSelectedChart] = useState<string>("rashi");

  // Get current chart data based on selection
  const getCurrentChartData = () => {
    if (selectedChart === "rashi") {
      return { individual, sarva, chartName: "D1 - Rashi (Birth Chart)" };
    }
    
    const divChart = divisionalAshtakavarga?.find(
      d => d.chartType.toLowerCase() === selectedChart
    );
    
    if (divChart) {
      return {
        individual: divChart.individual,
        sarva: divChart.sarva,
        chartName: `${divChart.chartType} - ${divChart.chartName}`,
      };
    }
    
    return { individual, sarva, chartName: "D1 - Rashi (Birth Chart)" };
  };

  const currentData = getCurrentChartData();

  // Get bindu for a specific planet in a specific house
  const getBindu = (house: number, planet: Planet): number => {
    const score = currentData.individual.find(
      (s) => s.house === house && s.planet === planet
    );
    return score?.bindus ?? 0;
  };

  const maxBindus = Math.max(...currentData.sarva.map(h => h.totalBindus));
  const minBindus = Math.min(...currentData.sarva.map(h => h.totalBindus));

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-800/30">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gold-400 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Ashtakavarga (Eight-fold Division)
        </CardTitle>
        <CardDescription className="text-slate-300">
          Classical benefic point system based on BPHS Chapter 51
        </CardDescription>
        
        {/* Divisional Chart Selector */}
        {divisionalAshtakavarga && divisionalAshtakavarga.length > 0 && (
          <div className="mt-4">
            <label className="text-sm text-slate-400 mb-2 block">Select Divisional Chart:</label>
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-full max-w-md bg-slate-800/50 border-indigo-700/50 text-slate-200">
                <SelectValue placeholder="Select chart" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-indigo-700/50">
                <SelectItem value="rashi" className="text-slate-200">D1 - Rashi (Birth Chart)</SelectItem>
                {divisionalAshtakavarga.map((chart) => (
                  <SelectItem 
                    key={chart.chartType} 
                    value={chart.chartType.toLowerCase()}
                    className="text-slate-200"
                  >
                    {chart.chartType} - {chart.chartName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-2">Currently viewing: {currentData.chartName}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="binnashtakavarga" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="binnashtakavarga">Binnashtakavarga (Individual)</TabsTrigger>
            <TabsTrigger value="sarvashtakavarga">Sarvashtakavarga (Combined)</TabsTrigger>
          </TabsList>

          {/* Binnashtakavarga Tab - Professional Grid */}
          <TabsContent value="binnashtakavarga" className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-6 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gold-400 mb-4">
                Binnashtakavarga - Individual Benefic Points
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                12 Houses × 8 Contributors showing benefic points (bindus) contributed by each planet to each house
              </p>
              
              <div className="min-w-max">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gold-500/50">
                      <th className="p-3 text-left text-gold-400 font-semibold bg-slate-900/50">
                        House
                      </th>
                      <th className="p-3 text-left text-slate-400 font-semibold bg-slate-900/50">
                        Sign
                      </th>
                      {CONTRIBUTORS.map(({ label }) => (
                        <th key={label} className="p-3 text-center text-gold-300 font-semibold bg-slate-900/50 min-w-[60px]">
                          {label}
                        </th>
                      ))}
                      <th className="p-3 text-center text-gold-400 font-bold bg-slate-900/50 border-l-2 border-gold-500/50">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                      const rowTotal = currentData.sarva.find(s => s.house === house)?.totalBindus ?? 0;
                      const strength = currentData.sarva.find(s => s.house === house)?.strength;
                      
                      return (
                        <tr 
                          key={house}
                          className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="p-3 text-gold-300 font-bold bg-slate-900/30">
                            {house}
                          </td>
                          <td className="p-3 text-slate-300 text-sm bg-slate-900/30">
                            {HOUSE_SIGNS[house - 1]}
                          </td>
                          {CONTRIBUTORS.map(({ planet }) => {
                            const bindu = getBindu(house, planet);
                            return (
                              <td 
                                key={planet} 
                                className={`p-3 text-center font-mono font-semibold ${
                                  bindu === 1 
                                    ? "text-green-400 bg-green-900/20" 
                                    : "text-slate-500 bg-slate-900/10"
                                }`}
                              >
                                {bindu}
                              </td>
                            );
                          })}
                          <td className={`p-3 text-center font-bold text-lg border-l-2 border-gold-500/50 ${
                            strength === "strong" 
                              ? "text-green-400 bg-green-900/30" 
                              : strength === "medium"
                              ? "text-yellow-400 bg-yellow-900/30"
                              : "text-red-400 bg-red-900/30"
                          }`}>
                            {rowTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gold-500/50 bg-slate-900/50">
                      <td colSpan={2} className="p-3 text-gold-400 font-bold">
                        Column Total
                      </td>
                      {CONTRIBUTORS.map(({ planet }) => {
                        const colTotal = Array.from({ length: 12 }, (_, i) => i + 1)
                          .reduce((sum, house) => sum + getBindu(house, planet), 0);
                        return (
                          <td key={planet} className="p-3 text-center text-gold-300 font-bold">
                            {colTotal}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center text-gold-400 font-bold text-lg border-l-2 border-gold-500/50">
                        {currentData.sarva.reduce((sum, h) => sum + h.totalBindus, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 font-semibold mb-1">● Strong (31+)</div>
                  <div className="text-slate-300 text-xs">Highly favorable for house matters and transits</div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-yellow-400 font-semibold mb-1">● Medium (26-30)</div>
                  <div className="text-slate-300 text-xs">Moderate strength with average results</div>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 font-semibold mb-1">● Weak (≤25)</div>
                  <div className="text-slate-300 text-xs">Challenges expected during transits</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sarvashtakavarga Tab - Combined Scores with Bar Graph */}
          <TabsContent value="sarvashtakavarga" className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gold-400 mb-4">
                Sarvashtakavarga - Combined Benefic Points
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Total bindus from all 8 contributors (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Ascendant)
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table View */}
                <div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gold-500/50">
                        <th className="p-3 text-left text-gold-400 font-semibold bg-slate-900/50">
                          House
                        </th>
                        <th className="p-3 text-left text-slate-400 font-semibold bg-slate-900/50">
                          Sign
                        </th>
                        <th className="p-3 text-center text-gold-400 font-semibold bg-slate-900/50">
                          Bindus
                        </th>
                        <th className="p-3 text-center text-gold-400 font-semibold bg-slate-900/50">
                          Strength
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.sarva.map((house) => (
                        <tr 
                          key={house.house}
                          className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="p-3 text-gold-300 font-bold bg-slate-900/30">
                            {house.house}
                          </td>
                          <td className="p-3 text-slate-300 text-sm">
                            {HOUSE_SIGNS[house.house - 1]}
                          </td>
                          <td className={`p-3 text-center font-bold text-lg ${
                            house.strength === "strong" 
                              ? "text-green-400" 
                              : house.strength === "medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}>
                            {house.totalBindus}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              house.strength === "strong"
                                ? "bg-green-900/30 text-green-400 border border-green-500/50"
                                : house.strength === "medium"
                                ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/50"
                                : "bg-red-900/30 text-red-400 border border-red-500/50"
                            }`}>
                              {house.strength.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gold-500/50 bg-slate-900/50">
                        <td colSpan={2} className="p-3 text-gold-400 font-bold">
                          Total / Average
                        </td>
                        <td className="p-3 text-center text-gold-400 font-bold text-lg">
                          {currentData.sarva.reduce((sum, h) => sum + h.totalBindus, 0)}
                        </td>
                        <td className="p-3 text-center text-gold-400 font-bold">
                          {(currentData.sarva.reduce((sum, h) => sum + h.totalBindus, 0) / 12).toFixed(1)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bar Graph Visualization */}
                <div>
                  <h4 className="text-sm font-semibold text-gold-400 mb-4">Visual Distribution</h4>
                  <div className="space-y-2">
                    {currentData.sarva.map((house) => {
                      const percentage = (house.totalBindus / maxBindus) * 100;
                      return (
                        <div key={house.house} className="flex items-center gap-3">
                          <div className="w-8 text-gold-300 font-bold text-sm text-right">
                            H{house.house}
                          </div>
                          <div className="flex-1 bg-slate-900/50 rounded-full h-8 relative overflow-hidden border border-slate-700/50">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                house.strength === "strong"
                                  ? "bg-gradient-to-r from-green-600 to-green-400"
                                  : house.strength === "medium"
                                  ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                                  : "bg-gradient-to-r from-red-600 to-red-400"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-bold text-sm drop-shadow-lg">
                                {house.totalBindus}
                              </span>
                            </div>
                          </div>
                          <div className="w-16 text-slate-400 text-xs">
                            {HOUSE_SIGNS[house.house - 1].slice(0, 3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                    <h5 className="text-gold-400 font-semibold mb-3 text-sm">Key Insights</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-400 text-xs">Strongest House</div>
                        <div className="text-white font-bold">
                          H{currentData.sarva.find(h => h.totalBindus === maxBindus)?.house} ({maxBindus})
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Weakest House</div>
                        <div className="text-white font-bold">
                          H{currentData.sarva.find(h => h.totalBindus === minBindus)?.house} ({minBindus})
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Total Bindus</div>
                        <div className="text-white font-bold">
                          {currentData.sarva.reduce((sum, h) => sum + h.totalBindus, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Average per House</div>
                        <div className="text-white font-bold">
                          {(currentData.sarva.reduce((sum, h) => sum + h.totalBindus, 0) / 12).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <h5 className="text-gold-400 font-semibold mb-2 text-sm">Transit Application</h5>
                <p className="text-slate-300 text-xs leading-relaxed">
                  When planets transit through houses with <span className="text-green-400 font-semibold">high SAV (31+)</span>, 
                  they produce favorable results for house significations. Houses with <span className="text-red-400 font-semibold">low SAV (≤25)</span> 
                  indicate challenges during transits. Combine with Dasha periods for precise timing predictions.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

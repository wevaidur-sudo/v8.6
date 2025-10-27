import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type AshtakavargaScore,
  type SarvaAshtakavarga,
  type DivisionalAshtakavarga,
  type PrastaraAshtakavarga,
  type TrikonaShodhana,
  type EkadhipatyaShodhana,
  type KakshyaLord,
  type ShodhitaAshtakavarga,
  Planet,
} from "@shared/astro-schema";
import { useState } from "react";

interface EnhancedAshtakavargaDisplayProps {
  individual: AshtakavargaScore[];
  sarva: SarvaAshtakavarga[];
  prastara?: PrastaraAshtakavarga[];
  trikonaShodhana?: TrikonaShodhana[];
  ekadhipatyaShodhana?: EkadhipatyaShodhana[];
  kakshyaLords?: KakshyaLord[];
  shodhita?: ShodhitaAshtakavarga[];
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

const PLANETS_FOR_DETAIL = [
  { planet: Planet.Sun, label: "Sun" },
  { planet: Planet.Moon, label: "Moon" },
  { planet: Planet.Mars, label: "Mars" },
  { planet: Planet.Mercury, label: "Mercury" },
  { planet: Planet.Jupiter, label: "Jupiter" },
  { planet: Planet.Venus, label: "Venus" },
  { planet: Planet.Saturn, label: "Saturn" },
];

export function EnhancedAshtakavargaDisplay({
  individual,
  sarva,
  prastara,
  trikonaShodhana,
  ekadhipatyaShodhana,
  kakshyaLords,
  shodhita,
  divisionalAshtakavarga,
}: EnhancedAshtakavargaDisplayProps) {
  const [selectedChart, setSelectedChart] = useState<string>("rashi");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(Planet.Jupiter);

  // Get bindu for a specific planet in a specific house
  const getBindu = (house: number, planet: Planet): number => {
    const score = individual.find((s) => s.house === house && s.planet === planet);
    return score?.bindus ?? 0;
  };

  const maxBindus = Math.max(...sarva.map((h) => h.totalBindus));
  const minBindus = Math.min(...sarva.map((h) => h.totalBindus));

  // Determine number of tabs to show
  const hasAdvancedFeatures = prastara || trikonaShodhana || ekadhipatyaShodhana || kakshyaLords || shodhita;
  const gridCols = hasAdvancedFeatures ? "grid-cols-6" : "grid-cols-2";

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-800/30">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gold-400 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Ashtakavarga (Eight-fold Division) - Complete System
        </CardTitle>
        <CardDescription className="text-slate-300">
          Full Parashara's Light 9 precision: Basic + Advanced features including Shodhana, Prastara, and Kakshya
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="binnashtakavarga" className="w-full">
          <TabsList className={`grid w-full ${gridCols} mb-6 gap-1`}>
            <TabsTrigger value="binnashtakavarga" className="text-xs sm:text-sm">Binna</TabsTrigger>
            <TabsTrigger value="sarvashtakavarga" className="text-xs sm:text-sm">Sarva</TabsTrigger>
            {prastara && <TabsTrigger value="prastara" className="text-xs sm:text-sm">Prastara</TabsTrigger>}
            {trikonaShodhana && <TabsTrigger value="shodhana" className="text-xs sm:text-sm">Shodhana</TabsTrigger>}
            {kakshyaLords && <TabsTrigger value="kakshya" className="text-xs sm:text-sm">Kakshya</TabsTrigger>}
            {shodhita && <TabsTrigger value="shodhita" className="text-xs sm:text-sm">Shodhita</TabsTrigger>}
          </TabsList>

          {/* Binnashtakavarga Tab */}
          <TabsContent value="binnashtakavarga" className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-6 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gold-400 mb-4">
                Binnashtakavarga - Individual Benefic Points
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Shows benefic points (bindus) contributed by each of 8 contributors to each of 12 houses
              </p>

              <div className="min-w-max">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gold-500/50">
                      <th className="p-3 text-left text-gold-400 font-semibold bg-slate-900/50">House</th>
                      <th className="p-3 text-left text-slate-400 font-semibold bg-slate-900/50">Sign</th>
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
                      const rowTotal = sarva.find((s) => s.house === house)?.totalBindus ?? 0;
                      const strength = sarva.find((s) => s.house === house)?.strength;

                      return (
                        <tr key={house} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 text-gold-300 font-bold bg-slate-900/30">{house}</td>
                          <td className="p-3 text-slate-300 text-sm bg-slate-900/30">{HOUSE_SIGNS[house - 1]}</td>
                          {CONTRIBUTORS.map(({ planet }) => {
                            const bindu = getBindu(house, planet);
                            return (
                              <td
                                key={planet}
                                className={`p-3 text-center font-mono font-semibold ${
                                  bindu === 1 ? "text-green-400 bg-green-900/20" : "text-slate-500 bg-slate-900/10"
                                }`}
                              >
                                {bindu}
                              </td>
                            );
                          })}
                          <td
                            className={`p-3 text-center font-bold text-lg border-l-2 border-gold-500/50 ${
                              strength === "strong"
                                ? "text-green-400 bg-green-900/30"
                                : strength === "medium"
                                ? "text-yellow-400 bg-yellow-900/30"
                                : "text-red-400 bg-red-900/30"
                            }`}
                          >
                            {rowTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Sarvashtakavarga Tab */}
          <TabsContent value="sarvashtakavarga" className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gold-400 mb-4">
                Sarvashtakavarga - Combined Benefic Points
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Total bindus from all contributors. Strong: 31+, Medium: 26-30, Weak: ≤25
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {sarva.map((house) => (
                  <div
                    key={house.house}
                    className={`p-4 rounded-lg border-2 ${
                      house.strength === "strong"
                        ? "border-green-500/50 bg-green-900/20"
                        : house.strength === "medium"
                        ? "border-yellow-500/50 bg-yellow-900/20"
                        : "border-red-500/50 bg-red-900/20"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gold-300 font-bold">House {house.house}</span>
                        <span className="text-slate-400 text-sm ml-2">({HOUSE_SIGNS[house.house - 1]})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl font-bold ${
                            house.strength === "strong"
                              ? "text-green-400"
                              : house.strength === "medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {house.totalBindus}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            house.strength === "strong"
                              ? "bg-green-500/20 text-green-300"
                              : house.strength === "medium"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {house.strength.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {/* Bar visualization */}
                    <div className="mt-2 bg-slate-900/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          house.strength === "strong"
                            ? "bg-green-500"
                            : house.strength === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${(house.totalBindus / 56) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Prastara Ashtakavarga Tab */}
          {prastara && (
            <TabsContent value="prastara" className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gold-400 mb-4">
                  Prastara Ashtakavarga - Detailed Breakdown
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Shows exactly which contributor gives a bindu to each house for selected planet
                </p>

                <div className="mb-4">
                  <Select value={selectedPlanet} onValueChange={(value) => setSelectedPlanet(value as Planet)}>
                    <SelectTrigger className="w-full max-w-xs bg-slate-900/50 border-indigo-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-indigo-700/50">
                      {PLANETS_FOR_DETAIL.map(({ planet, label }) => (
                        <SelectItem key={planet} value={planet} className="text-slate-200">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-max">
                    <thead>
                      <tr className="border-b-2 border-gold-500/50">
                        <th className="p-2 text-left text-gold-400 font-semibold bg-slate-900/50">House</th>
                        {CONTRIBUTORS.map(({ label }) => (
                          <th key={label} className="p-2 text-center text-gold-300 font-semibold bg-slate-900/50 text-xs">
                            {label}
                          </th>
                        ))}
                        <th className="p-2 text-center text-gold-400 font-bold bg-slate-900/50">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                        const prastaraData = prastara.find(
                          (p) => p.planet === selectedPlanet && p.house === house
                        );
                        return (
                          <tr key={house} className="border-b border-slate-700/50">
                            <td className="p-2 text-gold-300 font-bold">{house}</td>
                            {CONTRIBUTORS.map(({ planet, label }) => {
                              const contributorData = prastaraData?.contributors.find(
                                (c) => c.contributor === (planet === Planet.Ascendant ? "Ascendant" : planet)
                              );
                              const hasBindu = contributorData?.bindu || false;
                              return (
                                <td
                                  key={label}
                                  className={`p-2 text-center ${
                                    hasBindu
                                      ? "text-green-400 bg-green-900/20 font-bold"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {hasBindu ? "●" : "○"}
                                </td>
                              );
                            })}
                            <td className="p-2 text-center font-bold text-gold-400">
                              {prastaraData?.totalBindus || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Shodhana Tab */}
          {trikonaShodhana && ekadhipatyaShodhana && (
            <TabsContent value="shodhana" className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gold-400 mb-4">
                  Shodhana (Reductions) - Classical Methods
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Shows Trikona Shodhana (trinal reduction) and Ekadhipatya Shodhana (same-lord reduction)
                </p>

                <div className="mb-4">
                  <Select value={selectedPlanet} onValueChange={(value) => setSelectedPlanet(value as Planet)}>
                    <SelectTrigger className="w-full max-w-xs bg-slate-900/50 border-indigo-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-indigo-700/50">
                      {PLANETS_FOR_DETAIL.map(({ planet, label }) => (
                        <SelectItem key={planet} value={planet} className="text-slate-200">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-6">
                  {/* Trikona Shodhana Table */}
                  <div>
                    <h4 className="text-md font-semibold text-gold-300 mb-3">Trikona Shodhana (5th & 9th House Reduction)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gold-500/50">
                            <th className="p-2 text-left text-gold-400 bg-slate-900/50">House</th>
                            <th className="p-2 text-center text-slate-400 bg-slate-900/50">Original</th>
                            <th className="p-2 text-center text-slate-400 bg-slate-900/50">5th Reduction</th>
                            <th className="p-2 text-center text-slate-400 bg-slate-900/50">9th Reduction</th>
                            <th className="p-2 text-center text-gold-400 bg-slate-900/50">After Trikona</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trikonaShodhana
                            .filter((t) => t.planet === selectedPlanet)
                            .map((data) => (
                              <tr key={data.house} className="border-b border-slate-700/50">
                                <td className="p-2 text-gold-300 font-bold">{data.house}</td>
                                <td className="p-2 text-center text-slate-300">{data.originalBindus}</td>
                                <td className="p-2 text-center text-red-400">-{data.fifthHouseReduction}</td>
                                <td className="p-2 text-center text-red-400">-{data.ninthHouseReduction}</td>
                                <td className="p-2 text-center text-green-400 font-bold">{data.afterReduction}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Ekadhipatya Shodhana Table */}
                  <div>
                    <h4 className="text-md font-semibold text-gold-300 mb-3">Ekadhipatya Shodhana (Same Lord Reduction)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gold-500/50">
                            <th className="p-2 text-left text-gold-400 bg-slate-900/50">House</th>
                            <th className="p-2 text-center text-slate-400 bg-slate-900/50">Before</th>
                            <th className="p-2 text-center text-slate-400 bg-slate-900/50">Same Lord Reduction</th>
                            <th className="p-2 text-center text-gold-400 bg-slate-900/50">After Ekadhipatya</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ekadhipatyaShodhana
                            .filter((e) => e.planet === selectedPlanet)
                            .map((data) => (
                              <tr key={data.house} className="border-b border-slate-700/50">
                                <td className="p-2 text-gold-300 font-bold">{data.house}</td>
                                <td className="p-2 text-center text-slate-300">{data.beforeReduction}</td>
                                <td className="p-2 text-center text-red-400">-{data.sameLordReduction}</td>
                                <td className="p-2 text-center text-green-400 font-bold">{data.afterReduction}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Kakshya Lords Tab */}
          {kakshyaLords && (
            <TabsContent value="kakshya" className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gold-400 mb-4">
                  Kakshya Lords - 8-Fold Division
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Each house divided into 8 parts (3°45' each) with planetary rulers
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kakshyaLords.map((houseData) => (
                    <div key={houseData.house} className="bg-slate-900/50 rounded-lg p-4 border border-indigo-800/30">
                      <h4 className="text-gold-300 font-bold mb-3">
                        House {houseData.house} - {houseData.sign}
                      </h4>
                      <div className="space-y-1">
                        {houseData.kakshyas.map((kakshya) => (
                          <div
                            key={kakshya.position}
                            className={`p-2 rounded text-sm flex justify-between ${
                              kakshya.hasBindu ? "bg-green-900/30 border-l-2 border-green-500" : "bg-slate-800/30"
                            }`}
                          >
                            <span className={kakshya.hasBindu ? "text-green-300 font-semibold" : "text-slate-400"}>
                              {kakshya.lord}
                            </span>
                            <span className="text-slate-500 text-xs">{kakshya.degrees}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Shodhita Ashtakavarga Tab */}
          {shodhita && (
            <TabsContent value="shodhita" className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gold-400 mb-4">
                  Shodhita Ashtakavarga - Final Reduced Scores
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Final bindus after all classical reductions (used for transit predictions)
                </p>

                <div className="mb-4">
                  <Select value={selectedPlanet} onValueChange={(value) => setSelectedPlanet(value as Planet)}>
                    <SelectTrigger className="w-full max-w-xs bg-slate-900/50 border-indigo-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-indigo-700/50">
                      {PLANETS_FOR_DETAIL.map(({ planet, label }) => (
                        <SelectItem key={planet} value={planet} className="text-slate-200">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gold-500/50">
                        <th className="p-3 text-left text-gold-400 bg-slate-900/50">House</th>
                        <th className="p-3 text-center text-slate-400 bg-slate-900/50">Original</th>
                        <th className="p-3 text-center text-slate-400 bg-slate-900/50">After Trikona</th>
                        <th className="p-3 text-center text-slate-400 bg-slate-900/50">After Ekadhipatya</th>
                        <th className="p-3 text-center text-gold-400 bg-slate-900/50 font-bold">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shodhita
                        .filter((s) => s.planet === selectedPlanet)
                        .map((data) => {
                          const reduction = data.originalBindus - data.finalBindus;
                          return (
                            <tr key={data.house} className="border-b border-slate-700/50">
                              <td className="p-3 text-gold-300 font-bold">{data.house}</td>
                              <td className="p-3 text-center text-slate-300">{data.originalBindus}</td>
                              <td className="p-3 text-center text-blue-400">{data.afterTrikonaShodhana}</td>
                              <td className="p-3 text-center text-cyan-400">{data.afterEkadhipatyaShodhana}</td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span
                                    className={`text-lg font-bold ${
                                      data.finalBindus >= 4
                                        ? "text-green-400"
                                        : data.finalBindus >= 2
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {data.finalBindus}
                                  </span>
                                  {reduction > 0 && (
                                    <span className="text-xs text-red-500">(-{reduction})</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gold-400 mb-2">Interpretation Guide:</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">●</span>
                      <span><strong className="text-green-300">4+ bindus:</strong> Very favorable for transits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-400">●</span>
                      <span><strong className="text-yellow-300">2-3 bindus:</strong> Moderate support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">●</span>
                      <span><strong className="text-red-300">0-1 bindus:</strong> Challenging period for transits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

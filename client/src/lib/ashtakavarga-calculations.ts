import {
  type PlanetPosition,
  type AshtakavargaScore,
  type SarvaAshtakavarga,
  type DivisionalAshtakavarga,
  type HouseData,
  Planet,
  ZodiacSign,
  DivisionalChartType,
} from "@shared/astro-schema";

/**
 * Ashtakavarga Calculation Module
 * 
 * Implements classical Ashtakavarga (Eight-fold Division) system from
 * Brihat Parashara Hora Shastra (BPHS) Chapter 51.
 * 
 * Ashtakavarga assigns benefic points (bindus) to each house based on
 * planetary positions. Eight contributors (7 planets + Ascendant) each
 * contribute 0-1 bindu to specific houses following classical rules.
 * 
 * References:
 * - BPHS Chapter 51: Ashtakavarga Adhyaya
 * - Phaladeepika Chapter 5: Ashtakavarga
 * - Jataka Parijata: Ashtakavarga principles
 */

/**
 * Classical benefic house positions for each contributor
 * Key: Contributing planet/point
 * Value: Array of house numbers (1-12) that receive bindus when counted from that contributor
 */
const ASHTAKAVARGA_BINDUS: Record<string, Record<string, number[]>> = {
  Sun: {
    fromSun: [1, 2, 4, 7, 8, 9, 10, 11],
    fromMoon: [3, 6, 10, 11],
    fromMars: [1, 2, 4, 7, 8, 9, 10, 11],
    fromMercury: [3, 5, 6, 9, 10, 11, 12],
    fromJupiter: [5, 6, 9, 11],
    fromVenus: [6, 7, 12],
    fromSaturn: [1, 2, 4, 7, 8, 9, 10, 11],
    fromAscendant: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    fromSun: [3, 6, 7, 8, 10, 11],
    fromMoon: [1, 3, 6, 7, 10, 11],
    fromMars: [2, 3, 5, 6, 9, 10, 11],
    fromMercury: [1, 3, 4, 5, 7, 8, 10, 11],
    fromJupiter: [1, 4, 7, 8, 10, 11, 12],
    fromVenus: [3, 4, 5, 7, 9, 10, 11],
    fromSaturn: [3, 5, 6, 11],
    fromAscendant: [3, 6, 7, 8, 10, 11],
  },
  Mars: {
    fromSun: [1, 2, 4, 7, 8, 10, 11],
    fromMoon: [3, 5, 6, 10, 11],
    fromMars: [1, 2, 4, 7, 8, 10, 11],
    fromMercury: [3, 5, 6, 11],
    fromJupiter: [6, 10, 11, 12],
    fromVenus: [6, 8, 11, 12],
    fromSaturn: [1, 4, 7, 8, 10, 11],
    fromAscendant: [1, 3, 6, 10, 11],
  },
  Mercury: {
    fromSun: [5, 6, 9, 11, 12],
    fromMoon: [2, 4, 6, 8, 10, 11],
    fromMars: [1, 2, 4, 7, 8, 9, 10, 11],
    fromMercury: [1, 3, 5, 6, 9, 10, 11, 12],
    fromJupiter: [6, 8, 11, 12],
    fromVenus: [1, 2, 3, 4, 5, 8, 9, 11],
    fromSaturn: [1, 2, 4, 7, 8, 9, 10, 11],
    fromAscendant: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    fromSun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    fromMoon: [2, 5, 7, 9, 11],
    fromMars: [1, 2, 4, 7, 8, 10, 11],
    fromMercury: [1, 2, 4, 5, 6, 9, 10, 11],
    fromJupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    fromVenus: [2, 5, 6, 9, 10, 11],
    fromSaturn: [3, 5, 6, 12],
    fromAscendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    fromSun: [8, 11, 12],
    fromMoon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    fromMars: [3, 4, 6, 9, 11, 12],
    fromMercury: [3, 5, 6, 9, 11],
    fromJupiter: [5, 8, 9, 10, 11],
    fromVenus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    fromSaturn: [3, 4, 5, 8, 9, 10, 11],
    fromAscendant: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    fromSun: [1, 2, 4, 7, 8, 10, 11],
    fromMoon: [3, 6, 11],
    fromMars: [3, 5, 6, 10, 11, 12],
    fromMercury: [6, 8, 9, 10, 11, 12],
    fromJupiter: [5, 6, 11, 12],
    fromVenus: [6, 11, 12],
    fromSaturn: [3, 5, 6, 11],
    fromAscendant: [1, 3, 4, 6, 10, 11],
  },
  Ascendant: {
    fromSun: [3, 4, 6, 10, 11, 12],
    fromMoon: [3, 6, 7, 8, 10, 11],
    fromMars: [1, 3, 6, 10, 11],
    fromMercury: [1, 2, 4, 6, 8, 10, 11],
    fromJupiter: [1, 2, 4, 5, 6, 7, 9, 10, 11],
    fromVenus: [1, 2, 3, 4, 5, 8, 9, 11],
    fromSaturn: [1, 3, 4, 6, 10, 11],
    fromAscendant: [3, 4, 6, 10, 11, 12],
  },
};

/**
 * Get the house number a target planet/ascendant occupies when counted from a reference planet
 */
function getHouseFromPlanet(
  referencePlanetHouse: number,
  targetPlanetHouse: number
): number {
  let house = targetPlanetHouse - referencePlanetHouse + 1;
  if (house <= 0) {
    house += 12;
  }
  return house;
}

/**
 * Calculate individual Ashtakavarga for a specific planet
 * Returns array of bindus (0-8) for each of the 12 houses
 */
function calculateIndividualAshtakavarga(
  targetPlanet: Planet,
  planetPositions: PlanetPosition[]
): number[] {
  const houseBindus = new Array(12).fill(0);

  if (!ASHTAKAVARGA_BINDUS[targetPlanet]) {
    return houseBindus;
  }

  const targetRules = ASHTAKAVARGA_BINDUS[targetPlanet];
  const targetPos = planetPositions.find((p) => p.planet === targetPlanet);

  if (!targetPos) {
    return houseBindus;
  }

  const contributors = [
    { name: "Sun", position: planetPositions.find((p) => p.planet === Planet.Sun) },
    { name: "Moon", position: planetPositions.find((p) => p.planet === Planet.Moon) },
    { name: "Mars", position: planetPositions.find((p) => p.planet === Planet.Mars) },
    { name: "Mercury", position: planetPositions.find((p) => p.planet === Planet.Mercury) },
    { name: "Jupiter", position: planetPositions.find((p) => p.planet === Planet.Jupiter) },
    { name: "Venus", position: planetPositions.find((p) => p.planet === Planet.Venus) },
    { name: "Saturn", position: planetPositions.find((p) => p.planet === Planet.Saturn) },
    { name: "Ascendant", position: planetPositions.find((p) => p.planet === Planet.Ascendant) },
  ];

  contributors.forEach((contributor) => {
    if (!contributor.position) return;

    const contributorKey = `from${contributor.name}`;
    const beneficHouses = targetRules[contributorKey];

    if (!beneficHouses) return;

    for (let house = 1; house <= 12; house++) {
      const houseFromContributor = getHouseFromPlanet(
        contributor.position.house,
        house
      );

      if (beneficHouses.includes(houseFromContributor)) {
        houseBindus[house - 1] += 1;
      }
    }
  });

  return houseBindus;
}

/**
 * Calculate complete Ashtakavarga for all planets
 */
export function calculateAshtakavarga(
  planetPositions: PlanetPosition[]
): {
  individual: AshtakavargaScore[];
  sarva: SarvaAshtakavarga[];
} {
  const individual: AshtakavargaScore[] = [];
  const sarvaBindus = new Array(12).fill(0);

  const planetsToCalculate = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  planetsToCalculate.forEach((planet) => {
    const bindus = calculateIndividualAshtakavarga(planet, planetPositions);

    for (let house = 1; house <= 12; house++) {
      const binduCount = bindus[house - 1];
      individual.push({
        planet,
        house,
        bindus: binduCount,
      });

      sarvaBindus[house - 1] += binduCount;
    }
  });

  const ascendantBindus = calculateIndividualAshtakavarga(
    Planet.Ascendant,
    planetPositions
  );

  for (let house = 1; house <= 12; house++) {
    const binduCount = ascendantBindus[house - 1];
    individual.push({
      planet: Planet.Ascendant,
      house,
      bindus: binduCount,
    });

    sarvaBindus[house - 1] += binduCount;
  }

  const sarva: SarvaAshtakavarga[] = [];
  for (let house = 1; house <= 12; house++) {
    const totalBindus = sarvaBindus[house - 1];
    let strength: "weak" | "medium" | "strong";

    if (totalBindus <= 25) {
      strength = "weak";
    } else if (totalBindus <= 30) {
      strength = "medium";
    } else {
      strength = "strong";
    }

    sarva.push({
      house,
      totalBindus,
      strength,
    });
  }

  return { individual, sarva };
}

/**
 * Get Ashtakavarga scores for a specific planet across all houses
 */
export function getAshtakavargaForPlanet(
  planet: Planet,
  individual: AshtakavargaScore[]
): AshtakavargaScore[] {
  return individual.filter((score) => score.planet === planet);
}

/**
 * Get Ashtakavarga scores for a specific house from all planets
 */
export function getAshtakavargaForHouse(
  house: number,
  individual: AshtakavargaScore[]
): AshtakavargaScore[] {
  return individual.filter((score) => score.house === house);
}

/**
 * Calculate total bindus for a planet across all houses
 */
export function getTotalBindusForPlanet(
  planet: Planet,
  individual: AshtakavargaScore[]
): number {
  return individual
    .filter((score) => score.planet === planet)
    .reduce((sum, score) => sum + score.bindus, 0);
}

/**
 * Analyze Sarva Ashtakavarga strength distribution
 */
export function analyzeSarvaStrength(sarva: SarvaAshtakavarga[]): {
  strongHouses: number[];
  mediumHouses: number[];
  weakHouses: number[];
  averageBindus: number;
} {
  const strongHouses = sarva.filter((s) => s.strength === "strong").map((s) => s.house);
  const mediumHouses = sarva.filter((s) => s.strength === "medium").map((s) => s.house);
  const weakHouses = sarva.filter((s) => s.strength === "weak").map((s) => s.house);
  
  const totalBindus = sarva.reduce((sum, s) => sum + s.totalBindus, 0);
  const averageBindus = totalBindus / 12;

  return {
    strongHouses,
    mediumHouses,
    weakHouses,
    averageBindus: Math.round(averageBindus * 10) / 10,
  };
}

/**
 * Calculate Ashtakavarga for a specific divisional chart
 */
export function calculateDivisionalAshtakavarga(
  chartType: DivisionalChartType,
  chartName: string,
  planetPositions: PlanetPosition[]
): DivisionalAshtakavarga {
  const { individual, sarva } = calculateAshtakavarga(planetPositions);
  
  return {
    chartType,
    chartName,
    individual,
    sarva,
  };
}

/**
 * Calculate Ashtakavarga for all divisional charts
 * 
 * Takes divisional chart planet positions and ascendant information
 * and returns Ashtakavarga calculations for all 16 standard divisional charts.
 * 
 * @param divisionalCharts - Object containing planet positions for all divisional charts
 * @returns Array of DivisionalAshtakavarga for all charts
 */
export function calculateAllDivisionalAshtakavarga(
  divisionalCharts: {
    d1?: { planetPositions: PlanetPosition[] };
    d2?: { planetPositions: PlanetPosition[] };
    d3?: { planetPositions: PlanetPosition[] };
    d4?: { planetPositions: PlanetPosition[] };
    d5?: { planetPositions: PlanetPosition[] };
    d6?: { planetPositions: PlanetPosition[] };
    d7?: { planetPositions: PlanetPosition[] };
    d8?: { planetPositions: PlanetPosition[] };
    d9?: { planetPositions: PlanetPosition[] };
    d10?: { planetPositions: PlanetPosition[] };
    d11?: { planetPositions: PlanetPosition[] };
    d12?: { planetPositions: PlanetPosition[] };
    d16?: { planetPositions: PlanetPosition[] };
    d20?: { planetPositions: PlanetPosition[] };
    d24?: { planetPositions: PlanetPosition[] };
    d27?: { planetPositions: PlanetPosition[] };
    d30?: { planetPositions: PlanetPosition[] };
    d40?: { planetPositions: PlanetPosition[] };
    d45?: { planetPositions: PlanetPosition[] };
    d60?: { planetPositions: PlanetPosition[] };
  }
): DivisionalAshtakavarga[] {
  const results: DivisionalAshtakavarga[] = [];

  const chartsConfig = [
    { key: 'd1', type: DivisionalChartType.D1, name: 'Rashi (Birth Chart)' },
    { key: 'd2', type: DivisionalChartType.D2, name: 'Hora (Wealth)' },
    { key: 'd3', type: DivisionalChartType.D3, name: 'Drekkana (Siblings)' },
    { key: 'd4', type: DivisionalChartType.D4, name: 'Chaturthamsa (Property)' },
    { key: 'd7', type: DivisionalChartType.D7, name: 'Saptamsa (Children)' },
    { key: 'd9', type: DivisionalChartType.D9, name: 'Navamsa (Spouse)' },
    { key: 'd10', type: DivisionalChartType.D10, name: 'Dasamsa (Career)' },
    { key: 'd12', type: DivisionalChartType.D12, name: 'Dwadasamsa (Parents)' },
    { key: 'd16', type: DivisionalChartType.D16, name: 'Shodasamsa (Vehicles)' },
    { key: 'd20', type: DivisionalChartType.D20, name: 'Vimsamsa (Spirituality)' },
    { key: 'd24', type: DivisionalChartType.D24, name: 'Chaturvimsamsa (Education)' },
    { key: 'd27', type: DivisionalChartType.D27, name: 'Nakshatramsa (Strengths)' },
    { key: 'd30', type: DivisionalChartType.D30, name: 'Trimsamsa (Misfortunes)' },
    { key: 'd40', type: DivisionalChartType.D40, name: 'Khavedamsa (Effects)' },
    { key: 'd45', type: DivisionalChartType.D45, name: 'Akshavedamsa (Character)' },
    { key: 'd60', type: DivisionalChartType.D60, name: 'Shashtiamsa (Karma)' },
  ];

  for (const config of chartsConfig) {
    const chart = divisionalCharts[config.key as keyof typeof divisionalCharts];
    if (chart && chart.planetPositions && chart.planetPositions.length > 0) {
      results.push(
        calculateDivisionalAshtakavarga(
          config.type,
          config.name,
          chart.planetPositions
        )
      );
    }
  }

  return results;
}

// ============================================================================
// ADVANCED ASHTAKAVARGA FEATURES
// ============================================================================

/**
 * Calculate Prastara Ashtakavarga - Detailed breakdown showing each contributor
 * This shows exactly which planet/ascendant gives a bindu to each house
 */
export function calculatePrastaraAshtakavarga(
  planetPositions: PlanetPosition[]
): import("@shared/astro-schema").PrastaraAshtakavarga[] {
  const prastara: import("@shared/astro-schema").PrastaraAshtakavarga[] = [];

  const planetsToCalculate = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  planetsToCalculate.forEach((targetPlanet) => {
    const targetRules = ASHTAKAVARGA_BINDUS[targetPlanet];
    if (!targetRules) return;

    const contributors = [
      { name: "Sun", planet: Planet.Sun },
      { name: "Moon", planet: Planet.Moon },
      { name: "Mars", planet: Planet.Mars },
      { name: "Mercury", planet: Planet.Mercury },
      { name: "Jupiter", planet: Planet.Jupiter },
      { name: "Venus", planet: Planet.Venus },
      { name: "Saturn", planet: Planet.Saturn },
      { name: "Ascendant", planet: Planet.Ascendant },
    ];

    for (let house = 1; house <= 12; house++) {
      const contributorDetails: {
        contributor: Planet | "Ascendant";
        bindu: boolean;
      }[] = [];

      contributors.forEach((contributor) => {
        const contributorPos = planetPositions.find(
          (p) => p.planet === contributor.planet
        );
        if (!contributorPos) return;

        const contributorKey = `from${contributor.name}`;
        const beneficHouses = targetRules[contributorKey];
        if (!beneficHouses) return;

        const houseFromContributor = getHouseFromPlanet(
          contributorPos.house,
          house
        );

        const hasBindu = beneficHouses.includes(houseFromContributor);
        contributorDetails.push({
          contributor: contributor.planet === Planet.Ascendant ? "Ascendant" : contributor.planet,
          bindu: hasBindu,
        });
      });

      const totalBindus = contributorDetails.filter((c) => c.bindu).length;

      prastara.push({
        planet: targetPlanet,
        house,
        contributors: contributorDetails,
        totalBindus,
      });
    }
  });

  return prastara;
}

/**
 * Calculate Trikona Shodhana (Reduction from Trinal Houses)
 * Classical reduction method: subtract bindus of 5th and 9th houses from each house
 */
export function calculateTrikonaShodhana(
  individual: AshtakavargaScore[]
): import("@shared/astro-schema").TrikonaShodhana[] {
  const trikonaShodhana: import("@shared/astro-schema").TrikonaShodhana[] = [];

  const planetsToCalculate = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  planetsToCalculate.forEach((planet) => {
    const planetScores = individual.filter((s) => s.planet === planet);

    for (let house = 1; house <= 12; house++) {
      const originalBindus = planetScores.find((s) => s.house === house)?.bindus || 0;
      
      // 5th house from current house (trikona)
      const fifthHouse = ((house - 1 + 4) % 12) + 1;
      const fifthHouseBindus = planetScores.find((s) => s.house === fifthHouse)?.bindus || 0;
      
      // 9th house from current house (trikona)
      const ninthHouse = ((house - 1 + 8) % 12) + 1;
      const ninthHouseBindus = planetScores.find((s) => s.house === ninthHouse)?.bindus || 0;

      // Calculate reduction
      const fifthReduction = Math.min(originalBindus, fifthHouseBindus);
      const remainingAfterFifth = originalBindus - fifthReduction;
      const ninthReduction = Math.min(remainingAfterFifth, ninthHouseBindus);
      
      const afterReduction = Math.max(0, originalBindus - fifthReduction - ninthReduction);

      trikonaShodhana.push({
        planet,
        house,
        originalBindus,
        fifthHouseReduction: fifthReduction,
        ninthHouseReduction: ninthReduction,
        afterReduction,
      });
    }
  });

  return trikonaShodhana;
}

/**
 * Get sign lord (planetary ruler) for a zodiac sign
 */
function getSignLord(sign: ZodiacSign): Planet {
  const signLords: Record<ZodiacSign, Planet> = {
    [ZodiacSign.Aries]: Planet.Mars,
    [ZodiacSign.Taurus]: Planet.Venus,
    [ZodiacSign.Gemini]: Planet.Mercury,
    [ZodiacSign.Cancer]: Planet.Moon,
    [ZodiacSign.Leo]: Planet.Sun,
    [ZodiacSign.Virgo]: Planet.Mercury,
    [ZodiacSign.Libra]: Planet.Venus,
    [ZodiacSign.Scorpio]: Planet.Mars,
    [ZodiacSign.Sagittarius]: Planet.Jupiter,
    [ZodiacSign.Capricorn]: Planet.Saturn,
    [ZodiacSign.Aquarius]: Planet.Saturn,
    [ZodiacSign.Pisces]: Planet.Jupiter,
  };
  return signLords[sign];
}

/**
 * Calculate Ekadhipatya Shodhana (Reduction for Signs with Same Lord)
 * Reduction is applied when consecutive signs have the same planetary lord
 */
export function calculateEkadhipatyaShodhana(
  trikonaShodhana: import("@shared/astro-schema").TrikonaShodhana[],
  houseData: HouseData[]
): import("@shared/astro-schema").EkadhipatyaShodhana[] {
  const ekadhipatyaShodhana: import("@shared/astro-schema").EkadhipatyaShodhana[] = [];

  const planetsToCalculate = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  planetsToCalculate.forEach((planet) => {
    const planetScores = trikonaShodhana.filter((s) => s.planet === planet);

    for (let house = 1; house <= 12; house++) {
      const beforeReduction = planetScores.find((s) => s.house === house)?.afterReduction || 0;
      
      // Get signs for current and next house
      const currentHouse = houseData.find((h) => h.houseNumber === house);
      const nextHouse = houseData.find((h) => h.houseNumber === ((house % 12) + 1));
      
      let sameLordReduction = 0;
      
      if (currentHouse && nextHouse) {
        const currentLord = getSignLord(currentHouse.sign);
        const nextLord = getSignLord(nextHouse.sign);
        
        // If both signs have same lord (Ekadhipatya)
        if (currentLord === nextLord) {
          const nextHouseBindus = planetScores.find((s) => s.house === ((house % 12) + 1))?.afterReduction || 0;
          sameLordReduction = Math.min(beforeReduction, nextHouseBindus);
        }
      }

      const afterReduction = Math.max(0, beforeReduction - sameLordReduction);

      ekadhipatyaShodhana.push({
        planet,
        house,
        beforeReduction,
        sameLordReduction,
        afterReduction,
      });
    }
  });

  return ekadhipatyaShodhana;
}

/**
 * Calculate Kakshya Lords (8-Fold Division of Each Sign)
 * Each sign is divided into 8 parts (kakshyas) of 3°45' each
 * Each kakshya is ruled by a specific planet in a fixed order
 */
export function calculateKakshyaLords(
  houseData: HouseData[],
  individual: AshtakavargaScore[]
): import("@shared/astro-schema").KakshyaLord[] {
  const kakshyaLords: import("@shared/astro-schema").KakshyaLord[] = [];
  
  // Fixed order of Kakshya lords for each sign
  const kakshyaOrder: Planet[] = [
    Planet.Saturn,
    Planet.Jupiter,
    Planet.Mars,
    Planet.Sun,
    Planet.Venus,
    Planet.Mercury,
    Planet.Moon,
  ];

  houseData.forEach((house) => {
    const kakshyas: {
      position: number;
      lord: Planet;
      degrees: string;
      hasBindu: boolean;
    }[] = [];

    for (let i = 0; i < 8; i++) {
      const startDegree = i * 3.75;
      const endDegree = (i + 1) * 3.75;
      
      // Kakshya lord cycles through the 7 planets
      const lordIndex = i % 7;
      const lord = kakshyaOrder[lordIndex];
      
      // Check if this kakshya lord has bindu in this house
      const lordScore = individual.find(
        (s) => s.planet === lord && s.house === house.houseNumber
      );
      const hasBindu = (lordScore?.bindus || 0) > 0;

      const startDeg = Math.floor(startDegree);
      const startMin = Math.floor((startDegree - startDeg) * 60);
      const endDeg = Math.floor(endDegree);
      const endMin = Math.floor((endDegree - endDeg) * 60);

      kakshyas.push({
        position: i + 1,
        lord,
        degrees: `${startDeg}°${startMin.toString().padStart(2, '0')}' - ${endDeg}°${endMin.toString().padStart(2, '0')}'`,
        hasBindu,
      });
    }

    kakshyaLords.push({
      house: house.houseNumber,
      sign: house.sign,
      kakshyas,
    });
  });

  return kakshyaLords;
}

/**
 * Calculate Shodhita Ashtakavarga (Final Reduced Scores)
 * Shows the progression of reductions from original to final scores
 */
export function calculateShodhitaAshtakavarga(
  individual: AshtakavargaScore[],
  trikonaShodhana: import("@shared/astro-schema").TrikonaShodhana[],
  ekadhipatyaShodhana: import("@shared/astro-schema").EkadhipatyaShodhana[]
): import("@shared/astro-schema").ShodhitaAshtakavarga[] {
  const shodhita: import("@shared/astro-schema").ShodhitaAshtakavarga[] = [];

  const planetsToCalculate = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  planetsToCalculate.forEach((planet) => {
    for (let house = 1; house <= 12; house++) {
      const original = individual.find((s) => s.planet === planet && s.house === house)?.bindus || 0;
      const afterTrikona = trikonaShodhana.find((s) => s.planet === planet && s.house === house)?.afterReduction || 0;
      const afterEkadhipatya = ekadhipatyaShodhana.find((s) => s.planet === planet && s.house === house)?.afterReduction || 0;

      shodhita.push({
        planet,
        house,
        originalBindus: original,
        afterTrikonaShodhana: afterTrikona,
        afterEkadhipatyaShodhana: afterEkadhipatya,
        finalBindus: afterEkadhipatya,
      });
    }
  });

  return shodhita;
}

/**
 * Calculate Complete Ashtakavarga System
 * Returns all Ashtakavarga calculations including advanced features
 */
export function calculateCompleteAshtakavargaSystem(
  planetPositions: PlanetPosition[],
  houseData: HouseData[]
): import("@shared/astro-schema").CompleteAshtakavargaSystem {
  // Basic calculations
  const { individual, sarva } = calculateAshtakavarga(planetPositions);
  
  // Advanced calculations
  const prastara = calculatePrastaraAshtakavarga(planetPositions);
  const trikonaShodhana = calculateTrikonaShodhana(individual);
  const ekadhipatyaShodhana = calculateEkadhipatyaShodhana(trikonaShodhana, houseData);
  const kakshyaLords = calculateKakshyaLords(houseData, individual);
  const shodhita = calculateShodhitaAshtakavarga(individual, trikonaShodhana, ekadhipatyaShodhana);

  return {
    individual,
    sarva,
    prastara,
    trikonaShodhana,
    ekadhipatyaShodhana,
    kakshyaLords,
    shodhita,
  };
}

/**
 * Transit Timing Analysis using Ashtakavarga
 * Predicts favorable/unfavorable periods when planets transit through houses
 */
export interface TransitTiming {
  planet: Planet;
  transitHouse: number;
  transitSign: ZodiacSign;
  binduScore: number;
  shodhitaScore: number;
  favorability: "very_favorable" | "favorable" | "neutral" | "unfavorable" | "very_unfavorable";
  interpretation: string;
}

export function analyzeTransitTiming(
  transitingPlanet: Planet,
  transitHouse: number,
  transitSign: ZodiacSign,
  individual: AshtakavargaScore[],
  shodhita?: import("@shared/astro-schema").ShodhitaAshtakavarga[]
): TransitTiming {
  // Get bindu score for transiting planet in transit house
  const binduScore = individual.find(
    (s) => s.planet === transitingPlanet && s.house === transitHouse
  )?.bindus || 0;

  // Get shodhita score if available
  const shodhitaScore = shodhita?.find(
    (s) => s.planet === transitingPlanet && s.house === transitHouse
  )?.finalBindus || binduScore;

  // Determine favorability based on bindu scores
  let favorability: "very_favorable" | "favorable" | "neutral" | "unfavorable" | "very_unfavorable";
  let interpretation: string;

  if (shodhitaScore >= 5) {
    favorability = "very_favorable";
    interpretation = `Excellent period for ${transitingPlanet} significations. High Ashtakavarga score (${shodhitaScore} bindus) indicates strong support and favorable outcomes. This is an auspicious time for matters related to this house.`;
  } else if (shodhitaScore >= 3) {
    favorability = "favorable";
    interpretation = `Favorable period for ${transitingPlanet} significations. Good Ashtakavarga score (${shodhitaScore} bindus) indicates positive support. Expect beneficial results in matters related to this house.`;
  } else if (shodhitaScore >= 2) {
    favorability = "neutral";
    interpretation = `Neutral period for ${transitingPlanet} significations. Moderate Ashtakavarga score (${shodhitaScore} bindus) indicates mixed results. Exercise caution and use discretion.`;
  } else if (shodhitaScore >= 1) {
    favorability = "unfavorable";
    interpretation = `Challenging period for ${transitingPlanet} significations. Low Ashtakavarga score (${shodhitaScore} bindus) indicates limited support. Avoid new initiatives related to this house.`;
  } else {
    favorability = "very_unfavorable";
    interpretation = `Very difficult period for ${transitingPlanet} significations. No Ashtakavarga support (${shodhitaScore} bindus). This is an inauspicious time for matters related to this house. Practice patience and avoid major decisions.`;
  }

  return {
    planet: transitingPlanet,
    transitHouse,
    transitSign,
    binduScore,
    shodhitaScore,
    favorability,
    interpretation,
  };
}

/**
 * Analyze all transiting planets using Ashtakavarga
 */
export function analyzeAllTransitTimings(
  currentTransitPositions: PlanetPosition[],
  individual: AshtakavargaScore[],
  shodhita?: import("@shared/astro-schema").ShodhitaAshtakavarga[]
): TransitTiming[] {
  const transitTimings: TransitTiming[] = [];

  const transitPlanets = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  transitPlanets.forEach((planet) => {
    const transitPos = currentTransitPositions.find((p) => p.planet === planet);
    if (transitPos) {
      const timing = analyzeTransitTiming(
        planet,
        transitPos.house,
        transitPos.sign,
        individual,
        shodhita
      );
      transitTimings.push(timing);
    }
  });

  return transitTimings;
}

/**
 * Find upcoming favorable transit periods
 * Returns houses where transits will be most favorable for a given planet
 */
export function findFavorableTransitHouses(
  planet: Planet,
  individual: AshtakavargaScore[],
  shodhita?: import("@shared/astro-schema").ShodhitaAshtakavarga[]
): {
  house: number;
  binduScore: number;
  shodhitaScore: number;
  favorability: string;
}[] {
  const houses: {
    house: number;
    binduScore: number;
    shodhitaScore: number;
    favorability: string;
  }[] = [];

  for (let house = 1; house <= 12; house++) {
    const binduScore = individual.find(
      (s) => s.planet === planet && s.house === house
    )?.bindus || 0;

    const shodhitaScore = shodhita?.find(
      (s) => s.planet === planet && s.house === house
    )?.finalBindus || binduScore;

    let favorability: string;
    if (shodhitaScore >= 5) favorability = "very_favorable";
    else if (shodhitaScore >= 3) favorability = "favorable";
    else if (shodhitaScore >= 2) favorability = "neutral";
    else if (shodhitaScore >= 1) favorability = "unfavorable";
    else favorability = "very_unfavorable";

    houses.push({
      house,
      binduScore,
      shodhitaScore,
      favorability,
    });
  }

  // Sort by shodhitaScore descending
  return houses.sort((a, b) => b.shodhitaScore - a.shodhitaScore);
}

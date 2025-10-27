import {
  type PlanetPosition,
  Planet,
} from "@shared/astro-schema";

/**
 * Advanced Aspect (Drishti) Engine
 * Implements special planetary aspects beyond the 7th house aspect
 * Mars: 4th, 7th, 8th aspects
 * Jupiter: 5th, 7th, 9th aspects
 * Saturn: 3rd, 7th, 10th aspects
 */

export interface AspectInfo {
  aspectingPlanet: Planet;
  aspectedPlanet: Planet;
  aspectType: "full" | "three_quarter" | "half" | "quarter";
  aspectHouse: number;
  strength: number;
  description: string;
  isSpecial: boolean;
}

/**
 * Calculate aspect strength based on house distance
 */
function getAspectStrength(houseDiff: number, planet: Planet): number {
  if (planet === Planet.Mars) {
    if (houseDiff === 4) return 75;
    if (houseDiff === 7) return 100;
    if (houseDiff === 8) return 100;
  } else if (planet === Planet.Jupiter) {
    if (houseDiff === 5) return 75;
    if (houseDiff === 7) return 100;
    if (houseDiff === 9) return 100;
  } else if (planet === Planet.Saturn) {
    if (houseDiff === 3) return 100;
    if (houseDiff === 7) return 100;
    if (houseDiff === 10) return 100;
  } else {
    if (houseDiff === 7) return 100;
  }

  return 0;
}

/**
 * Get aspect type description
 */
function getAspectType(strength: number): "full" | "three_quarter" | "half" | "quarter" {
  if (strength >= 100) return "full";
  if (strength >= 75) return "three_quarter";
  if (strength >= 50) return "half";
  return "quarter";
}

/**
 * Calculate all aspects in the chart
 */
export function calculateAllAspects(
  planetPositions: PlanetPosition[]
): AspectInfo[] {
  const aspects: AspectInfo[] = [];

  const planets = planetPositions.filter(
    (p) => p.planet !== Planet.Ascendant
  );

  for (const planet1 of planets) {
    for (const planet2 of planets) {
      if (planet1.planet === planet2.planet) continue;

      const houseDiff = ((planet2.house - planet1.house + 12) % 12);

      const strength = getAspectStrength(houseDiff, planet1.planet);

      if (strength > 0) {
        const isSpecial = planet1.planet === Planet.Mars && [4, 8].includes(houseDiff) ||
          planet1.planet === Planet.Jupiter && [5, 9].includes(houseDiff) ||
          planet1.planet === Planet.Saturn && [3, 10].includes(houseDiff);

        aspects.push({
          aspectingPlanet: planet1.planet,
          aspectedPlanet: planet2.planet,
          aspectType: getAspectType(strength),
          aspectHouse: planet2.house,
          strength,
          description: `${planet1.planet} aspects ${planet2.planet} ${isSpecial ? `(special ${houseDiff}${getOrdinalSuffix(houseDiff)} house aspect)` : `(${houseDiff}${getOrdinalSuffix(houseDiff)} house aspect)`}`,
          isSpecial,
        });
      }
    }
  }

  return aspects;
}

/**
 * Get aspects on a specific planet
 */
export function getAspectsOnPlanet(
  planet: Planet,
  allAspects: AspectInfo[]
): AspectInfo[] {
  return allAspects.filter((a) => a.aspectedPlanet === planet);
}

/**
 * Get aspects from a specific planet
 */
export function getAspectsFromPlanet(
  planet: Planet,
  allAspects: AspectInfo[]
): AspectInfo[] {
  return allAspects.filter((a) => a.aspectingPlanet === planet);
}

/**
 * Check if two planets aspect each other (mutual aspect)
 */
export function hasMutualAspect(
  planet1: Planet,
  planet2: Planet,
  allAspects: AspectInfo[]
): boolean {
  const aspects1to2 = allAspects.some(
    (a) => a.aspectingPlanet === planet1 && a.aspectedPlanet === planet2
  );
  const aspects2to1 = allAspects.some(
    (a) => a.aspectingPlanet === planet2 && a.aspectedPlanet === planet1
  );

  return aspects1to2 && aspects2to1;
}

/**
 * Get ordinal suffix
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

/**
 * Get interpretation of aspect effects
 */
export function getAspectInterpretation(aspect: AspectInfo): string {
  const benefics = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  const malefics = [Planet.Mars, Planet.Saturn, Planet.Rahu, Planet.Ketu];

  const isBenefic = benefics.includes(aspect.aspectingPlanet);
  const isMalefic = malefics.includes(aspect.aspectingPlanet);

  if (isBenefic) {
    return `${aspect.aspectingPlanet}'s beneficial aspect on ${aspect.aspectedPlanet} brings positive influences, blessings, and support.`;
  } else if (isMalefic) {
    return `${aspect.aspectingPlanet}'s aspect on ${aspect.aspectedPlanet} brings challenges, discipline, or transformation that requires attention.`;
  }

  return `${aspect.aspectingPlanet} aspects ${aspect.aspectedPlanet}, creating an energetic connection between these planets.`;
}

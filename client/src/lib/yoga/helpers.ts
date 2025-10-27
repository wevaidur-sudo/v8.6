/**
 * Yoga Detection Helpers
 * Common utility functions for yoga calculations
 */

import {
  type PlanetPosition,
  type HouseData,
  Planet,
  PlanetaryDignity,
  ZodiacSign,
} from "@shared/astro-schema";

// ============================================================================
// Constants
// ============================================================================

export const KENDRAS = [1, 4, 7, 10] as const;
export const TRIKONAS = [1, 5, 9] as const;
export const DUSTHANAS = [6, 8, 12] as const;
export const UPACHAYAS = [3, 6, 10, 11] as const;
export const BENEFICS = [Planet.Jupiter, Planet.Venus, Planet.Mercury] as const;
export const MALEFICS = [Planet.Sun, Planet.Mars, Planet.Saturn] as const;

export const MOVABLE_SIGNS = [
  ZodiacSign.Aries,
  ZodiacSign.Cancer,
  ZodiacSign.Libra,
  ZodiacSign.Capricorn,
] as const;

export const FIXED_SIGNS = [
  ZodiacSign.Taurus,
  ZodiacSign.Leo,
  ZodiacSign.Scorpio,
  ZodiacSign.Aquarius,
] as const;

export const DUAL_SIGNS = [
  ZodiacSign.Gemini,
  ZodiacSign.Virgo,
  ZodiacSign.Sagittarius,
  ZodiacSign.Pisces,
] as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

/**
 * Calculate house difference between two houses (1-12)
 */
export function getHouseDifference(house1: number, house2: number): number {
  return ((house2 - house1 + 12) % 12) + 1;
}

/**
 * Check if a house is a Kendra (angular house: 1, 4, 7, 10)
 */
export function isKendra(house: number): boolean {
  return KENDRAS.includes(house as typeof KENDRAS[number]);
}

/**
 * Check if a house is a Trikona (trinal house: 1, 5, 9)
 */
export function isTrikona(house: number): boolean {
  return TRIKONAS.includes(house as typeof TRIKONAS[number]);
}

/**
 * Check if a house is a Dusthana (malefic house: 6, 8, 12)
 */
export function isDusthana(house: number): boolean {
  return DUSTHANAS.includes(house as typeof DUSTHANAS[number]);
}

/**
 * Check if a house is an Upachaya (growth house: 3, 6, 10, 11)
 */
export function isUpachaya(house: number): boolean {
  return UPACHAYAS.includes(house as typeof UPACHAYAS[number]);
}

/**
 * Check if a planet is a natural benefic
 * Note: Moon's benefic nature depends on paksha (waxing/waning)
 */
export function isBenefic(planet: Planet, excludeMoon = false): boolean {
  if (excludeMoon && planet === Planet.Moon) return false;
  return BENEFICS.includes(planet as typeof BENEFICS[number]);
}

/**
 * Check if a planet is a natural malefic
 * Note: Moon's malefic nature depends on paksha (waxing/waning)
 */
export function isMalefic(planet: Planet, excludeMoon = false): boolean {
  if (excludeMoon && planet === Planet.Moon) return false;
  return MALEFICS.includes(planet as typeof MALEFICS[number]);
}

/**
 * Determine if Moon is benefic based on paksha (phase)
 * Waxing Moon (Shukla Paksha): benefic
 * Waning Moon (Krishna Paksha): malefic
 */
export function isMoonBenefic(
  planetPositions: PlanetPosition[]
): boolean | null {
  const sun = planetPositions.find((p) => p.planet === Planet.Sun);
  const moon = planetPositions.find((p) => p.planet === Planet.Moon);

  if (!sun || !moon || sun.longitude === undefined || moon.longitude === undefined) {
    return null;
  }

  // Angular distance from Sun to Moon (0-360 degrees)
  const angularDistance = (moon.longitude - sun.longitude + 360) % 360;

  // Waxing (0-180°) = benefic, Waning (180-360°) = malefic
  return angularDistance >= 0 && angularDistance < 180;
}

/**
 * Get all benefic planets including Moon based on paksha
 */
export function getBeneficPlanets(planetPositions: PlanetPosition[]): Planet[] {
  const benefics: Planet[] = [...BENEFICS];
  const moonBenefic = isMoonBenefic(planetPositions);
  if (moonBenefic === true) {
    benefics.push(Planet.Moon);
  }
  return benefics;
}

/**
 * Get all malefic planets including Moon based on paksha
 */
export function getMaleficPlanets(planetPositions: PlanetPosition[]): Planet[] {
  const malefics: Planet[] = [...MALEFICS];
  const moonBenefic = isMoonBenefic(planetPositions);
  if (moonBenefic === false) {
    malefics.push(Planet.Moon);
  }
  return malefics;
}

/**
 * Check if a planet is strong (exalted or in own sign)
 */
export function isPlanetStrong(position: PlanetPosition): boolean {
  return (
    position.dignity === PlanetaryDignity.Exalted ||
    position.dignity === PlanetaryDignity.OwnSign
  );
}

/**
 * Check if a planet is weak (debilitated or in enemy sign)
 */
export function isPlanetWeak(position: PlanetPosition): boolean {
  return (
    position.dignity === PlanetaryDignity.Debilitated ||
    position.dignity === PlanetaryDignity.EnemySign
  );
}

/**
 * Get planet position by planet type
 */
export function getPlanetPosition(
  planetPositions: PlanetPosition[],
  planet: Planet
): PlanetPosition | undefined {
  return planetPositions.find((p) => p.planet === planet);
}

/**
 * Get house lord from house data
 */
export function getHouseLord(houses: HouseData[], houseNumber: number): Planet | undefined {
  return houses.find((h) => h.houseNumber === houseNumber)?.lord;
}

/**
 * Get planets in a specific house
 */
export function getPlanetsInHouse(
  planetPositions: PlanetPosition[],
  house: number
): PlanetPosition[] {
  return planetPositions.filter((p) => p.house === house);
}

/**
 * Get planets in specific houses
 */
export function getPlanetsInHouses(
  planetPositions: PlanetPosition[],
  houses: number[]
): PlanetPosition[] {
  return planetPositions.filter((p) => houses.includes(p.house));
}

/**
 * Check if two planets are conjunct (in same house)
 */
export function areConjunct(pos1: PlanetPosition, pos2: PlanetPosition): boolean {
  return pos1.house === pos2.house;
}

/**
 * Check if a planet is in a specific sign
 */
export function isInSign(position: PlanetPosition, sign: ZodiacSign): boolean {
  return position.sign === sign;
}

/**
 * Check if a planet is in any of the given signs
 */
export function isInSigns(position: PlanetPosition, signs: ZodiacSign[]): boolean {
  return signs.includes(position.sign);
}

/**
 * Get count of unique signs occupied by planets
 */
export function getUniqueSignCount(planetPositions: PlanetPosition[]): number {
  const signs = new Set(planetPositions.map((p) => p.sign));
  return signs.size;
}

/**
 * Get count of unique houses occupied by planets
 */
export function getUniqueHouseCount(planetPositions: PlanetPosition[]): number {
  const houses = new Set(planetPositions.map((p) => p.house));
  return houses.size;
}

/**
 * Check if all planets are in movable signs
 */
export function allInMovableSigns(planetPositions: PlanetPosition[]): boolean {
  return planetPositions.every((p) => MOVABLE_SIGNS.includes(p.sign as typeof MOVABLE_SIGNS[number]));
}

/**
 * Check if all planets are in fixed signs
 */
export function allInFixedSigns(planetPositions: PlanetPosition[]): boolean {
  return planetPositions.every((p) => FIXED_SIGNS.includes(p.sign as typeof FIXED_SIGNS[number]));
}

/**
 * Check if all planets are in dual signs
 */
export function allInDualSigns(planetPositions: PlanetPosition[]): boolean {
  return planetPositions.every((p) => DUAL_SIGNS.includes(p.sign as typeof DUAL_SIGNS[number]));
}

/**
 * Filter out Rahu, Ketu, and Ascendant to get 7 classical planets
 */
export function getSevenPlanets(planetPositions: PlanetPosition[]): PlanetPosition[] {
  return planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
}

/**
 * Check for mutual exchange (Parivartana) between two house lords
 */
export function isMutualExchange(
  planetPositions: PlanetPosition[],
  houses: HouseData[],
  house1: number,
  house2: number
): boolean {
  const lord1 = getHouseLord(houses, house1);
  const lord2 = getHouseLord(houses, house2);

  if (!lord1 || !lord2 || lord1 === lord2) return false;

  const lord1Pos = getPlanetPosition(planetPositions, lord1);
  const lord2Pos = getPlanetPosition(planetPositions, lord2);

  if (!lord1Pos || !lord2Pos) return false;

  // Check if lord1 is in house2 AND lord2 is in house1
  return lord1Pos.house === house2 && lord2Pos.house === house1;
}

/**
 * Get house number from Moon (relative position)
 */
export function getHouseFromMoon(
  planetPositions: PlanetPosition[],
  targetHouse: number
): number {
  const moon = getPlanetPosition(planetPositions, Planet.Moon);
  if (!moon) return targetHouse;

  return ((moon.house + targetHouse - 2) % 12) + 1;
}

/**
 * Get house number from Sun (relative position)
 */
export function getHouseFromSun(
  planetPositions: PlanetPosition[],
  targetHouse: number
): number {
  const sun = getPlanetPosition(planetPositions, Planet.Sun);
  if (!sun) return targetHouse;

  return ((sun.house + targetHouse - 2) % 12) + 1;
}

/**
 * Check if planet is hemmed between malefics (Paap Kartari Yoga)
 */
export function isHemmedByMalefics(
  planetPositions: PlanetPosition[],
  targetPlanet: Planet
): boolean {
  const target = getPlanetPosition(planetPositions, targetPlanet);
  if (!target) return false;

  const maleficPlanets = getMaleficPlanets(planetPositions);
  const prevHouse = target.house === 1 ? 12 : target.house - 1;
  const nextHouse = (target.house % 12) + 1;

  const planetsInPrev = getPlanetsInHouse(planetPositions, prevHouse);
  const planetsInNext = getPlanetsInHouse(planetPositions, nextHouse);

  const hasMaleficBefore = planetsInPrev.some((p) =>
    maleficPlanets.includes(p.planet)
  );
  const hasMaleficAfter = planetsInNext.some((p) =>
    maleficPlanets.includes(p.planet)
  );

  return hasMaleficBefore && hasMaleficAfter;
}

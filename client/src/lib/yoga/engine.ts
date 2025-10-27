/**
 * Yoga Detection Engine
 * Processes yoga definitions and detects yogas based on chart data
 */

import type { PlanetPosition, HouseData, Yoga } from "@shared/astro-schema";
import { YogaType, Planet, ZodiacSign } from "@shared/astro-schema";
import type { YogaDefinition } from "./data";
import { DetectionType, CustomCheckType } from "./data";
import {
  getPlanetPosition,
  getHouseLord,
  isKendra,
  isTrikona,
  isPlanetStrong,
  areConjunct,
  getPlanetsInHouse,
  getPlanetsInHouses,
  isMutualExchange,
  getHouseDifference,
  getOrdinalSuffix,
  KENDRAS,
} from "./helpers";

// ============================================================================
// Custom Detection Functions
// ============================================================================

/**
 * Check if Jupiter is in Kendra from Moon (Gaja Kesari Yoga)
 */
export function checkJupiterKendraFromMoon(
  planetPositions: PlanetPosition[]
): boolean {
  const moon = getPlanetPosition(planetPositions, Planet.Moon);
  const jupiter = getPlanetPosition(planetPositions, Planet.Jupiter);

  if (!moon || !jupiter) return false;

  const houseDiff = getHouseDifference(moon.house, jupiter.house);
  return KENDRAS.includes(houseDiff as typeof KENDRAS[number]);
}

/**
 * Check if Mercury is not combust (within 14 degrees of Sun)
 */
export function checkMercuryNotCombust(
  planetPositions: PlanetPosition[]
): boolean {
  const sun = getPlanetPosition(planetPositions, Planet.Sun);
  const mercury = getPlanetPosition(planetPositions, Planet.Mercury);

  if (!sun || !mercury || sun.longitude === undefined || mercury.longitude === undefined) {
    return false;
  }

  // Calculate angular distance
  const distance = Math.abs(mercury.longitude - sun.longitude);
  const adjustedDistance = distance > 180 ? 360 - distance : distance;

  // Mercury is combust if within 14 degrees of Sun
  return adjustedDistance > 14;
}

/**
 * Check if two benefics are in the same good house
 */
export function checkTwoBeneficsInSameGoodHouse(
  planetPositions: PlanetPosition[],
  goodHouses: number[]
): boolean {
  const benefics = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  
  for (const house of goodHouses) {
    const planetsInHouse = getPlanetsInHouse(planetPositions, house);
    const beneficsInHouse = planetsInHouse.filter((p) =>
      benefics.includes(p.planet)
    );
    if (beneficsInHouse.length >= 2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if all planets are between Rahu and Ketu (Kaal Sarp Yoga)
 */
export function checkAllPlanetsBetweenRahuKetu(
  planetPositions: PlanetPosition[]
): boolean {
  const rahu = getPlanetPosition(planetPositions, Planet.Rahu);
  const ketu = getPlanetPosition(planetPositions, Planet.Ketu);

  if (!rahu || !ketu) return false;

  // Get all seven planets (excluding Rahu, Ketu, Ascendant)
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );

  // Check if all planets are on one side of the Rahu-Ketu axis
  const rahuHouse = rahu.house;
  const ketuHouse = ketu.house;

  // All planets should be in houses from Rahu to Ketu (exclusive) in one direction
  for (const planet of sevenPlanets) {
    const house = planet.house;
    
    // Check if planet is between Rahu and Ketu
    const isInArc = isHouseBetween(house, rahuHouse, ketuHouse);
    
    if (!isInArc) {
      return false;
    }
  }

  return true;
}

/**
 * Helper: Check if a house is between start and end (clockwise)
 */
function isHouseBetween(house: number, start: number, end: number): boolean {
  if (start < end) {
    return house > start && house < end;
  } else {
    return house > start || house < end;
  }
}

/**
 * Check if planets occupy specific number of signs (for Nabhasa Sankhya yogas)
 */
export function checkPlanetsInSignCount(
  planetPositions: PlanetPosition[],
  signCount: number
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  const occupiedSigns = new Set(sevenPlanets.map(p => p.sign));
  return occupiedSigns.size === signCount;
}

/**
 * Check if all planets are in movable signs (for Rajju Yoga)
 */
export function checkPlanetsInMovableSigns(
  planetPositions: PlanetPosition[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  return sevenPlanets.every(p => movableSigns.includes(p.sign));
}

/**
 * Check if all planets are in fixed signs (for Musala Yoga)
 */
export function checkPlanetsInFixedSigns(
  planetPositions: PlanetPosition[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  const fixedSigns = [ZodiacSign.Taurus, ZodiacSign.Leo, ZodiacSign.Scorpio, ZodiacSign.Aquarius];
  return sevenPlanets.every(p => fixedSigns.includes(p.sign));
}

/**
 * Check if all planets are in dual signs (for Nala Yoga)
 */
export function checkPlanetsInDualSigns(
  planetPositions: PlanetPosition[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  const dualSigns = [ZodiacSign.Gemini, ZodiacSign.Virgo, ZodiacSign.Sagittarius, ZodiacSign.Pisces];
  return sevenPlanets.every(p => dualSigns.includes(p.sign));
}

/**
 * Check if all four kendras are occupied by only benefics (for Mala Yoga)
 */
export function checkAllKendrasBenefics(
  planetPositions: PlanetPosition[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  
  // Determine Moon's benefic status based on phase
  const sun = planetPositions.find(p => p.planet === Planet.Sun);
  const moon = sevenPlanets.find(p => p.planet === Planet.Moon);
  const beneficPlanetsBase = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  let beneficPlanets = [...beneficPlanetsBase];
  
  if (sun && moon && sun.longitude !== undefined && moon.longitude !== undefined) {
    const angularDistance = (moon.longitude - sun.longitude + 360) % 360;
    if (angularDistance >= 0 && angularDistance < 180) {
      beneficPlanets.push(Planet.Moon);
    }
  }
  
  const kendras = [1, 4, 7, 10];
  const planetsInKendras = sevenPlanets.filter(p => kendras.includes(p.house));
  const occupiedKendras = new Set(planetsInKendras.map(p => p.house));
  
  return occupiedKendras.size === 4 && 
         planetsInKendras.every(p => beneficPlanets.includes(p.planet));
}

/**
 * Check if all four kendras are occupied by only malefics (for Sarpa Yoga)
 */
export function checkAllKendrasMalefics(
  planetPositions: PlanetPosition[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  
  // Determine Moon's malefic status based on phase
  const sun = planetPositions.find(p => p.planet === Planet.Sun);
  const moon = sevenPlanets.find(p => p.planet === Planet.Moon);
  const maleficPlanetsBase = [Planet.Sun, Planet.Mars, Planet.Saturn];
  let maleficPlanets = [...maleficPlanetsBase];
  
  if (sun && moon && sun.longitude !== undefined && moon.longitude !== undefined) {
    const angularDistance = (moon.longitude - sun.longitude + 360) % 360;
    if (angularDistance >= 180 && angularDistance < 360) {
      maleficPlanets.push(Planet.Moon);
    }
  }
  
  const kendras = [1, 4, 7, 10];
  const planetsInKendras = sevenPlanets.filter(p => kendras.includes(p.house));
  const occupiedKendras = new Set(planetsInKendras.map(p => p.house));
  
  return occupiedKendras.size === 4 && 
         planetsInKendras.every(p => maleficPlanets.includes(p.planet));
}

/**
 * Check if planets are in alternate houses (for Chakra Yoga)
 */
export function checkPlanetsInAlternateHouses(
  planetPositions: PlanetPosition[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  
  const occupiedHouses = Array.from(new Set(sevenPlanets.map(p => p.house))).sort((a, b) => a - b);
  if (occupiedHouses.length < 3) return false;
  
  for (let i = 0; i < occupiedHouses.length - 1; i++) {
    if ((occupiedHouses[i + 1] - occupiedHouses[i]) % 2 !== 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if all planets are in a specific house range (for Akriti yogas)
 */
export function checkPlanetsInHouseRange(
  planetPositions: PlanetPosition[],
  houseRange?: [number, number],
  housePattern?: number[]
): boolean {
  const sevenPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Ascendant &&
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu
  );
  
  if (housePattern) {
    // Check if all planets are in the specified house pattern
    return sevenPlanets.every(p => housePattern.includes(p.house));
  }
  
  if (houseRange) {
    // Check if all planets are in the house range
    const [start, end] = houseRange;
    return sevenPlanets.every(p => p.house >= start && p.house <= end);
  }
  
  return false;
}

/**
 * Check if planets exist in 2nd house from Moon (for Sunapha Yoga)
 */
export function checkPlanetsInSecondFromMoon(
  planetPositions: PlanetPosition[]
): boolean {
  const moon = getPlanetPosition(planetPositions, Planet.Moon);
  if (!moon) return false;
  
  const secondFromMoon = ((moon.house % 12) + 1);
  const planetsExcludingSunRahuKetu = planetPositions.filter(
    (p) => p.planet !== Planet.Sun && p.planet !== Planet.Rahu && 
           p.planet !== Planet.Ketu && p.planet !== Planet.Moon && p.planet !== Planet.Ascendant
  );
  
  return planetsExcludingSunRahuKetu.some(p => p.house === secondFromMoon);
}

/**
 * Check if planets exist in 12th house from Moon (for Anapha Yoga)
 */
export function checkPlanetsInTwelfthFromMoon(
  planetPositions: PlanetPosition[]
): boolean {
  const moon = getPlanetPosition(planetPositions, Planet.Moon);
  if (!moon) return false;
  
  const twelfthFromMoon = moon.house === 1 ? 12 : moon.house - 1;
  const planetsExcludingSunRahuKetu = planetPositions.filter(
    (p) => p.planet !== Planet.Sun && p.planet !== Planet.Rahu && 
           p.planet !== Planet.Ketu && p.planet !== Planet.Moon && p.planet !== Planet.Ascendant
  );
  
  return planetsExcludingSunRahuKetu.some(p => p.house === twelfthFromMoon);
}

/**
 * Check if planets exist in both 2nd and 12th from Moon (for Durudhura Yoga)
 */
export function checkPlanetsAroundMoon(
  planetPositions: PlanetPosition[]
): boolean {
  return checkPlanetsInSecondFromMoon(planetPositions) && 
         checkPlanetsInTwelfthFromMoon(planetPositions);
}

/**
 * Check if no planets in 2nd and 12th from Moon (for Kemadruma Yoga)
 */
export function checkNoPlanetsAroundMoon(
  planetPositions: PlanetPosition[]
): boolean {
  const moon = getPlanetPosition(planetPositions, Planet.Moon);
  if (!moon) return false;
  
  const hasSecond = checkPlanetsInSecondFromMoon(planetPositions);
  const hasTwelfth = checkPlanetsInTwelfthFromMoon(planetPositions);
  
  if (hasSecond || hasTwelfth) return false;
  
  // Check if Moon is not in conjunction with benefics
  const beneficsInConjunction = planetPositions.filter(
    p => p.house === moon.house && [Planet.Jupiter, Planet.Venus, Planet.Mercury].includes(p.planet)
  );
  
  return beneficsInConjunction.length === 0;
}

/**
 * Check if planets exist in 2nd house from Sun (for Vesi Yoga)
 */
export function checkPlanetsInSecondFromSun(
  planetPositions: PlanetPosition[]
): boolean {
  const sun = getPlanetPosition(planetPositions, Planet.Sun);
  if (!sun) return false;
  
  const secondFromSun = ((sun.house % 12) + 1);
  const planetsExcludingMoonRahuKetu = planetPositions.filter(
    (p) => p.planet !== Planet.Moon && p.planet !== Planet.Rahu && 
           p.planet !== Planet.Ketu && p.planet !== Planet.Sun && p.planet !== Planet.Ascendant
  );
  
  return planetsExcludingMoonRahuKetu.some(p => p.house === secondFromSun);
}

/**
 * Check if planets exist in 12th house from Sun (for Vasi Yoga)
 */
export function checkPlanetsInTwelfthFromSun(
  planetPositions: PlanetPosition[]
): boolean {
  const sun = getPlanetPosition(planetPositions, Planet.Sun);
  if (!sun) return false;
  
  const twelfthFromSun = sun.house === 1 ? 12 : sun.house - 1;
  const planetsExcludingMoonRahuKetu = planetPositions.filter(
    (p) => p.planet !== Planet.Moon && p.planet !== Planet.Rahu && 
           p.planet !== Planet.Ketu && p.planet !== Planet.Sun && p.planet !== Planet.Ascendant
  );
  
  return planetsExcludingMoonRahuKetu.some(p => p.house === twelfthFromSun);
}

/**
 * Check if planets exist in both 2nd and 12th from Sun (for Ubhayachari Yoga)
 */
export function checkPlanetsAroundSun(
  planetPositions: PlanetPosition[]
): boolean {
  return checkPlanetsInSecondFromSun(planetPositions) && 
         checkPlanetsInTwelfthFromSun(planetPositions);
}

// ============================================================================
// Main Detection Engine
// ============================================================================

/**
 * Detect a yoga based on its definition
 */
export function detectYogaFromDefinition(
  definition: YogaDefinition,
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga | null {
  const { detectionType, conditions, name, type, effects, strengthRules } = definition;

  let isFormed = false;
  let formationPlanets: Planet[] = [];
  let involvedHouses: number[] = [];
  let description = "";
  let strength: "weak" | "moderate" | "strong" = "moderate";

  switch (detectionType) {
    case DetectionType.PlanetInKendra: {
      // Check if specific planet is in kendra with required dignity
      if (!conditions.specificPlanet) return null;
      
      const position = getPlanetPosition(planetPositions, conditions.specificPlanet);
      if (!position) return null;

      const inRequiredHouse = conditions.houses?.includes(position.house) ?? true;
      const hasRequiredDignity = conditions.dignities?.includes(position.dignity) ?? true;

      if (inRequiredHouse && hasRequiredDignity) {
        isFormed = true;
        formationPlanets = [conditions.specificPlanet];
        involvedHouses = [position.house];
        description = `${conditions.specificPlanet} is ${position.dignity.toLowerCase()} in the ${position.house}${getOrdinalSuffix(position.house)} house (Kendra).`;
        
        // Apply strength rules
        if (strengthRules) {
          for (const rule of strengthRules) {
            if (rule.condition === "exalted" && position.dignity === "Exalted") {
              strength = rule.strength;
            } else if (rule.condition === "own_sign" && position.dignity === "Own Sign") {
              strength = rule.strength;
            }
          }
        }
      }
      break;
    }

    case DetectionType.Conjunction: {
      // Check if specified planets are conjunct
      if (!conditions.planets || conditions.planets.length < 2) return null;

      const positions = conditions.planets
        .map((p) => getPlanetPosition(planetPositions, p))
        .filter(Boolean) as PlanetPosition[];

      if (positions.length < 2) return null;

      // Check if all in same house
      const firstHouse = positions[0].house;
      if (positions.every((p) => p.house === firstHouse)) {
        // Apply custom check if specified
        if (conditions.customCheck) {
          if (conditions.customCheck === CustomCheckType.MercuryNotCombust) {
            if (!checkMercuryNotCombust(planetPositions)) return null;
          }
        }

        isFormed = true;
        formationPlanets = conditions.planets;
        involvedHouses = [firstHouse];
        description = `${conditions.planets.join(" and ")} conjunct in ${firstHouse}${getOrdinalSuffix(firstHouse)} house.`;
        
        // Check strength based on house type
        if (isKendra(firstHouse)) {
          strength = "strong";
        } else if (isTrikona(firstHouse)) {
          strength = "moderate";
        }
      }
      break;
    }

    case DetectionType.PlanetInHouse: {
      // Check if any of the specified planets is in specified house
      if (!conditions.planets || !conditions.houses) return null;

      for (const planet of conditions.planets) {
        const position = getPlanetPosition(planetPositions, planet);
        if (!position) continue;

        if (conditions.houses.includes(position.house)) {
          isFormed = true;
          formationPlanets.push(planet);
          if (!involvedHouses.includes(position.house)) {
            involvedHouses.push(position.house);
          }
        }
      }

      if (isFormed) {
        description = `Benefic planet(s) (${formationPlanets.join(", ")}) in ${involvedHouses.map(h => h + getOrdinalSuffix(h)).join(" and ")} house.`;
        strength = formationPlanets.includes(Planet.Jupiter) ? "strong" : "moderate";
      }
      break;
    }

    case DetectionType.PatternBased: {
      // Handle custom pattern checks using type-safe enum
      if (conditions.customCheck === CustomCheckType.JupiterKendraFromMoon) {
        if (checkJupiterKendraFromMoon(planetPositions)) {
          const jupiter = getPlanetPosition(planetPositions, Planet.Jupiter);
          const moon = getPlanetPosition(planetPositions, Planet.Moon);
          if (jupiter && moon) {
            isFormed = true;
            formationPlanets = [Planet.Jupiter, Planet.Moon];
            involvedHouses = [jupiter.house, moon.house];
            description = `Jupiter is placed in a Kendra (angular house) from Moon, creating the auspicious Gaja Kesari Yoga.`;
            strength = isPlanetStrong(jupiter) ? "strong" : "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.TwoBeneficsInSameGoodHouse) {
        if (conditions.houses && checkTwoBeneficsInSameGoodHouse(planetPositions, conditions.houses)) {
          for (const house of conditions.houses) {
            const planetsInHouse = getPlanetsInHouse(planetPositions, house);
            const beneficsInHouse = planetsInHouse.filter((p) =>
              [Planet.Jupiter, Planet.Venus, Planet.Mercury].includes(p.planet)
            );
            if (beneficsInHouse.length >= 2) {
              isFormed = true;
              formationPlanets = beneficsInHouse.map((p) => p.planet);
              involvedHouses = [house];
              description = `Two or more benefics (${formationPlanets.join(", ")}) in ${house}${getOrdinalSuffix(house)} house.`;
              strength = "strong";
              break;
            }
          }
        }
      } else if (conditions.customCheck === CustomCheckType.AllPlanetsBetweenRahuKetu) {
        if (checkAllPlanetsBetweenRahuKetu(planetPositions)) {
          const rahu = getPlanetPosition(planetPositions, Planet.Rahu);
          const ketu = getPlanetPosition(planetPositions, Planet.Ketu);
          if (rahu && ketu) {
            isFormed = true;
            formationPlanets = [Planet.Rahu, Planet.Ketu];
            involvedHouses = [rahu.house, ketu.house];
            description = `All seven planets are positioned between Rahu (${rahu.house}${getOrdinalSuffix(rahu.house)} house) and Ketu (${ketu.house}${getOrdinalSuffix(ketu.house)} house), forming Kaal Sarp Yoga.`;
            strength = "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInSignCount) {
        if (conditions.signCount && checkPlanetsInSignCount(planetPositions, conditions.signCount)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          isFormed = true;
          formationPlanets = sevenPlanets.map(p => p.planet);
          involvedHouses = Array.from(new Set(sevenPlanets.map(p => p.house)));
          description = `All 7 planets occupy ${conditions.signCount} ${conditions.signCount === 1 ? 'sign' : 'signs'}.`;
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInMovableSigns) {
        if (checkPlanetsInMovableSigns(planetPositions)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          isFormed = true;
          formationPlanets = sevenPlanets.map(p => p.planet);
          involvedHouses = Array.from(new Set(sevenPlanets.map(p => p.house)));
          description = `All 7 planets occupy movable signs (Aries, Cancer, Libra, Capricorn).`;
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInFixedSigns) {
        if (checkPlanetsInFixedSigns(planetPositions)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          isFormed = true;
          formationPlanets = sevenPlanets.map(p => p.planet);
          involvedHouses = Array.from(new Set(sevenPlanets.map(p => p.house)));
          description = `All 7 planets occupy fixed signs (Taurus, Leo, Scorpio, Aquarius).`;
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInDualSigns) {
        if (checkPlanetsInDualSigns(planetPositions)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          isFormed = true;
          formationPlanets = sevenPlanets.map(p => p.planet);
          involvedHouses = Array.from(new Set(sevenPlanets.map(p => p.house)));
          description = `All 7 planets occupy dual signs (Gemini, Virgo, Sagittarius, Pisces).`;
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.AllKendrasBenefics) {
        if (checkAllKendrasBenefics(planetPositions)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          const kendras = [1, 4, 7, 10];
          const planetsInKendras = sevenPlanets.filter(p => kendras.includes(p.house));
          isFormed = true;
          formationPlanets = planetsInKendras.map(p => p.planet);
          involvedHouses = [1, 4, 7, 10];
          description = `All four kendras (1,4,7,10) occupied by only benefic planets: ${formationPlanets.join(", ")}.`;
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.AllKendrasMalefics) {
        if (checkAllKendrasMalefics(planetPositions)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          const kendras = [1, 4, 7, 10];
          const planetsInKendras = sevenPlanets.filter(p => kendras.includes(p.house));
          isFormed = true;
          formationPlanets = planetsInKendras.map(p => p.planet);
          involvedHouses = [1, 4, 7, 10];
          description = `All four kendras (1,4,7,10) occupied by only malefic planets: ${formationPlanets.join(", ")}.`;
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInAlternateHouses) {
        if (checkPlanetsInAlternateHouses(planetPositions)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          isFormed = true;
          formationPlanets = sevenPlanets.map(p => p.planet);
          involvedHouses = Array.from(new Set(sevenPlanets.map(p => p.house)));
          description = `All planets occupy alternate houses forming a circular pattern.`;
          strength = "strong";
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInHouseRange) {
        if (checkPlanetsInHouseRange(planetPositions, conditions.houseRange, conditions.housePattern)) {
          const sevenPlanets = planetPositions.filter(
            (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
          );
          isFormed = true;
          formationPlanets = sevenPlanets.map(p => p.planet);
          involvedHouses = Array.from(new Set(sevenPlanets.map(p => p.house)));
          
          if (conditions.housePattern) {
            description = `All 7 planets in houses ${conditions.housePattern.join(", ")}.`;
          } else if (conditions.houseRange) {
            description = `All 7 planets occupy houses ${conditions.houseRange[0]}-${conditions.houseRange[1]}.`;
          }
          strength = "moderate";
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInSecondFromMoon) {
        if (checkPlanetsInSecondFromMoon(planetPositions)) {
          const moon = getPlanetPosition(planetPositions, Planet.Moon);
          if (moon) {
            const secondFromMoon = ((moon.house % 12) + 1);
            const planetsIn2nd = planetPositions.filter(
              p => p.house === secondFromMoon && p.planet !== Planet.Sun && 
                   p.planet !== Planet.Rahu && p.planet !== Planet.Ketu && 
                   p.planet !== Planet.Moon && p.planet !== Planet.Ascendant
            );
            isFormed = true;
            formationPlanets = [Planet.Moon, ...planetsIn2nd.map(p => p.planet)];
            involvedHouses = [moon.house, secondFromMoon];
            description = `Planet(s) in 2nd house from Moon (${planetsIn2nd.map(p => p.planet).join(", ")}).`;
            const hasJupiterOrVenus = planetsIn2nd.some(p => [Planet.Jupiter, Planet.Venus].includes(p.planet));
            strength = hasJupiterOrVenus ? "strong" : "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInTwelfthFromMoon) {
        if (checkPlanetsInTwelfthFromMoon(planetPositions)) {
          const moon = getPlanetPosition(planetPositions, Planet.Moon);
          if (moon) {
            const twelfthFromMoon = moon.house === 1 ? 12 : moon.house - 1;
            const planetsIn12th = planetPositions.filter(
              p => p.house === twelfthFromMoon && p.planet !== Planet.Sun && 
                   p.planet !== Planet.Rahu && p.planet !== Planet.Ketu && 
                   p.planet !== Planet.Moon && p.planet !== Planet.Ascendant
            );
            isFormed = true;
            formationPlanets = [Planet.Moon, ...planetsIn12th.map(p => p.planet)];
            involvedHouses = [moon.house, twelfthFromMoon];
            description = `Planet(s) in 12th house from Moon (${planetsIn12th.map(p => p.planet).join(", ")}).`;
            const hasJupiterOrVenus = planetsIn12th.some(p => [Planet.Jupiter, Planet.Venus].includes(p.planet));
            strength = hasJupiterOrVenus ? "strong" : "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsAroundMoon) {
        if (checkPlanetsAroundMoon(planetPositions)) {
          const moon = getPlanetPosition(planetPositions, Planet.Moon);
          if (moon) {
            const secondFromMoon = ((moon.house % 12) + 1);
            const twelfthFromMoon = moon.house === 1 ? 12 : moon.house - 1;
            const planetsAround = planetPositions.filter(
              p => (p.house === secondFromMoon || p.house === twelfthFromMoon) && 
                   p.planet !== Planet.Sun && p.planet !== Planet.Rahu && 
                   p.planet !== Planet.Ketu && p.planet !== Planet.Moon && p.planet !== Planet.Ascendant
            );
            isFormed = true;
            formationPlanets = [Planet.Moon, ...planetsAround.map(p => p.planet)];
            involvedHouses = [moon.house, secondFromMoon, twelfthFromMoon];
            description = `Planets in both 2nd and 12th houses from Moon.`;
            strength = "strong";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.NoPlanetsAroundMoon) {
        if (checkNoPlanetsAroundMoon(planetPositions)) {
          const moon = getPlanetPosition(planetPositions, Planet.Moon);
          if (moon) {
            isFormed = true;
            formationPlanets = [Planet.Moon];
            involvedHouses = [moon.house];
            description = `No planets in 2nd or 12th from Moon, and Moon not with benefics.`;
            strength = "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInSecondFromSun) {
        if (checkPlanetsInSecondFromSun(planetPositions)) {
          const sun = getPlanetPosition(planetPositions, Planet.Sun);
          if (sun) {
            const secondFromSun = ((sun.house % 12) + 1);
            const planetsIn2nd = planetPositions.filter(
              p => p.house === secondFromSun && p.planet !== Planet.Moon && 
                   p.planet !== Planet.Rahu && p.planet !== Planet.Ketu && 
                   p.planet !== Planet.Sun && p.planet !== Planet.Ascendant
            );
            isFormed = true;
            formationPlanets = [Planet.Sun, ...planetsIn2nd.map(p => p.planet)];
            involvedHouses = [sun.house, secondFromSun];
            description = `Planet(s) in 2nd house from Sun (${planetsIn2nd.map(p => p.planet).join(", ")}).`;
            const hasJupiterOrMercury = planetsIn2nd.some(p => [Planet.Jupiter, Planet.Mercury].includes(p.planet));
            strength = hasJupiterOrMercury ? "strong" : "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsInTwelfthFromSun) {
        if (checkPlanetsInTwelfthFromSun(planetPositions)) {
          const sun = getPlanetPosition(planetPositions, Planet.Sun);
          if (sun) {
            const twelfthFromSun = sun.house === 1 ? 12 : sun.house - 1;
            const planetsIn12th = planetPositions.filter(
              p => p.house === twelfthFromSun && p.planet !== Planet.Moon && 
                   p.planet !== Planet.Rahu && p.planet !== Planet.Ketu && 
                   p.planet !== Planet.Sun && p.planet !== Planet.Ascendant
            );
            isFormed = true;
            formationPlanets = [Planet.Sun, ...planetsIn12th.map(p => p.planet)];
            involvedHouses = [sun.house, twelfthFromSun];
            description = `Planet(s) in 12th house from Sun (${planetsIn12th.map(p => p.planet).join(", ")}).`;
            const hasJupiterOrMercury = planetsIn12th.some(p => [Planet.Jupiter, Planet.Mercury].includes(p.planet));
            strength = hasJupiterOrMercury ? "strong" : "moderate";
          }
        }
      } else if (conditions.customCheck === CustomCheckType.PlanetsAroundSun) {
        if (checkPlanetsAroundSun(planetPositions)) {
          const sun = getPlanetPosition(planetPositions, Planet.Sun);
          if (sun) {
            const secondFromSun = ((sun.house % 12) + 1);
            const twelfthFromSun = sun.house === 1 ? 12 : sun.house - 1;
            const planetsAround = planetPositions.filter(
              p => (p.house === secondFromSun || p.house === twelfthFromSun) && 
                   p.planet !== Planet.Moon && p.planet !== Planet.Rahu && 
                   p.planet !== Planet.Ketu && p.planet !== Planet.Sun && p.planet !== Planet.Ascendant
            );
            isFormed = true;
            formationPlanets = [Planet.Sun, ...planetsAround.map(p => p.planet)];
            involvedHouses = [sun.house, secondFromSun, twelfthFromSun];
            description = `Planets in both 2nd and 12th houses from Sun.`;
            strength = "strong";
          }
        }
      }
      break;
    }

    default:
      // Other detection types can be added as needed
      return null;
  }

  if (!isFormed) return null;

  return {
    type,
    name,
    formationPlanets,
    houses: involvedHouses,
    strength,
    description,
    effects,
  };
}

/**
 * Process all yoga definitions and detect present yogas
 */
export function detectYogasFromDefinitions(
  definitions: YogaDefinition[],
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const detectedYogas: Yoga[] = [];

  for (const definition of definitions) {
    const yoga = detectYogaFromDefinition(definition, planetPositions, houses);
    if (yoga) {
      detectedYogas.push(yoga);
    }
  }

  return detectedYogas;
}

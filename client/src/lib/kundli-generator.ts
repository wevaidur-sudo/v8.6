import {
  type BirthData,
  type Kundli,
  type PlanetPosition,
  type HouseData,
  type ShadbalaStrength,
  type Yoga,
  type DashaSystem,
  type NavamsaChart,
  type PersonalityAnalysis,
  type PlanetInterpretation,
  type HouseInterpretation,
  type RemedySuggestions,
  ZodiacSign,
  Planet,
  Nakshatra,
  PlanetaryDignity,
} from "@shared/astro-schema";
import {
  calculateAscendant,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateShadbala,
} from "./astro-calculations";
import { detectYogas } from "./yoga-detection";
import { calculateDashaSystem } from "./dasha-calculations";
import { calculateYoginiDasha } from "./yogini-dasha-calculations";
import { calculateAshtottariDasha } from "./ashtottari-dasha-calculations";
import { calculateCharaDasha } from "./chara-dasha-calculations";
import { calculateKalachakraDasha } from "./kalachakra-dasha-calculations";
import { calculateNavamsa } from "./navamsa-calculations";
import {
  calculateAshtakavarga,
  calculateAllDivisionalAshtakavarga,
  calculateCompleteAshtakavargaSystem,
} from "./ashtakavarga-calculations";
import {
  calculateD2Chart,
  calculateD3Chart,
  calculateD4Chart,
  calculateD7Chart,
  calculateD10Chart,
  calculateD12Chart,
  calculateD16Chart,
  calculateD20Chart,
  calculateD24Chart,
  calculateD27Chart,
  calculateD30Chart,
  calculateD40Chart,
  calculateD45Chart,
  calculateD60Chart,
} from "./divisional-charts";
import { nanoid } from "nanoid";

/**
 * Main Kundli Generator
 * Orchestrates all calculation modules to produce a complete Vedic astrology chart
 */

export async function generateKundli(birthData: BirthData): Promise<Kundli> {
  try {
    // Step 1: Calculate Ascendant
    const { ascendant, ascendantSign } = calculateAscendant(birthData);
    
    // Step 2: Calculate all planetary positions
    const planetPositions = calculatePlanetaryPositions(birthData);

    // Step 2a: Add Ascendant to planetary positions for Ashtakavarga calculations
    // The Ascendant must be included as a contributor in Ashtakavarga system (BPHS)
    const ascendantDegree = ascendant % 30; // Degree within sign (0-30)
    
    // Guard against floating-point edge cases at nakshatra boundaries
    const normalizedLongitude = ((ascendant % 360) + 360) % 360;
    const nakshatraIndex = Math.min(Math.floor((normalizedLongitude / 360) * 27), 26);
    const nakshatraDegree = (normalizedLongitude % (360 / 27)) / (360 / 27);
    const nakshatraPada = Math.min(Math.floor(nakshatraDegree * 4) + 1, 4);
    
    const NAKSHATRAS = [
      Nakshatra.Ashwini, Nakshatra.Bharani, Nakshatra.Krittika, Nakshatra.Rohini,
      Nakshatra.Mrigashira, Nakshatra.Ardra, Nakshatra.Punarvasu, Nakshatra.Pushya,
      Nakshatra.Ashlesha, Nakshatra.Magha, Nakshatra.PurvaPhalguni, Nakshatra.UttaraPhalguni,
      Nakshatra.Hasta, Nakshatra.Chitra, Nakshatra.Swati, Nakshatra.Vishakha,
      Nakshatra.Anuradha, Nakshatra.Jyeshtha, Nakshatra.Mula, Nakshatra.PurvaAshadha,
      Nakshatra.UttaraAshadha, Nakshatra.Shravana, Nakshatra.Dhanishta, Nakshatra.Shatabhisha,
      Nakshatra.PurvaBhadrapada, Nakshatra.UttaraBhadrapada, Nakshatra.Revati
    ];

    const ascendantPosition: PlanetPosition = {
      planet: Planet.Ascendant,
      longitude: ascendant,
      sign: ascendantSign,
      degree: ascendantDegree,
      house: 1, // Ascendant is always in the 1st house
      nakshatra: NAKSHATRAS[nakshatraIndex],
      nakshatraPada: nakshatraPada,
      isRetrograde: false,
      isCombust: false,
      dignity: PlanetaryDignity.NeutralSign, // Ascendant doesn't have dignity
      speed: 0, // Ascendant doesn't move like planets
    };

    // Add Ascendant to the planet positions array
    planetPositions.push(ascendantPosition);

    // Step 3: Calculate houses
    const houses = calculateHouses(planetPositions, ascendantSign);

    // Step 4: Calculate planetary strengths (Shadbala)
    const planetaryStrength = calculateShadbala(planetPositions);

    // Step 5: Detect yogas
    const yogas = detectYogas(planetPositions, houses);

    // Step 6: Calculate Vimshottari Dasha system
    const birthDate = new Date(`${birthData.dateOfBirth}T${birthData.timeOfBirth}`);
    const dashaSystem = calculateDashaSystem(planetPositions, birthDate);

    // Step 7: Calculate Navamsa (D9) chart
    const navamsa = calculateNavamsa(planetPositions);

    // Step 8: Calculate Complete Ashtakavarga System (Basic + Advanced)
    const completeAshtakavarga = calculateCompleteAshtakavargaSystem(planetPositions, houses);
    // For backward compatibility, also provide basic ashtakavarga
    const ashtakavarga = {
      individual: completeAshtakavarga.individual,
      sarva: completeAshtakavarga.sarva,
    };

    // Step 8a: Calculate all divisional charts
    const d2 = calculateD2Chart(planetPositions, ascendantSign);
    const d3 = calculateD3Chart(planetPositions, ascendantSign);
    const d4 = calculateD4Chart(planetPositions, ascendantSign);
    const d7 = calculateD7Chart(planetPositions, ascendantSign);
    const d10 = calculateD10Chart(planetPositions, ascendantSign);
    const d12 = calculateD12Chart(planetPositions, ascendantSign);
    const d16 = calculateD16Chart(planetPositions, ascendantSign);
    const d20 = calculateD20Chart(planetPositions, ascendantSign);
    const d24 = calculateD24Chart(planetPositions, ascendantSign);
    const d27 = calculateD27Chart(planetPositions, ascendantSign);
    const d30 = calculateD30Chart(planetPositions, ascendantSign);
    const d40 = calculateD40Chart(planetPositions, ascendantSign);
    const d45 = calculateD45Chart(planetPositions, ascendantSign);
    const d60 = calculateD60Chart(planetPositions, ascendantSign);

    // Step 8b: Calculate Ashtakavarga for all divisional charts
    const divisionalAshtakavarga = calculateAllDivisionalAshtakavarga({
      d1: { planetPositions }, // D1 (Rashi) is the birth chart
      d2,
      d3,
      d4,
      d7,
      d9: navamsa, // D9 (Navamsa) already calculated in Step 7
      d10,
      d12,
      d16,
      d20,
      d24,
      d27,
      d30,
      d40,
      d45,
      d60,
    });

    // Step 9: Placeholder interpretations
    const personality: PersonalityAnalysis = {
      ascendantAnalysis: "",
      sunSignAnalysis: "",
      moonSignAnalysis: "",
      nakshatraAnalysis: "",
      dominantPlanets: [],
      temperament: "",
      strengths: [],
      challenges: [],
    };
    const houseInterpretations: HouseInterpretation[] = [];
    const planetInterpretations: PlanetInterpretation[] = [];

    // Step 10: Calculate all Dasha Systems
    // Create planet positions record for Kalachakra (expects Record<string, PlanetPosition>)
    const planetPositionsByName = Object.fromEntries(
      planetPositions.map(p => [p.planet, p])
    );
    
    const yoginiDasha = calculateYoginiDasha(planetPositions, birthDate);
    const ashtottariDasha = calculateAshtottariDasha(planetPositions, houses, birthDate);
    const charaDasha = calculateCharaDasha(planetPositions, houses, ascendantSign, birthDate);
    const kalachakraDasha = calculateKalachakraDasha(planetPositionsByName, birthDate);

    const allDashaSystems = {
      vimshottari: dashaSystem,
      yogini: yoginiDasha,
      ashtottari: ashtottariDasha.isApplicable ? ashtottariDasha : undefined,
      chara: charaDasha,
      kalachakra: kalachakraDasha,
    };

    // Step 11: Placeholder remedy suggestions
    const remedies: RemedySuggestions = {
      gemstones: [],
      mantras: [],
      charityRecommendations: [],
      fastingDays: [],
      behavioralGuidance: [],
      colorTherapy: [],
    };

    // Step 12: Assemble complete Kundli
    const kundli: Kundli = {
      id: nanoid(),
      birthData,
      chartData: {
        planetPositions,
        houses,
        ascendant: ascendantSign,
      },
      navamsa,
      planetaryStrength,
      ashtakavarga,
      divisionalAshtakavarga,
      completeAshtakavarga, // Advanced Ashtakavarga features
      yogas,
      dashaSystem, // Vimshottari (backward compatibility)
      allDashaSystems, // All Dasha systems
      interpretations: {
        personality,
        planets: planetInterpretations,
        houses: houseInterpretations,
        yogas: [],
      },
      remedies,
      generatedAt: new Date(),
    };

    return kundli;
  } catch (error) {
    console.error("Error generating Kundli:", error);
    throw new Error(`Failed to generate Kundli: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Validate birth data before calculation
 */
export function validateBirthData(birthData: BirthData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate date
  const date = new Date(birthData.dateOfBirth);
  if (isNaN(date.getTime())) {
    errors.push("Invalid date of birth");
  }

  // Validate time
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(birthData.timeOfBirth)) {
    errors.push("Invalid time format (use HH:MM)");
  }

  // Validate coordinates
  if (birthData.latitude < -90 || birthData.latitude > 90) {
    errors.push("Latitude must be between -90 and 90");
  }

  if (birthData.longitude < -180 || birthData.longitude > 180) {
    errors.push("Longitude must be between -180 and 180");
  }

  // Validate timezone
  if (birthData.timezone < -12 || birthData.timezone > 14) {
    errors.push("Timezone must be between -12 and +14");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a sample/demo Kundli for testing
 */
export function generateDemoKundli(): Kundli {
  const demoBirthData: BirthData = {
    name: "Demo Chart",
    dateOfBirth: "1990-01-15",
    timeOfBirth: "10:30",
    placeOfBirth: "New Delhi, Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: "male",
  };

  return generateKundli(demoBirthData) as unknown as Kundli;
}

import {
  type PlanetPosition,
  type YoginiDashaSystem,
  type YoginiMahadasha,
  type YoginiAntardasha,
  YoginiLord,
  DashaPlanet,
  DashaType,
  Planet,
  Nakshatra,
} from "@shared/astro-schema";

/**
 * Yogini Dasha System Calculations
 * 36-year cycle divided among 8 yoginis
 * Based on Moon's nakshatra at birth
 * 
 * Reference: Classical Vedic astrology texts
 */

// Yogini periods in years
const YOGINI_DURATIONS: Record<YoginiLord, number> = {
  [YoginiLord.Mangala]: 1,   // Moon
  [YoginiLord.Pingala]: 2,   // Sun
  [YoginiLord.Dhanya]: 3,    // Jupiter
  [YoginiLord.Bhramari]: 4,  // Mars
  [YoginiLord.Bhadrika]: 5,  // Mercury
  [YoginiLord.Ulka]: 6,      // Saturn
  [YoginiLord.Siddha]: 7,    // Venus
  [YoginiLord.Sankata]: 8,   // Rahu
};

// Yogini to planet mapping
const YOGINI_PLANETS: Record<YoginiLord, DashaPlanet> = {
  [YoginiLord.Mangala]: DashaPlanet.Moon,
  [YoginiLord.Pingala]: DashaPlanet.Sun,
  [YoginiLord.Dhanya]: DashaPlanet.Jupiter,
  [YoginiLord.Bhramari]: DashaPlanet.Mars,
  [YoginiLord.Bhadrika]: DashaPlanet.Mercury,
  [YoginiLord.Ulka]: DashaPlanet.Saturn,
  [YoginiLord.Siddha]: DashaPlanet.Venus,
  [YoginiLord.Sankata]: DashaPlanet.Rahu,
};

// Yogini sequence
const YOGINI_SEQUENCE: YoginiLord[] = [
  YoginiLord.Mangala,
  YoginiLord.Pingala,
  YoginiLord.Dhanya,
  YoginiLord.Bhramari,
  YoginiLord.Bhadrika,
  YoginiLord.Ulka,
  YoginiLord.Siddha,
  YoginiLord.Sankata,
];

/**
 * Calculate starting Yogini based on Moon's nakshatra
 * Formula: (Nakshatra number + 3) mod 8
 */
function getStartingYogini(moonPosition: PlanetPosition): YoginiLord {
  // Get nakshatra index (0-26)
  const nakshatras = Object.values(Nakshatra);
  const nakshatraIndex = nakshatras.indexOf(moonPosition.nakshatra);
  
  // Calculate: (nakshatra_number + 3) mod 8
  // Nakshatra number is 1-indexed, so add 1 to index
  const nakshatraNumber = nakshatraIndex + 1;
  const yoginiIndex = (nakshatraNumber + 3 - 1) % 8; // -1 to convert to 0-indexed
  
  return YOGINI_SEQUENCE[yoginiIndex];
}

/**
 * Calculate balance of birth Yogini dasha
 */
function calculateBirthYoginiBalance(
  moonPosition: PlanetPosition,
  birthDate: Date
): { yogini: YoginiLord; balance: number } {
  const yogini = getStartingYogini(moonPosition);
  const duration = YOGINI_DURATIONS[yogini];

  // Each nakshatra is 13°20' (360° / 27)
  const nakshatraStart = Math.floor(moonPosition.longitude / (360 / 27)) * (360 / 27);
  const degreeInNakshatra = moonPosition.longitude - nakshatraStart;
  const fractionCompleted = degreeInNakshatra / (360 / 27);

  // Remaining balance
  const balance = duration * (1 - fractionCompleted);

  return { yogini, balance };
}

/**
 * Calculate all Yogini Mahadasha periods
 */
function calculateYoginiMahadashas(
  startYogini: YoginiLord,
  balance: number,
  birthDate: Date
): YoginiMahadasha[] {
  const mahadashas: YoginiMahadasha[] = [];
  let currentDate = new Date(birthDate);

  // Start with remaining balance of birth yogini
  const startIndex = YOGINI_SEQUENCE.indexOf(startYogini);
  let firstDasha = true;

  // Calculate all mahadashas for 120 years (3+ cycles)
  for (let cycle = 0; cycle < 4; cycle++) {
    for (let i = 0; i < 8; i++) {
      const yoginiIndex = (startIndex + i) % 8;
      const yogini = YOGINI_SEQUENCE[yoginiIndex];
      const duration = firstDasha ? balance : YOGINI_DURATIONS[yogini];

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + Math.floor(duration));
      endDate.setMonth(
        endDate.getMonth() + Math.round((duration % 1) * 12)
      );

      mahadashas.push({
        yogini,
        planet: YOGINI_PLANETS[yogini],
        startDate,
        endDate,
        durationYears: duration,
      });

      currentDate = new Date(endDate);
      firstDasha = false;
    }
  }

  return mahadashas;
}

/**
 * Calculate Yogini Antardashas for a given Mahadasha
 */
function calculateYoginiAntardashas(
  mahadasha: YoginiMahadasha
): YoginiAntardasha[] {
  const antardashas: YoginiAntardasha[] = [];
  const mahadashaYogini = mahadasha.yogini;
  const mahadashaYears = mahadasha.durationYears;
  
  // Start with the mahadasha yogini itself
  const startIndex = YOGINI_SEQUENCE.indexOf(mahadashaYogini);
  let currentDate = new Date(mahadasha.startDate);

  for (let i = 0; i < 8; i++) {
    const yoginiIndex = (startIndex + i) % 8;
    const yogini = YOGINI_SEQUENCE[yoginiIndex];
    const yoginiYears = YOGINI_DURATIONS[yogini];
    
    // Antardasha duration = (Yogini years / 36) * Mahadasha years * 12 months
    const durationMonths = (yoginiYears / 36) * mahadashaYears * 12;

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + Math.floor(durationMonths));
    endDate.setDate(
      endDate.getDate() + Math.round((durationMonths % 1) * 30)
    );

    antardashas.push({
      yogini,
      planet: YOGINI_PLANETS[yogini],
      startDate,
      endDate,
      durationMonths,
      mahadashaYogini,
    });

    currentDate = new Date(endDate);
  }

  return antardashas;
}

/**
 * Find current Yogini Mahadasha and Antardasha
 */
function findCurrentYoginiPeriods(
  mahadashas: YoginiMahadasha[],
  currentDate: Date = new Date()
): {
  currentMahadasha: YoginiMahadasha | null;
  currentAntardasha: YoginiAntardasha | null;
} {
  // Find current mahadasha
  const currentMahadasha = mahadashas.find(
    (md) => currentDate >= md.startDate && currentDate <= md.endDate
  ) || null;

  if (!currentMahadasha) {
    return { currentMahadasha: null, currentAntardasha: null };
  }

  // Calculate antardashas for current mahadasha
  const antardashas = calculateYoginiAntardashas(currentMahadasha);
  
  // Find current antardasha
  const currentAntardasha = antardashas.find(
    (ad) => currentDate >= ad.startDate && currentDate <= ad.endDate
  ) || null;

  return { currentMahadasha, currentAntardasha };
}

/**
 * Main function to calculate complete Yogini Dasha System
 */
export function calculateYoginiDasha(
  planetPositions: PlanetPosition[],
  birthDate: Date
): YoginiDashaSystem {
  const moon = planetPositions.find((p) => p.planet === Planet.Moon);
  if (!moon) {
    throw new Error("Moon position not found");
  }

  const { yogini: birthYogini, balance } = calculateBirthYoginiBalance(moon, birthDate);

  // Calculate all mahadashas
  const mahadashas = calculateYoginiMahadashas(birthYogini, balance, birthDate);

  // Find current periods
  const { currentMahadasha, currentAntardasha } = findCurrentYoginiPeriods(mahadashas);

  return {
    type: DashaType.Yogini,
    birthYogini,
    birthDashaBalance: balance,
    mahadashas,
    currentMahadasha,
    currentAntardasha,
  };
}

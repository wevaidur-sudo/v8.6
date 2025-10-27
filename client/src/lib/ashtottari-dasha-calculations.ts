import {
  type PlanetPosition,
  type HouseData,
  type AshtottariDashaSystem,
  type AshtottariMahadasha,
  type AshtottariAntardasha,
  DashaPlanet,
  DashaType,
  Planet,
  Nakshatra,
} from "@shared/astro-schema";

/**
 * Ashtottari Dasha System Calculations
 * 108-year cycle divided among 8 planets (excludes Ketu)
 * Conditional system based on Rahu's position
 * 
 * Reference: Brihat Parashara Hora Shastra (BPHS)
 */

// Ashtottari Dasha durations in years (excludes Ketu)
const ASHTOTTARI_DURATIONS: Record<DashaPlanet, number> = {
  [DashaPlanet.Sun]: 6,
  [DashaPlanet.Moon]: 15,
  [DashaPlanet.Mars]: 8,
  [DashaPlanet.Mercury]: 17,
  [DashaPlanet.Saturn]: 10,
  [DashaPlanet.Jupiter]: 19,
  [DashaPlanet.Rahu]: 12,
  [DashaPlanet.Venus]: 21,
  [DashaPlanet.Ketu]: 0, // Ketu excluded from Ashtottari
};

// Ashtottari sequence (starting from Sun)
const ASHTOTTARI_SEQUENCE: DashaPlanet[] = [
  DashaPlanet.Sun,
  DashaPlanet.Moon,
  DashaPlanet.Mars,
  DashaPlanet.Mercury,
  DashaPlanet.Saturn,
  DashaPlanet.Jupiter,
  DashaPlanet.Rahu,
  DashaPlanet.Venus,
];

// Nakshatra mapping for Ashtottari (starts from Ardra)
const ASHTOTTARI_NAKSHATRA_LORDS: Record<Nakshatra, DashaPlanet> = {
  [Nakshatra.Ardra]: DashaPlanet.Sun,
  [Nakshatra.Punarvasu]: DashaPlanet.Moon,
  [Nakshatra.Pushya]: DashaPlanet.Mars,
  [Nakshatra.Ashlesha]: DashaPlanet.Mercury,
  [Nakshatra.Magha]: DashaPlanet.Saturn,
  [Nakshatra.PurvaPhalguni]: DashaPlanet.Jupiter,
  [Nakshatra.UttaraPhalguni]: DashaPlanet.Rahu,
  [Nakshatra.Hasta]: DashaPlanet.Venus,
  [Nakshatra.Chitra]: DashaPlanet.Sun,
  [Nakshatra.Swati]: DashaPlanet.Moon,
  [Nakshatra.Vishakha]: DashaPlanet.Mars,
  [Nakshatra.Anuradha]: DashaPlanet.Mercury,
  [Nakshatra.Jyeshtha]: DashaPlanet.Saturn,
  [Nakshatra.Mula]: DashaPlanet.Jupiter,
  [Nakshatra.PurvaAshadha]: DashaPlanet.Rahu,
  [Nakshatra.UttaraAshadha]: DashaPlanet.Venus,
  [Nakshatra.Shravana]: DashaPlanet.Sun,
  [Nakshatra.Dhanishta]: DashaPlanet.Moon,
  [Nakshatra.Shatabhisha]: DashaPlanet.Mars,
  [Nakshatra.PurvaBhadrapada]: DashaPlanet.Mercury,
  [Nakshatra.UttaraBhadrapada]: DashaPlanet.Saturn,
  [Nakshatra.Revati]: DashaPlanet.Jupiter,
  [Nakshatra.Ashwini]: DashaPlanet.Rahu,
  [Nakshatra.Bharani]: DashaPlanet.Venus,
  [Nakshatra.Krittika]: DashaPlanet.Sun,
  [Nakshatra.Rohini]: DashaPlanet.Moon,
  [Nakshatra.Mrigashira]: DashaPlanet.Mars,
};

/**
 * Check if Ashtottari Dasha is applicable
 * Condition: Rahu must be in a Kendra (1,4,7,10) or Trikona (5,9) from Lagna Lord
 * and Rahu must NOT be in Lagna itself
 */
function checkAshtottariApplicability(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): { isApplicable: boolean; reason: string } {
  const rahu = planetPositions.find((p) => p.planet === Planet.Rahu);
  if (!rahu) {
    return { isApplicable: false, reason: "Rahu position not found" };
  }

  // Check if Rahu is in Lagna (1st house)
  if (rahu.house === 1) {
    return {
      isApplicable: false,
      reason: "Rahu is in Lagna (1st house) - Ashtottari not applicable",
    };
  }

  // Get Lagna lord's position
  const lagnaHouse = houses[0]; // 1st house
  const lagnaLord = planetPositions.find((p) => p.planet === lagnaHouse.lord);
  
  if (!lagnaLord) {
    return { isApplicable: false, reason: "Lagna lord position not found" };
  }

  // Calculate house difference from Lagna Lord to Rahu
  let houseDiff = rahu.house - lagnaLord.house;
  if (houseDiff < 0) houseDiff += 12;
  
  // Normalize to 1-12
  houseDiff = ((houseDiff - 1) % 12) + 1;

  // Check if Rahu is in Kendra (1,4,7,10) or Trikona (5,9) from Lagna Lord
  const kendras = [1, 4, 7, 10];
  const trikonas = [5, 9];
  const isInKendraOrTrikona = kendras.includes(houseDiff) || trikonas.includes(houseDiff);

  if (isInKendraOrTrikona) {
    return {
      isApplicable: true,
      reason: `Rahu is in house ${houseDiff} from Lagna Lord (${kendras.includes(houseDiff) ? 'Kendra' : 'Trikona'}) - Ashtottari applicable`,
    };
  }

  return {
    isApplicable: false,
    reason: `Rahu is in house ${houseDiff} from Lagna Lord (not in Kendra or Trikona) - Ashtottari not applicable`,
  };
}

/**
 * Calculate balance of birth dasha for Ashtottari
 */
function calculateBirthDashaBalance(
  moonPosition: PlanetPosition,
  birthDate: Date
): { planet: DashaPlanet; balance: number } {
  const nakshatra = moonPosition.nakshatra;
  const planet = ASHTOTTARI_NAKSHATRA_LORDS[nakshatra];
  const duration = ASHTOTTARI_DURATIONS[planet];

  // Each nakshatra is 13°20' (360° / 27)
  const nakshatraStart = Math.floor(moonPosition.longitude / (360 / 27)) * (360 / 27);
  const degreeInNakshatra = moonPosition.longitude - nakshatraStart;
  const fractionCompleted = degreeInNakshatra / (360 / 27);

  // Remaining balance
  const balance = duration * (1 - fractionCompleted);

  return { planet, balance };
}

/**
 * Calculate all Ashtottari Mahadasha periods
 */
function calculateAshtottariMahadashas(
  startPlanet: DashaPlanet,
  balance: number,
  birthDate: Date
): AshtottariMahadasha[] {
  const mahadashas: AshtottariMahadasha[] = [];
  let currentDate = new Date(birthDate);

  // Start with remaining balance of birth dasha
  const startIndex = ASHTOTTARI_SEQUENCE.indexOf(startPlanet);
  let firstDasha = true;

  // Calculate mahadashas for 120+ years (full cycles)
  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < 8; i++) {
      const planetIndex = (startIndex + i) % 8;
      const planet = ASHTOTTARI_SEQUENCE[planetIndex];
      const duration = firstDasha ? balance : ASHTOTTARI_DURATIONS[planet];

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + Math.floor(duration));
      endDate.setMonth(
        endDate.getMonth() + Math.round((duration % 1) * 12)
      );

      mahadashas.push({
        planet,
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
 * Calculate Ashtottari Antardashas for a given Mahadasha
 */
function calculateAshtottariAntardashas(
  mahadasha: AshtottariMahadasha
): AshtottariAntardasha[] {
  const antardashas: AshtottariAntardasha[] = [];
  const mahadashaPlanet = mahadasha.planet;
  const mahadashaYears = mahadasha.durationYears;
  
  // Start with the mahadasha planet itself
  const startIndex = ASHTOTTARI_SEQUENCE.indexOf(mahadashaPlanet);
  let currentDate = new Date(mahadasha.startDate);

  for (let i = 0; i < 8; i++) {
    const planetIndex = (startIndex + i) % 8;
    const planet = ASHTOTTARI_SEQUENCE[planetIndex];
    const planetYears = ASHTOTTARI_DURATIONS[planet];
    
    // Antardasha duration = (Planet years / 108) * Mahadasha years * 12 months
    const durationMonths = (planetYears / 108) * mahadashaYears * 12;

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + Math.floor(durationMonths));
    endDate.setDate(
      endDate.getDate() + Math.round((durationMonths % 1) * 30)
    );

    antardashas.push({
      planet,
      startDate,
      endDate,
      durationMonths,
      mahadashaPlanet,
    });

    currentDate = new Date(endDate);
  }

  return antardashas;
}

/**
 * Find current Ashtottari Mahadasha and Antardasha
 */
function findCurrentAshtottariPeriods(
  mahadashas: AshtottariMahadasha[],
  currentDate: Date = new Date()
): {
  currentMahadasha: AshtottariMahadasha | null;
  currentAntardasha: AshtottariAntardasha | null;
} {
  // Find current mahadasha
  const currentMahadasha = mahadashas.find(
    (md) => currentDate >= md.startDate && currentDate <= md.endDate
  ) || null;

  if (!currentMahadasha) {
    return { currentMahadasha: null, currentAntardasha: null };
  }

  // Calculate antardashas for current mahadasha
  const antardashas = calculateAshtottariAntardashas(currentMahadasha);
  
  // Find current antardasha
  const currentAntardasha = antardashas.find(
    (ad) => currentDate >= ad.startDate && currentDate <= ad.endDate
  ) || null;

  return { currentMahadasha, currentAntardasha };
}

/**
 * Main function to calculate complete Ashtottari Dasha System
 */
export function calculateAshtottariDasha(
  planetPositions: PlanetPosition[],
  houses: HouseData[],
  birthDate: Date
): AshtottariDashaSystem {
  // Check applicability
  const { isApplicable, reason } = checkAshtottariApplicability(planetPositions, houses);

  const moon = planetPositions.find((p) => p.planet === Planet.Moon);
  if (!moon) {
    throw new Error("Moon position not found");
  }

  const { planet: birthDasha, balance } = calculateBirthDashaBalance(moon, birthDate);

  // Calculate mahadashas (even if not applicable, for reference)
  const mahadashas = calculateAshtottariMahadashas(birthDasha, balance, birthDate);

  // Find current periods
  const { currentMahadasha, currentAntardasha } = findCurrentAshtottariPeriods(mahadashas);

  return {
    type: DashaType.Ashtottari,
    isApplicable,
    applicabilityReason: reason,
    birthDasha,
    birthDashaBalance: balance,
    mahadashas,
    currentMahadasha: isApplicable ? currentMahadasha : null,
    currentAntardasha: isApplicable ? currentAntardasha : null,
  };
}

import {
  type PlanetPosition,
  type HouseData,
  type CharaDashaSystem,
  type CharaMahadasha,
  type CharaAntardasha,
  DashaType,
  ZodiacSign,
  Planet,
} from "@shared/astro-schema";

/**
 * Chara Dasha System Calculations (Jaimini)
 * Sign-based dasha system with variable durations (1-12 years)
 * Starts from Lagna (Ascendant)
 * 
 * Reference: Jaimini Sutras, Classical Jaimini astrology
 */

// Sign sequence in zodiac order
const SIGN_SEQUENCE: ZodiacSign[] = [
  ZodiacSign.Aries,
  ZodiacSign.Taurus,
  ZodiacSign.Gemini,
  ZodiacSign.Cancer,
  ZodiacSign.Leo,
  ZodiacSign.Virgo,
  ZodiacSign.Libra,
  ZodiacSign.Scorpio,
  ZodiacSign.Sagittarius,
  ZodiacSign.Capricorn,
  ZodiacSign.Aquarius,
  ZodiacSign.Pisces,
];

// Odd quarters (Savya - forward counting)
const ODD_QUARTERS = [
  [ZodiacSign.Aries, ZodiacSign.Taurus, ZodiacSign.Gemini],
  [ZodiacSign.Libra, ZodiacSign.Scorpio, ZodiacSign.Sagittarius],
];

// Even quarters (Apasavya - backward counting)
const EVEN_QUARTERS = [
  [ZodiacSign.Cancer, ZodiacSign.Leo, ZodiacSign.Virgo],
  [ZodiacSign.Capricorn, ZodiacSign.Aquarius, ZodiacSign.Pisces],
];

// Savya signs (count forward)
const SAVYA_SIGNS = [
  ZodiacSign.Aries,
  ZodiacSign.Taurus,
  ZodiacSign.Gemini,
  ZodiacSign.Libra,
  ZodiacSign.Scorpio,
  ZodiacSign.Sagittarius,
];

// Sign lords mapping
const SIGN_LORDS: Record<ZodiacSign, Planet[]> = {
  [ZodiacSign.Aries]: [Planet.Mars],
  [ZodiacSign.Taurus]: [Planet.Venus],
  [ZodiacSign.Gemini]: [Planet.Mercury],
  [ZodiacSign.Cancer]: [Planet.Moon],
  [ZodiacSign.Leo]: [Planet.Sun],
  [ZodiacSign.Virgo]: [Planet.Mercury],
  [ZodiacSign.Libra]: [Planet.Venus],
  [ZodiacSign.Scorpio]: [Planet.Mars, Planet.Ketu], // Dual lordship
  [ZodiacSign.Sagittarius]: [Planet.Jupiter],
  [ZodiacSign.Capricorn]: [Planet.Saturn],
  [ZodiacSign.Aquarius]: [Planet.Saturn, Planet.Rahu], // Dual lordship
  [ZodiacSign.Pisces]: [Planet.Jupiter],
};

/**
 * Determine if the dasha sequence is forward or backward
 * Based on the 9th house sign from Lagna
 */
function getDashaDirection(ascendantSign: ZodiacSign): "forward" | "backward" {
  const ascIndex = SIGN_SEQUENCE.indexOf(ascendantSign);
  const ninthHouseIndex = (ascIndex + 8) % 12; // 9th house is 8 signs away
  const ninthHouseSign = SIGN_SEQUENCE[ninthHouseIndex];

  // Check if 9th house is in odd or even quarter
  const isOddQuarter = ODD_QUARTERS.some(quarter => quarter.includes(ninthHouseSign));
  
  return isOddQuarter ? "forward" : "backward";
}

/**
 * Get the planetary lord(s) of a sign
 * For dual lordship signs, select based on specific rules
 */
function getSignLord(
  sign: ZodiacSign,
  planetPositions: PlanetPosition[]
): Planet {
  const lords = SIGN_LORDS[sign];
  
  if (lords.length === 1) {
    return lords[0];
  }

  // Dual lordship (Scorpio: Mars+Ketu, Aquarius: Saturn+Rahu)
  // Rules for selection:
  // 1. If one lord is in its own sign, use the other
  // 2. Choose lord with more planets conjunct
  // 3. Choose lord in dual sign > fixed > movable
  // 4. Choose lord with higher degrees
  
  const lord1Pos = planetPositions.find(p => p.planet === lords[0]);
  const lord2Pos = planetPositions.find(p => p.planet === lords[1]);

  // Simple rule: use the first (traditional) lord
  // This can be enhanced with the full Jaimini rules
  return lords[0];
}

/**
 * Calculate the duration of a sign's Mahadasha
 * Duration = Count from sign to its lord's position - 1
 * Special cases based on Savya/Apasavya
 */
function calculateSignDuration(
  sign: ZodiacSign,
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): number {
  const isSavyaSign = SAVYA_SIGNS.includes(sign);
  const lord = getSignLord(sign, planetPositions);
  const lordPosition = planetPositions.find(p => p.planet === lord);

  if (!lordPosition) {
    // Default to average duration if lord not found
    return 6;
  }

  // Get sign index
  const signIndex = SIGN_SEQUENCE.indexOf(sign);
  const lordSignIndex = SIGN_SEQUENCE.indexOf(lordPosition.sign);

  let count: number;
  
  if (isSavyaSign) {
    // Count forward (clockwise)
    count = (lordSignIndex - signIndex + 12) % 12;
  } else {
    // Count backward (counter-clockwise)
    count = (signIndex - lordSignIndex + 12) % 12;
  }

  // Duration is count, unless count is 0 (lord in own sign), then duration is 12
  const duration = count === 0 ? 12 : count;

  return duration;
}

/**
 * Calculate all Chara Mahadasha periods
 */
function calculateCharaMahadashas(
  ascendantSign: ZodiacSign,
  direction: "forward" | "backward",
  planetPositions: PlanetPosition[],
  houses: HouseData[],
  birthDate: Date
): CharaMahadasha[] {
  const mahadashas: CharaMahadasha[] = [];
  let currentDate = new Date(birthDate);

  const startIndex = SIGN_SEQUENCE.indexOf(ascendantSign);

  // Calculate mahadashas for 120 years (full cycle through all signs)
  for (let cycle = 0; cycle < 10; cycle++) {
    for (let i = 0; i < 12; i++) {
      let signIndex: number;
      
      if (direction === "forward") {
        signIndex = (startIndex + i) % 12;
      } else {
        signIndex = (startIndex - i + 12) % 12;
      }

      const sign = SIGN_SEQUENCE[signIndex];
      const duration = calculateSignDuration(sign, planetPositions, houses);

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + duration);

      mahadashas.push({
        sign,
        startDate,
        endDate,
        durationYears: duration,
      });

      currentDate = new Date(endDate);
    }
  }

  return mahadashas;
}

/**
 * Calculate Chara Antardashas for a given Mahadasha
 * Each Antardasha = Mahadasha duration / 12
 * Sequence follows same direction, but Mahadasha sign comes LAST
 */
function calculateCharaAntardashas(
  mahadasha: CharaMahadasha,
  direction: "forward" | "backward"
): CharaAntardasha[] {
  const antardashas: CharaAntardasha[] = [];
  const mahadashaSign = mahadasha.sign;
  const mahadashaYears = mahadasha.durationYears;
  
  // Duration of each antardasha in months
  const antardashaMonths = mahadashaYears; // Each antardasha is 1 month per year of Mahadasha
  
  // Starting sign for antardashas - the NEXT sign from mahadasha sign
  const signIndex = SIGN_SEQUENCE.indexOf(mahadashaSign);
  let currentDate = new Date(mahadasha.startDate);

  for (let i = 0; i < 12; i++) {
    let antardashaSignIndex: number;
    
    if (direction === "forward") {
      antardashaSignIndex = (signIndex + 1 + i) % 12; // Start from next sign
    } else {
      antardashaSignIndex = (signIndex - 1 - i + 12) % 12;
    }

    const sign = SIGN_SEQUENCE[antardashaSignIndex];

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + antardashaMonths);

    antardashas.push({
      sign,
      startDate,
      endDate,
      durationMonths: antardashaMonths,
      mahadashaSign,
    });

    currentDate = new Date(endDate);
  }

  return antardashas;
}

/**
 * Find current Chara Mahadasha and Antardasha
 */
function findCurrentCharaPeriods(
  mahadashas: CharaMahadasha[],
  direction: "forward" | "backward",
  currentDate: Date = new Date()
): {
  currentMahadasha: CharaMahadasha | null;
  currentAntardasha: CharaAntardasha | null;
} {
  // Find current mahadasha
  const currentMahadasha = mahadashas.find(
    (md) => currentDate >= md.startDate && currentDate <= md.endDate
  ) || null;

  if (!currentMahadasha) {
    return { currentMahadasha: null, currentAntardasha: null };
  }

  // Calculate antardashas for current mahadasha
  const antardashas = calculateCharaAntardashas(currentMahadasha, direction);
  
  // Find current antardasha
  const currentAntardasha = antardashas.find(
    (ad) => currentDate >= ad.startDate && currentDate <= ad.endDate
  ) || null;

  return { currentMahadasha, currentAntardasha };
}

/**
 * Main function to calculate complete Chara Dasha System
 */
export function calculateCharaDasha(
  planetPositions: PlanetPosition[],
  houses: HouseData[],
  ascendantSign: ZodiacSign,
  birthDate: Date
): CharaDashaSystem {
  // Determine direction
  const direction = getDashaDirection(ascendantSign);

  // Calculate all mahadashas
  const mahadashas = calculateCharaMahadashas(
    ascendantSign,
    direction,
    planetPositions,
    houses,
    birthDate
  );

  // Find current periods
  const { currentMahadasha, currentAntardasha } = findCurrentCharaPeriods(
    mahadashas,
    direction
  );

  return {
    type: DashaType.Chara,
    direction,
    mahadashas,
    currentMahadasha,
    currentAntardasha,
  };
}

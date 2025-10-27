import {
  type PlanetPosition,
  type KalachakraDashaSystem,
  type KalachakraMahadasha,
  DashaType,
  ZodiacSign,
  Nakshatra,
} from "@shared/astro-schema";

/**
 * Kalachakra Dasha System Calculations
 * Sign-based dasha system with variable durations (4-21 years)
 * Based on Moon's nakshatra and pada at birth
 * One of the most sophisticated dasha systems in Vedic astrology
 * 
 * Reference: Brihat Parashara Hora Shastra (BPHS), Classical Jyotish texts
 */

// Rashi (Sign) durations in years based on planetary rulers
const RASHI_DURATIONS: Record<ZodiacSign, number> = {
  [ZodiacSign.Aries]: 7,       // Mars
  [ZodiacSign.Taurus]: 16,     // Venus
  [ZodiacSign.Gemini]: 9,      // Mercury
  [ZodiacSign.Cancer]: 21,     // Moon
  [ZodiacSign.Leo]: 5,         // Sun
  [ZodiacSign.Virgo]: 9,       // Mercury
  [ZodiacSign.Libra]: 16,      // Venus
  [ZodiacSign.Scorpio]: 7,     // Mars
  [ZodiacSign.Sagittarius]: 10, // Jupiter
  [ZodiacSign.Capricorn]: 4,   // Saturn
  [ZodiacSign.Aquarius]: 4,    // Saturn
  [ZodiacSign.Pisces]: 10,     // Jupiter
};

// Savya (forward movement) nakshatras
const SAVYA_NAKSHATRAS = [
  Nakshatra.Ashwini,
  Nakshatra.Bharani,
  Nakshatra.Krittika,
  Nakshatra.Punarvasu,
  Nakshatra.Pushya,
  Nakshatra.Ashlesha,
  Nakshatra.Hasta,
  Nakshatra.Chitra,
  Nakshatra.Swati,
  Nakshatra.Mula,
  Nakshatra.PurvaAshadha,
  Nakshatra.UttaraAshadha,
  Nakshatra.PurvaBhadrapada,
  Nakshatra.UttaraBhadrapada,
  Nakshatra.Revati,
];

// Apasavya (reverse movement) nakshatras
const APASAVYA_NAKSHATRAS = [
  Nakshatra.Rohini,
  Nakshatra.Mrigashira,
  Nakshatra.Ardra,
  Nakshatra.Magha,
  Nakshatra.PurvaPhalguni,
  Nakshatra.UttaraPhalguni,
  Nakshatra.Vishakha,
  Nakshatra.Anuradha,
  Nakshatra.Jyeshtha,
  Nakshatra.Shravana,
  Nakshatra.Dhanishta,
  Nakshatra.Shatabhisha,
];

// Savya Pada 1 sequence
const SAVYA_PADA1_SEQUENCE = [
  ZodiacSign.Aries,
  ZodiacSign.Taurus,
  ZodiacSign.Gemini,
  ZodiacSign.Cancer,
  ZodiacSign.Leo,
  ZodiacSign.Virgo,
  ZodiacSign.Libra,
  ZodiacSign.Scorpio,
  ZodiacSign.Sagittarius,
];

// Savya Pada 2 sequence
const SAVYA_PADA2_SEQUENCE = [
  ZodiacSign.Capricorn,
  ZodiacSign.Aquarius,
  ZodiacSign.Pisces,
  ZodiacSign.Scorpio,
  ZodiacSign.Libra,
  ZodiacSign.Virgo,
  ZodiacSign.Cancer,
  ZodiacSign.Leo,
  ZodiacSign.Gemini,
];

// Savya Pada 3 sequence
const SAVYA_PADA3_SEQUENCE = [
  ZodiacSign.Taurus,
  ZodiacSign.Aries,
  ZodiacSign.Pisces,
  ZodiacSign.Aquarius,
  ZodiacSign.Capricorn,
  ZodiacSign.Sagittarius,
  ZodiacSign.Aries,
  ZodiacSign.Taurus,
  ZodiacSign.Gemini,
];

// Savya Pada 4 sequence
const SAVYA_PADA4_SEQUENCE = [
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

// Apasavya Pada 1 sequence
const APASAVYA_PADA1_SEQUENCE = [
  ZodiacSign.Sagittarius,
  ZodiacSign.Capricorn,
  ZodiacSign.Aquarius,
  ZodiacSign.Pisces,
  ZodiacSign.Aries,
  ZodiacSign.Taurus,
  ZodiacSign.Gemini,
  ZodiacSign.Leo,
  ZodiacSign.Cancer,
];

// Apasavya Pada 2 sequence
const APASAVYA_PADA2_SEQUENCE = [
  ZodiacSign.Virgo,
  ZodiacSign.Libra,
  ZodiacSign.Scorpio,
  ZodiacSign.Pisces,
  ZodiacSign.Aquarius,
  ZodiacSign.Capricorn,
  ZodiacSign.Sagittarius,
  ZodiacSign.Scorpio,
  ZodiacSign.Libra,
];

// Apasavya Pada 3 sequence
const APASAVYA_PADA3_SEQUENCE = [
  ZodiacSign.Virgo,
  ZodiacSign.Leo,
  ZodiacSign.Cancer,
  ZodiacSign.Gemini,
  ZodiacSign.Taurus,
  ZodiacSign.Aries,
  ZodiacSign.Pisces,
  ZodiacSign.Aquarius,
  ZodiacSign.Capricorn,
];

// Apasavya Pada 4 sequence
const APASAVYA_PADA4_SEQUENCE = [
  ZodiacSign.Sagittarius,
  ZodiacSign.Scorpio,
  ZodiacSign.Libra,
  ZodiacSign.Virgo,
  ZodiacSign.Cancer,
  ZodiacSign.Leo,
  ZodiacSign.Gemini,
  ZodiacSign.Taurus,
  ZodiacSign.Aries,
];

/**
 * Get dasha sequence based on Moon's nakshatra and pada
 */
function getDashaSequence(nakshatra: Nakshatra, nakshatraPada: number): ZodiacSign[] {
  const isSavya = SAVYA_NAKSHATRAS.includes(nakshatra);
  
  if (isSavya) {
    switch (nakshatraPada) {
      case 1:
        return SAVYA_PADA1_SEQUENCE;
      case 2:
        return SAVYA_PADA2_SEQUENCE;
      case 3:
        return SAVYA_PADA3_SEQUENCE;
      case 4:
        return SAVYA_PADA4_SEQUENCE;
      default:
        return SAVYA_PADA1_SEQUENCE;
    }
  } else {
    switch (nakshatraPada) {
      case 1:
        return APASAVYA_PADA1_SEQUENCE;
      case 2:
        return APASAVYA_PADA2_SEQUENCE;
      case 3:
        return APASAVYA_PADA3_SEQUENCE;
      case 4:
        return APASAVYA_PADA4_SEQUENCE;
      default:
        return APASAVYA_PADA1_SEQUENCE;
    }
  }
}

/**
 * Calculate balance of birth Kalachakra dasha and rotate sequence to start from Moon's sign
 */
function calculateBirthKalachakraBalance(
  moonPosition: PlanetPosition
): { sign: ZodiacSign; balance: number; rotatedSequence: ZodiacSign[] } {
  const baseSequence = getDashaSequence(moonPosition.nakshatra, moonPosition.nakshatraPada);
  const moonSign = moonPosition.sign;
  
  // Find Moon's sign in the sequence and rotate to start from it
  let moonSignIndex = baseSequence.indexOf(moonSign);
  
  // Kalachakra sequences only have 9 signs (not all 12), so if Moon's sign is not in the sequence,
  // we need to find the next sign in zodiacal order that appears in the sequence
  let startSign = moonSign;
  let startSignIndex = moonSignIndex;
  
  if (moonSignIndex === -1) {
    // Get all zodiac signs in order
    const allSigns = [
      ZodiacSign.Aries, ZodiacSign.Taurus, ZodiacSign.Gemini, ZodiacSign.Cancer,
      ZodiacSign.Leo, ZodiacSign.Virgo, ZodiacSign.Libra, ZodiacSign.Scorpio,
      ZodiacSign.Sagittarius, ZodiacSign.Capricorn, ZodiacSign.Aquarius, ZodiacSign.Pisces
    ];
    
    const moonSignZodiacIndex = allSigns.indexOf(moonSign);
    
    // Search forward through the zodiac to find the next sign in the sequence
    for (let i = 1; i <= 12; i++) {
      const nextSignIndex = (moonSignZodiacIndex + i) % 12;
      const nextSign = allSigns[nextSignIndex];
      const indexInSequence = baseSequence.indexOf(nextSign);
      
      if (indexInSequence !== -1) {
        startSign = nextSign;
        startSignIndex = indexInSequence;
        break;
      }
    }
    
    console.warn(`Moon sign ${moonSign} not in Kalachakra sequence (pada ${moonPosition.nakshatraPada}), starting from ${startSign}`);
  }
  
  // Rotate sequence to start from the determined sign
  const rotatedSequence = [
    ...baseSequence.slice(startSignIndex),
    ...baseSequence.slice(0, startSignIndex)
  ];
  
  const duration = RASHI_DURATIONS[startSign];

  // Calculate balance for Moon's actual position
  // Each nakshatra is 13°20' (360° / 27)
  const nakshatraStart = Math.floor(moonPosition.longitude / (360 / 27)) * (360 / 27);
  const degreeInNakshatra = moonPosition.longitude - nakshatraStart;
  
  // Each pada is 1/4 of nakshatra (3°20')
  const padaStart = (moonPosition.nakshatraPada - 1) * (360 / 27 / 4);
  const degreeInPada = degreeInNakshatra - padaStart;
  const fractionCompleted = degreeInPada / (360 / 27 / 4);

  // Remaining balance in first dasha
  // If Moon sign wasn't in sequence, start with full duration
  const balance = moonSignIndex === -1 ? duration : duration * (1 - fractionCompleted);

  return { sign: startSign, balance, rotatedSequence };
}

/**
 * Calculate all Kalachakra Mahadasha periods
 */
function calculateKalachakraMahadashas(
  startSign: ZodiacSign,
  sequence: ZodiacSign[],
  balance: number,
  birthDate: Date
): KalachakraMahadasha[] {
  const mahadashas: KalachakraMahadasha[] = [];
  let currentDate = new Date(birthDate);
  let firstDasha = true;

  // Calculate for 120 years (multiple cycles)
  for (let cycle = 0; cycle < 14; cycle++) {
    for (const sign of sequence) {
      const duration = firstDasha ? balance : RASHI_DURATIONS[sign];
      
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + Math.floor(duration));
      endDate.setMonth(
        endDate.getMonth() + Math.round((duration % 1) * 12)
      );

      mahadashas.push({
        sign,
        startDate,
        endDate,
        durationYears: duration,
      });

      currentDate = new Date(endDate);
      firstDasha = false;

      // Stop if we've exceeded 120 years from birth
      const yearsDiff = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (yearsDiff > 120) {
        return mahadashas;
      }
    }
  }

  return mahadashas;
}

/**
 * Main function to calculate Kalachakra Dasha system
 */
export function calculateKalachakraDasha(
  planetPositions: Record<string, PlanetPosition>,
  birthDate: Date
): KalachakraDashaSystem {
  const moonPosition = planetPositions.Moon;
  const { sign: birthSign, balance, rotatedSequence } = calculateBirthKalachakraBalance(moonPosition);

  // Calculate all mahadashas using the rotated sequence starting from Moon's sign
  const mahadashas = calculateKalachakraMahadashas(
    birthSign,
    rotatedSequence,
    balance,
    birthDate
  );

  // Find current mahadasha
  const now = new Date();
  const currentMahadasha = mahadashas.find(
    (m) => m.startDate <= now && m.endDate >= now
  ) || null;

  return {
    type: DashaType.Kalachakra,
    mahadashas,
    currentMahadasha,
  };
}

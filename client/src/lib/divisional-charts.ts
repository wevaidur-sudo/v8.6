import {
  type PlanetPosition,
  type HouseData,
  Planet,
  ZodiacSign,
  Nakshatra,
  PlanetaryDignity,
} from "@shared/astro-schema";

/**
 * Additional Divisional Charts (Vargas) Calculations
 * D7 (Saptamsa) - Children
 * D10 (Dasamsa) - Career/Profession
 * D12 (Dwadasamsa) - Parents
 * D16 (Shodasamsa) - Vehicles/Comforts
 * D24 (Chaturvimsamsa) - Education/Learning
 */

const ZODIAC_SIGNS = [
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

const NAKSHATRAS = [
  Nakshatra.Ashwini,
  Nakshatra.Bharani,
  Nakshatra.Krittika,
  Nakshatra.Rohini,
  Nakshatra.Mrigashira,
  Nakshatra.Ardra,
  Nakshatra.Punarvasu,
  Nakshatra.Pushya,
  Nakshatra.Ashlesha,
  Nakshatra.Magha,
  Nakshatra.PurvaPhalguni,
  Nakshatra.UttaraPhalguni,
  Nakshatra.Hasta,
  Nakshatra.Chitra,
  Nakshatra.Swati,
  Nakshatra.Vishakha,
  Nakshatra.Anuradha,
  Nakshatra.Jyeshtha,
  Nakshatra.Mula,
  Nakshatra.PurvaAshadha,
  Nakshatra.UttaraAshadha,
  Nakshatra.Shravana,
  Nakshatra.Dhanishta,
  Nakshatra.Shatabhisha,
  Nakshatra.PurvaBhadrapada,
  Nakshatra.UttaraBhadrapada,
  Nakshatra.Revati,
];

/**
 * Get sign lord
 */
function getSignLord(sign: ZodiacSign): Planet {
  const lords: Record<ZodiacSign, Planet> = {
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
  return lords[sign];
}

/**
 * Get planetary dignity in a sign
 */
function getPlanetaryDignity(
  planet: Planet,
  sign: ZodiacSign
): PlanetaryDignity {
  const exaltations: Record<string, ZodiacSign> = {
    [Planet.Sun]: ZodiacSign.Aries,
    [Planet.Moon]: ZodiacSign.Taurus,
    [Planet.Mars]: ZodiacSign.Capricorn,
    [Planet.Mercury]: ZodiacSign.Virgo,
    [Planet.Jupiter]: ZodiacSign.Cancer,
    [Planet.Venus]: ZodiacSign.Pisces,
    [Planet.Saturn]: ZodiacSign.Libra,
  };

  const debilitations: Record<string, ZodiacSign> = {
    [Planet.Sun]: ZodiacSign.Libra,
    [Planet.Moon]: ZodiacSign.Scorpio,
    [Planet.Mars]: ZodiacSign.Cancer,
    [Planet.Mercury]: ZodiacSign.Pisces,
    [Planet.Jupiter]: ZodiacSign.Capricorn,
    [Planet.Venus]: ZodiacSign.Virgo,
    [Planet.Saturn]: ZodiacSign.Aries,
  };

  const ownSigns: Record<string, ZodiacSign[]> = {
    [Planet.Sun]: [ZodiacSign.Leo],
    [Planet.Moon]: [ZodiacSign.Cancer],
    [Planet.Mars]: [ZodiacSign.Aries, ZodiacSign.Scorpio],
    [Planet.Mercury]: [ZodiacSign.Gemini, ZodiacSign.Virgo],
    [Planet.Jupiter]: [ZodiacSign.Sagittarius, ZodiacSign.Pisces],
    [Planet.Venus]: [ZodiacSign.Taurus, ZodiacSign.Libra],
    [Planet.Saturn]: [ZodiacSign.Capricorn, ZodiacSign.Aquarius],
  };

  if (exaltations[planet.toString()] === sign) {
    return PlanetaryDignity.Exalted;
  }

  if (debilitations[planet.toString()] === sign) {
    return PlanetaryDignity.Debilitated;
  }

  if (ownSigns[planet.toString()]?.includes(sign)) {
    return PlanetaryDignity.OwnSign;
  }

  return PlanetaryDignity.NeutralSign;
}

/**
 * Get nakshatra from longitude
 */
function getNakshatra(longitude: number): {
  nakshatra: Nakshatra;
  pada: number;
} {
  const nakshatraIndex = Math.floor((longitude / 360) * 27);
  const nakshatraDegree = (longitude % (360 / 27)) / (360 / 27);
  const pada = Math.floor(nakshatraDegree * 4) + 1;

  return {
    nakshatra: NAKSHATRAS[nakshatraIndex] || Nakshatra.Ashwini,
    pada,
  };
}

/**
 * Check if sign is odd or even
 */
function isOddSign(sign: ZodiacSign): boolean {
  const oddSigns = [
    ZodiacSign.Aries,
    ZodiacSign.Gemini,
    ZodiacSign.Leo,
    ZodiacSign.Libra,
    ZodiacSign.Sagittarius,
    ZodiacSign.Aquarius,
  ];
  return oddSigns.includes(sign);
}

/**
 * Calculate D7 (Saptamsa) - Children chart
 */
export function calculateD7Saptamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor((degreeInSign / 30) * 7);

    let d7SignIndex: number;
    if (isOddSign(planet.sign)) {
      d7SignIndex = (signIndex + division) % 12;
    } else {
      d7SignIndex = (signIndex + 6 + division) % 12;
    }

    const d7Sign = ZODIAC_SIGNS[d7SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d7Sign,
      degree: (division * 30) / 7,
      dignity: getPlanetaryDignity(planet.planet, d7Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D10 (Dasamsa) - Career/Profession chart
 */
export function calculateD10Dasamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor((degreeInSign / 30) * 10);

    let d10SignIndex: number;
    if (isOddSign(planet.sign)) {
      d10SignIndex = (signIndex + division) % 12;
    } else {
      d10SignIndex = (signIndex + 8 + division) % 12;
    }

    const d10Sign = ZODIAC_SIGNS[d10SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d10Sign,
      degree: (division * 30) / 10,
      dignity: getPlanetaryDignity(planet.planet, d10Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D12 (Dwadasamsa) - Parents chart
 */
export function calculateD12Dwadasamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor((degreeInSign / 30) * 12);

    const d12SignIndex = (signIndex + division) % 12;
    const d12Sign = ZODIAC_SIGNS[d12SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d12Sign,
      degree: (division * 30) / 12,
      dignity: getPlanetaryDignity(planet.planet, d12Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D16 (Shodasamsa) - Vehicles/Comforts chart
 */
export function calculateD16Shodasamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor((degreeInSign / 30) * 16);

    let d16SignIndex: number;
    if (isOddSign(planet.sign)) {
      d16SignIndex = (signIndex + division) % 12;
    } else {
      d16SignIndex = (signIndex + 8 + division) % 12;
    }

    const d16Sign = ZODIAC_SIGNS[d16SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d16Sign,
      degree: (division * 30) / 16,
      dignity: getPlanetaryDignity(planet.planet, d16Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D24 (Chaturvimsamsa) - Education/Learning chart
 */
export function calculateD24Chaturvimsamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor((degreeInSign / 30) * 24);

    let d24SignIndex: number;
    if (isOddSign(planet.sign)) {
      d24SignIndex = (signIndex + division) % 12;
    } else {
      d24SignIndex = (signIndex + 4 + division) % 12;
    }

    const d24Sign = ZODIAC_SIGNS[d24SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d24Sign,
      degree: (division * 30) / 24,
      dignity: getPlanetaryDignity(planet.planet, d24Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D2 (Hora) - Wealth chart
 * Verified formula from BPHS: Odd signs (0-15° → Leo, 15-30° → Cancer), Even signs (0-15° → Cancer, 15-30° → Leo)
 */
export function calculateD2Hora(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 15); // 0 or 1

    let d2Sign: ZodiacSign;
    if (isOddSign(planet.sign)) {
      // Odd signs: 0-15° → Leo, 15-30° → Cancer
      d2Sign = division === 0 ? ZodiacSign.Leo : ZodiacSign.Cancer;
    } else {
      // Even signs: 0-15° → Cancer, 15-30° → Leo
      d2Sign = division === 0 ? ZodiacSign.Cancer : ZodiacSign.Leo;
    }

    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d2Sign,
      degree: (degreeInSign % 15) * 2, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d2Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D3 (Drekkana) - Siblings chart
 * Verified formula from BPHS: Each sign divided into 10° segments
 * Movable signs start from same, Fixed from 5th, Dual from 9th
 */
export function calculateD3Drekkana(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  // Movable signs: Aries, Cancer, Libra, Capricorn
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  // Fixed signs: Taurus, Leo, Scorpio, Aquarius
  const fixedSigns = [ZodiacSign.Taurus, ZodiacSign.Leo, ZodiacSign.Scorpio, ZodiacSign.Aquarius];
  
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 10); // 0, 1, or 2

    let d3SignIndex: number;
    if (movableSigns.includes(planet.sign)) {
      // Movable: count from same sign
      d3SignIndex = (signIndex + (division * 4)) % 12;
    } else if (fixedSigns.includes(planet.sign)) {
      // Fixed: count from 5th sign
      d3SignIndex = (signIndex + 4 + (division * 4)) % 12;
    } else {
      // Dual: count from 9th sign
      d3SignIndex = (signIndex + 8 + (division * 4)) % 12;
    }

    const d3Sign = ZODIAC_SIGNS[d3SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d3Sign,
      degree: (degreeInSign % 10) * 3, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d3Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D4 (Chaturthamsa) - Property/Fortune chart
 * Verified formula from BPHS: Each sign divided into 7.5° segments, count from same sign
 */
export function calculateD4Chaturthamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 7.5); // 0, 1, 2, or 3

    const d4SignIndex = (signIndex + (division * 3)) % 12;
    const d4Sign = ZODIAC_SIGNS[d4SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d4Sign,
      degree: (degreeInSign % 7.5) * 4, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d4Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D5 (Panchamsa) - Fame/Merit chart
 * Verified formula from BPHS: Each sign divided into 6° segments
 * Odd signs start from Aries, Even signs start from Libra
 */
export function calculateD5Panchamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 6); // 0-4

    let d5SignIndex: number;
    if (isOddSign(planet.sign)) {
      // Odd signs: start from Aries (index 0)
      d5SignIndex = division;
    } else {
      // Even signs: start from Libra (index 6)
      d5SignIndex = 6 + division;
    }

    const d5Sign = ZODIAC_SIGNS[d5SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d5Sign,
      degree: (degreeInSign % 6) * 5, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d5Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D6 (Shashthamsa) - Health/Disease chart
 * Verified formula from BPHS: Each sign divided into 5° segments
 * Odd signs start from Aries, Even signs start from Libra
 */
export function calculateD6Shashthamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 5); // 0-5

    let d6SignIndex: number;
    if (isOddSign(planet.sign)) {
      // Odd signs: start from Aries (index 0)
      d6SignIndex = division;
    } else {
      // Even signs: start from Libra (index 6)
      d6SignIndex = 6 + division;
    }

    const d6Sign = ZODIAC_SIGNS[d6SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d6Sign,
      degree: (degreeInSign % 5) * 6, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d6Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D8 (Ashtamsa) - Longevity/Accidents chart
 * Verified formula from BPHS: Each sign divided into 3.75° segments (8 divisions)
 * Movable signs start from same, Fixed from 9th, Dual from 5th
 * CORRECTED: Sequential progression through signs for each division
 */
export function calculateD8Ashtamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  const fixedSigns = [ZodiacSign.Taurus, ZodiacSign.Leo, ZodiacSign.Scorpio, ZodiacSign.Aquarius];
  
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 3.75); // 0-7

    let d8SignIndex: number;
    if (movableSigns.includes(planet.sign)) {
      // Movable: count sequentially from same sign
      d8SignIndex = (signIndex + division) % 12;
    } else if (fixedSigns.includes(planet.sign)) {
      // Fixed: count sequentially from 9th sign
      d8SignIndex = (signIndex + 8 + division) % 12;
    } else {
      // Dual: count sequentially from 5th sign
      d8SignIndex = (signIndex + 4 + division) % 12;
    }

    const d8Sign = ZODIAC_SIGNS[d8SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d8Sign,
      degree: (degreeInSign % 3.75) * 8, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d8Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D11 (Rudramsa) - Destruction/Gains chart
 * Verified formula from BPHS: Each sign divided into ~2.727° segments (30°/11)
 * Count from same sign
 */
export function calculateD11Rudramsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / (30 / 11)); // 0-10

    const d11SignIndex = (signIndex + division) % 12;
    const d11Sign = ZODIAC_SIGNS[d11SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d11Sign,
      degree: (degreeInSign % (30 / 11)) * 11, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d11Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D20 (Vimsamsa) - Spiritual Progress chart
 * Verified formula from BPHS: Each sign divided into 1.5° segments
 * Movable signs start from Aries, Fixed from Sagittarius, Dual from Leo
 */
export function calculateD20Vimsamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  const fixedSigns = [ZodiacSign.Taurus, ZodiacSign.Leo, ZodiacSign.Scorpio, ZodiacSign.Aquarius];
  
  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 1.5); // 0-19

    let d20SignIndex: number;
    if (movableSigns.includes(planet.sign)) {
      // Movable: start from Aries (index 0)
      d20SignIndex = division % 12;
    } else if (fixedSigns.includes(planet.sign)) {
      // Fixed: start from Sagittarius (index 8)
      d20SignIndex = (8 + division) % 12;
    } else {
      // Dual: start from Leo (index 4)
      d20SignIndex = (4 + division) % 12;
    }

    const d20Sign = ZODIAC_SIGNS[d20SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d20Sign,
      degree: (degreeInSign % 1.5) * 20, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d20Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D27 (Nakshatramsa/Bhamsa) - Strengths/Weaknesses chart
 * Verified formula from BPHS: Each sign divided into ~1.111° segments (30°/27)
 * Fire signs start from Aries, Water from Cancer, Air from Libra, Earth from Capricorn
 */
export function calculateD27Nakshatramsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  const fireSigns = [ZodiacSign.Aries, ZodiacSign.Leo, ZodiacSign.Sagittarius];
  const waterSigns = [ZodiacSign.Cancer, ZodiacSign.Scorpio, ZodiacSign.Pisces];
  const airSigns = [ZodiacSign.Gemini, ZodiacSign.Libra, ZodiacSign.Aquarius];
  
  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / (30 / 27)); // 0-26

    let d27SignIndex: number;
    if (fireSigns.includes(planet.sign)) {
      // Fire: start from Aries (index 0)
      d27SignIndex = division % 12;
    } else if (waterSigns.includes(planet.sign)) {
      // Water: start from Cancer (index 3)
      d27SignIndex = (3 + division) % 12;
    } else if (airSigns.includes(planet.sign)) {
      // Air: start from Libra (index 6)
      d27SignIndex = (6 + division) % 12;
    } else {
      // Earth: start from Capricorn (index 9)
      d27SignIndex = (9 + division) % 12;
    }

    const d27Sign = ZODIAC_SIGNS[d27SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d27Sign,
      degree: (degreeInSign % (30 / 27)) * 27, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d27Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D30 (Trimsamsa) - Misfortunes/Evils chart
 * Verified formula from BPHS: UNEQUAL divisions based on planetary rulership
 * Odd signs: Mars 5°, Saturn 5°, Jupiter 8°, Mercury 7°, Venus 5°
 * Even signs: Venus 5°, Mercury 7°, Jupiter 8°, Saturn 5°, Mars 5°
 */
export function calculateD30Trimsamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  // Unequal division boundaries for odd and even signs
  const oddSignRulers = [
    { planet: Planet.Mars, start: 0, end: 5, sign: ZodiacSign.Aries },
    { planet: Planet.Saturn, start: 5, end: 10, sign: ZodiacSign.Aquarius },
    { planet: Planet.Jupiter, start: 10, end: 18, sign: ZodiacSign.Sagittarius },
    { planet: Planet.Mercury, start: 18, end: 25, sign: ZodiacSign.Gemini },
    { planet: Planet.Venus, start: 25, end: 30, sign: ZodiacSign.Libra },
  ];

  const evenSignRulers = [
    { planet: Planet.Venus, start: 0, end: 5, sign: ZodiacSign.Taurus },
    { planet: Planet.Mercury, start: 5, end: 12, sign: ZodiacSign.Virgo },
    { planet: Planet.Jupiter, start: 12, end: 20, sign: ZodiacSign.Pisces },
    { planet: Planet.Saturn, start: 20, end: 25, sign: ZodiacSign.Capricorn },
    { planet: Planet.Mars, start: 25, end: 30, sign: ZodiacSign.Scorpio },
  ];

  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const rulers = isOddSign(planet.sign) ? oddSignRulers : evenSignRulers;

    let d30Sign = ZodiacSign.Aries;
    for (const ruler of rulers) {
      if (degreeInSign >= ruler.start && degreeInSign < ruler.end) {
        d30Sign = ruler.sign;
        break;
      }
    }

    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d30Sign,
      degree: degreeInSign, // Keep original degree within sign
      dignity: getPlanetaryDignity(planet.planet, d30Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D40 (Khavedamsa) - Auspicious/Inauspicious Effects chart
 * Verified formula from BPHS: Each sign divided into 0.75° segments (45' arc)
 * Movable signs start from Aries, Fixed from Sagittarius, Dual from Leo
 */
export function calculateD40Khavedamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  const fixedSigns = [ZodiacSign.Taurus, ZodiacSign.Leo, ZodiacSign.Scorpio, ZodiacSign.Aquarius];
  
  return planetPositions.map((planet) => {
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 0.75); // 0-39

    let d40SignIndex: number;
    if (movableSigns.includes(planet.sign)) {
      // Movable: start from Aries (index 0)
      d40SignIndex = division % 12;
    } else if (fixedSigns.includes(planet.sign)) {
      // Fixed: start from Sagittarius (index 8)
      d40SignIndex = (8 + division) % 12;
    } else {
      // Dual: start from Leo (index 4)
      d40SignIndex = (4 + division) % 12;
    }

    const d40Sign = ZODIAC_SIGNS[d40SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d40Sign,
      degree: (degreeInSign % 0.75) * 40, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d40Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D45 (Akshavedamsa) - Character/Conduct chart
 * Verified formula from BPHS: Each sign divided into ~0.667° segments (40' arc)
 * Count from same sign for all sign types
 */
export function calculateD45Akshavedamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / (30 / 45)); // 0-44

    const d45SignIndex = (signIndex + division) % 12;
    const d45Sign = ZODIAC_SIGNS[d45SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d45Sign,
      degree: (degreeInSign % (30 / 45)) * 45, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d45Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Calculate D60 (Shashtiamsa) - Past Life Karma/All Effects chart
 * Verified formula from BPHS: Each sign divided into 0.5° segments (30' arc)
 * Most refined divisional chart - cycles through all 12 signs starting from same sign
 */
export function calculateD60Shashtiamsa(
  planetPositions: PlanetPosition[]
): PlanetPosition[] {
  return planetPositions.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    const degreeInSign = planet.longitude % 30;
    const division = Math.floor(degreeInSign / 0.5); // 0-59

    const d60SignIndex = (signIndex + division) % 12;
    const d60Sign = ZODIAC_SIGNS[d60SignIndex];
    const { nakshatra, pada } = getNakshatra(planet.longitude);

    return {
      ...planet,
      sign: d60Sign,
      degree: (degreeInSign % 0.5) * 60, // Scale to 0-30°
      dignity: getPlanetaryDignity(planet.planet, d60Sign),
      nakshatra,
      nakshatraPada: pada,
    };
  });
}

/**
 * Get divisional chart interpretation
 */
export function getDivisionalChartInterpretation(
  chartType: "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D10" | "D11" | "D12" | "D16" | "D20" | "D24" | "D27" | "D30" | "D40" | "D45" | "D60"
): { name: string; purpose: string; keyFactors: string[] } {
  const interpretations = {
    D2: {
      name: "Hora (D2)",
      purpose: "Wealth, finances, and prosperity",
      keyFactors: [
        "Sun hora (Leo) indicates self-earned wealth",
        "Moon hora (Cancer) shows inherited wealth",
        "Benefics in own hora enhance financial gains",
        "2nd and 11th lords strength vital for wealth",
      ],
    },
    D3: {
      name: "Drekkana (D3)",
      purpose: "Siblings, courage, and co-borns",
      keyFactors: [
        "3rd house shows relationships with siblings",
        "Mars indicates courage and initiative",
        "Benefic planets enhance sibling harmony",
        "Strong 3rd lord shows successful siblings",
      ],
    },
    D4: {
      name: "Chaturthamsa (D4)",
      purpose: "Property, fortune, and residence",
      keyFactors: [
        "4th house represents property and land",
        "Moon shows domestic happiness",
        "Venus indicates luxury properties",
        "Strong 4th lord brings property gains",
      ],
    },
    D5: {
      name: "Panchamsa (D5)",
      purpose: "Fame, spiritual merit, and children",
      keyFactors: [
        "Jupiter shows spiritual inclination",
        "5th house indicates intelligence and creativity",
        "Exalted planets bring fame and recognition",
        "Strong benefics enhance merit",
      ],
    },
    D6: {
      name: "Shashthamsa (D6)",
      purpose: "Health, disease, and enemies",
      keyFactors: [
        "6th house shows health challenges",
        "Mars indicates stamina and immunity",
        "Malefic planets show disease tendencies",
        "Strong ascendant lord enhances health",
      ],
    },
    D7: {
      name: "Saptamsa (D7)",
      purpose: "Children, progeny, and creativity",
      keyFactors: [
        "Jupiter's position indicates children's fortune",
        "5th house lord strength shows children prospects",
        "Benefic aspects enhance progeny happiness",
        "Strong 5th house indicates talented children",
      ],
    },
    D8: {
      name: "Ashtamsa (D8)",
      purpose: "Longevity, sudden events, and accidents",
      keyFactors: [
        "8th house shows longevity and transformations",
        "Saturn indicates chronic conditions",
        "Mars shows sudden accidents or injuries",
        "Strong ascendant lord enhances longevity",
      ],
    },
    D10: {
      name: "Dasamsa (D10)",
      purpose: "Career, profession, and achievements",
      keyFactors: [
        "10th house and its lord show career direction",
        "Exalted planets indicate success in that field",
        "Sun's position shows authority and recognition",
        "Saturn's strength indicates longevity of career",
      ],
    },
    D11: {
      name: "Rudramsa (D11)",
      purpose: "Destruction, gains, and unearned income",
      keyFactors: [
        "11th house shows gains and income",
        "Benefics indicate unexpected windfalls",
        "Malefics show losses or destruction",
        "Strong 11th lord brings abundant gains",
      ],
    },
    D12: {
      name: "Dwadasamsa (D12)",
      purpose: "Parents, ancestors, and past life",
      keyFactors: [
        "Sun represents father's fortune",
        "Moon represents mother's well-being",
        "9th house shows paternal lineage",
        "4th house shows maternal lineage",
      ],
    },
    D16: {
      name: "Shodasamsa (D16)",
      purpose: "Vehicles, comforts, and material happiness",
      keyFactors: [
        "Venus indicates luxury and comforts",
        "4th house shows vehicles and property",
        "Strong benefics provide material happiness",
        "Exalted planets indicate prosperity",
      ],
    },
    D20: {
      name: "Vimsamsa (D20)",
      purpose: "Spiritual progress, worship, and devotion",
      keyFactors: [
        "Jupiter shows spiritual wisdom",
        "9th house indicates dharma and devotion",
        "Exalted planets enhance spiritual growth",
        "Strong 12th house shows moksha potential",
      ],
    },
    D24: {
      name: "Chaturvimsamsa (D24)",
      purpose: "Education, learning, and knowledge",
      keyFactors: [
        "Jupiter shows higher education prospects",
        "Mercury indicates analytical and communication skills",
        "5th house shows creative intelligence",
        "Strong 2nd and 4th houses enhance learning",
      ],
    },
    D27: {
      name: "Nakshatramsa/Bhamsa (D27)",
      purpose: "Strengths, weaknesses, and innate nature",
      keyFactors: [
        "Shows inherent strengths and weaknesses",
        "Reveals subtle personality traits",
        "Exalted planets show natural talents",
        "Debilitated planets indicate challenges",
      ],
    },
    D30: {
      name: "Trimsamsa (D30)",
      purpose: "Misfortunes, evils, and past karma",
      keyFactors: [
        "Shows karmic debts and challenges",
        "Malefics indicate specific troubles",
        "6th, 8th, 12th houses show difficulties",
        "Strong benefics provide protection",
      ],
    },
    D40: {
      name: "Khavedamsa (D40)",
      purpose: "Auspicious/inauspicious effects, maternal lineage",
      keyFactors: [
        "Shows maternal family influences",
        "Benefics bring auspicious effects",
        "Malefics indicate challenges from mother's side",
        "4th house lord strength is crucial",
      ],
    },
    D45: {
      name: "Akshavedamsa (D45)",
      purpose: "Character, conduct, and paternal lineage",
      keyFactors: [
        "Shows moral character and ethics",
        "Reveals paternal family influences",
        "Jupiter and Sun indicate righteous conduct",
        "9th house lord shows paternal blessings",
      ],
    },
    D60: {
      name: "Shashtiamsa (D60)",
      purpose: "Past life karma and all effects",
      keyFactors: [
        "Most refined chart showing all karmic effects",
        "Reveals deep-rooted karmic patterns",
        "All planetary placements significant",
        "Used for precise timing and subtle predictions",
      ],
    },
  };

  return interpretations[chartType];
}

/**
 * Calculate houses for divisional chart
 */
export function calculateDivisionalHouses(
  divisionalPositions: PlanetPosition[],
  ascendantSign: ZodiacSign
): HouseData[] {
  const houses: HouseData[] = [];
  const ascendantIndex = ZODIAC_SIGNS.indexOf(ascendantSign);

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const signIndex = (ascendantIndex + i) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const lord = getSignLord(sign);

    const planetsInHouse = divisionalPositions
      .filter((p) => {
        const planetSignIndex = ZODIAC_SIGNS.indexOf(p.sign);
        return planetSignIndex === signIndex;
      })
      .map((p) => p.planet);

    houses.push({
      houseNumber,
      sign,
      signDegree: i * 30,
      lord,
      planetsInHouse,
    });
  }

  return houses;
}

/**
 * Wrapper functions for easier component integration
 */
export interface DivisionalChart {
  chartType: "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D10" | "D11" | "D12" | "D16" | "D20" | "D24" | "D27" | "D30" | "D40" | "D45" | "D60";
  planetPositions: PlanetPosition[];
  ascendant: ZodiacSign;
  houses: HouseData[];
  interpretation: {
    name: string;
    purpose: string;
    keyFactors: string[];
  };
}

// Generate wrapper functions for all divisional charts
export function calculateD2Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD2Hora(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D2",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D2")
  };
}

export function calculateD3Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD3Drekkana(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D3",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D3")
  };
}

export function calculateD4Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD4Chaturthamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D4",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D4")
  };
}

export function calculateD5Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD5Panchamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D5",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D5")
  };
}

export function calculateD6Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD6Shashthamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D6",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D6")
  };
}

export function calculateD8Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD8Ashtamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D8",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D8")
  };
}

export function calculateD11Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD11Rudramsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D11",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D11")
  };
}

export function calculateD20Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD20Vimsamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D20",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D20")
  };
}

export function calculateD27Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD27Nakshatramsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D27",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D27")
  };
}

export function calculateD30Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD30Trimsamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D30",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D30")
  };
}

export function calculateD40Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD40Khavedamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D40",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D40")
  };
}

export function calculateD45Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD45Akshavedamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D45",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D45")
  };
}

export function calculateD60Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD60Shashtiamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D60",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D60")
  };
}

export function calculateD7Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD7Saptamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D7",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D7")
  };
}

export function calculateD10Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD10Dasamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D10",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D10")
  };
}

export function calculateD12Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD12Dwadasamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D12",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D12")
  };
}

export function calculateD16Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD16Shodasamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D16",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D16")
  };
}

export function calculateD24Chart(natalPlanets: PlanetPosition[], ascendantSign: ZodiacSign): DivisionalChart {
  const positions = calculateD24Chaturvimsamsa(natalPlanets);
  const houses = calculateDivisionalHouses(positions, ascendantSign);
  return {
    chartType: "D24",
    planetPositions: positions,
    ascendant: ascendantSign,
    houses,
    interpretation: getDivisionalChartInterpretation("D24")
  };
}

import {
  type PlanetPosition,
  type HouseData,
  type BirthData,
  Planet,
  ZodiacSign,
  Nakshatra,
  PlanetaryDignity,
} from "@shared/astro-schema";
import * as Astronomy from "astronomy-engine";

/**
 * Transit (Gochar) calculations for predictive astrology
 * Calculates current and future planetary positions for forecasting
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
 * Convert date to Julian Day Number
 */
function dateToJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;

  return jd;
}

/**
 * Calculate Lahiri Ayanamsa
 */
function calculateLahiriAyanamsa(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  const base = 23.8565144;
  const linear = 1.3975972;
  const quadratic = 0.000000083;
  const ayanamsa = base + t * linear + t * t * quadratic;
  return ayanamsa;
}

/**
 * Helper function to convert Julian Day to Astronomy.AstroTime
 */
function jdToAstroTime(jd: number): Astronomy.AstroTime {
  const milliseconds = (jd - 2440587.5) * 86400000;
  const date = new Date(milliseconds);
  return Astronomy.MakeTime(date);
}

/**
 * Calculate planet position for a specific date
 */
function calculatePlanetPositionForDate(
  planet: Planet,
  date: Date
): number {
  const jd = dateToJulianDay(date);
  const time = jdToAstroTime(jd);

  let tropicalLongitude: number;

  if (planet === Planet.Sun) {
    const geoSun = Astronomy.GeoVector(Astronomy.Body.Sun, time, false);
    const ecliptic = Astronomy.Ecliptic(geoSun);
    tropicalLongitude = ecliptic.elon;
  } else if (planet === Planet.Moon) {
    const geoMoon = Astronomy.GeoMoon(time);
    const ecliptic = Astronomy.Ecliptic(geoMoon);
    tropicalLongitude = ecliptic.elon;
  } else if (planet === Planet.Rahu || planet === Planet.Ketu) {
    const t = (jd - 2451545.0) / 36525.0;
    const tropicalRahu = (125.0445550 - 1934.1361849 * t + 0.0020762 * t * t) % 360;
    const ayanamsa = calculateLahiriAyanamsa(jd);
    const rahu = (tropicalRahu - ayanamsa + 360) % 360;
    return planet === Planet.Rahu ? rahu : (rahu + 180) % 360;
  } else {
    const bodyMap: Record<string, Astronomy.Body> = {
      [Planet.Mercury]: Astronomy.Body.Mercury,
      [Planet.Venus]: Astronomy.Body.Venus,
      [Planet.Mars]: Astronomy.Body.Mars,
      [Planet.Jupiter]: Astronomy.Body.Jupiter,
      [Planet.Saturn]: Astronomy.Body.Saturn,
    };

    const body = bodyMap[planet];
    if (!body) return 0;

    const geoVector = Astronomy.GeoVector(body, time, false);
    const ecliptic = Astronomy.Ecliptic(geoVector);
    tropicalLongitude = ecliptic.elon;
  }

  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealLongitude = (tropicalLongitude - ayanamsa + 360) % 360;

  return siderealLongitude;
}

/**
 * Get zodiac sign from longitude
 */
function getZodiacSign(longitude: number): ZodiacSign {
  const index = Math.floor(longitude / 30);
  return ZODIAC_SIGNS[index] || ZodiacSign.Aries;
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
 * Calculate Planetary dignity
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

  if (exaltations[planet] === sign) {
    return PlanetaryDignity.Exalted;
  }

  if (debilitations[planet] === sign) {
    return PlanetaryDignity.Debilitated;
  }

  if (ownSigns[planet]?.includes(sign)) {
    return PlanetaryDignity.OwnSign;
  }

  return PlanetaryDignity.NeutralSign;
}

/**
 * Calculate transit positions for a specific date
 */
export function calculateTransitPositions(date: Date): PlanetPosition[] {
  const planets = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
    Planet.Rahu,
    Planet.Ketu,
  ];

  return planets.map((planet) => {
    const longitude = calculatePlanetPositionForDate(planet, date);
    const sign = getZodiacSign(longitude);
    const degree = longitude % 30;
    const { nakshatra, pada } = getNakshatra(longitude);
    const dignity = getPlanetaryDignity(planet, sign);

    return {
      planet,
      longitude,
      sign,
      degree,
      house: 1,
      nakshatra,
      nakshatraPada: pada,
      isRetrograde: false,
      isCombust: false,
      dignity,
      speed: 0,
    };
  });
}

/**
 * Calculate transit effects relative to natal chart
 */
export interface TransitEffect {
  transitPlanet: Planet;
  transitHouse: number;
  natalHouse: number;
  aspect: string;
  strength: "strong" | "moderate" | "weak";
  description: string;
  effects: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get transit effects for a specific date
 */
export function getTransitEffects(
  transitDate: Date,
  natalChart: {
    planetPositions: PlanetPosition[];
    houses: HouseData[];
    ascendantSign: ZodiacSign;
  }
): TransitEffect[] {
  const effects: TransitEffect[] = [];
  const transitPositions = calculateTransitPositions(transitDate);

  const ascendantIndex = ZODIAC_SIGNS.indexOf(natalChart.ascendantSign);

  for (const transitPlanet of transitPositions) {
    const signIndex = ZODIAC_SIGNS.indexOf(transitPlanet.sign);
    const transitHouse = ((signIndex - ascendantIndex + 12) % 12) + 1;

    const natalPosition = natalChart.planetPositions.find(
      (p) => p.planet === transitPlanet.planet
    );
    const natalHouse = natalPosition?.house || 1;

    effects.push({
      transitPlanet: transitPlanet.planet,
      transitHouse,
      natalHouse,
      aspect: "conjunction",
      strength: transitPlanet.dignity === PlanetaryDignity.Exalted ? "strong" : "moderate",
      description: `${transitPlanet.planet} is transiting through the ${transitHouse}${getOrdinalSuffix(transitHouse)} house in ${transitPlanet.sign}`,
      effects: getTransitInterpretation(transitPlanet.planet, transitHouse),
    });
  }

  const moonTransit = transitPositions.find((p) => p.planet === Planet.Moon);
  const saturnTransit = transitPositions.find((p) => p.planet === Planet.Saturn);
  
  if (moonTransit && saturnTransit) {
    const natalMoon = natalChart.planetPositions.find((p) => p.planet === Planet.Moon);
    if (natalMoon) {
      const moonSignIndex = ZODIAC_SIGNS.indexOf(natalMoon.sign);
      const saturnSignIndex = ZODIAC_SIGNS.indexOf(saturnTransit.sign);
      const houseDiff = ((saturnSignIndex - moonSignIndex + 12) % 12) + 1;

      // Sade Sati: Saturn in 12th, 1st, or 2nd from natal Moon sign
      // This is a 7.5 year period (2.5 years in each of the 3 signs)
      // Source: Classical Vedic Astrology texts, verified via multiple authoritative sources
      if ([12, 1, 2].includes(houseDiff)) {
        let phase = "";
        let phaseDescription = "";
        
        if (houseDiff === 12) {
          phase = "Rising Phase";
          phaseDescription = "Saturn in 12th from natal Moon - Rising Phase (1st of 3 phases)";
        } else if (houseDiff === 1) {
          phase = "Peak Phase";
          phaseDescription = "Saturn transiting over natal Moon - Peak Phase (2nd of 3 phases, most intense)";
        } else if (houseDiff === 2) {
          phase = "Setting Phase";
          phaseDescription = "Saturn in 2nd from natal Moon - Setting Phase (3rd of 3 phases)";
        }
        
        effects.push({
          transitPlanet: Planet.Saturn,
          transitHouse: ((saturnSignIndex - ascendantIndex + 12) % 12) + 1,
          natalHouse: natalMoon.house,
          aspect: `Sade Sati (${phase})`,
          strength: "strong",
          description: phaseDescription,
          effects: "7.5-year period of challenges, discipline, and karmic lessons. Focus on patience, hard work, and spiritual growth. Results depend on past actions and Saturn's strength in the chart.",
        });
      }

      // Artha Ashtama Shani (also called Kantaka Shani): Saturn in 4th from natal Moon
      // This is a separate 2.5 year difficult period
      // Source: Classical Vedic Astrology, verified via authoritative sources
      if (houseDiff === 4) {
        effects.push({
          transitPlanet: Planet.Saturn,
          transitHouse: ((saturnSignIndex - ascendantIndex + 12) % 12) + 1,
          natalHouse: natalMoon.house,
          aspect: "Artha Ashtama Shani (Kantaka Shani)",
          strength: "strong",
          description: "Saturn in 4th from natal Moon - Artha Ashtama Shani (half of 8th house effect)",
          effects: "2.5-year challenging period affecting domestic life, home, property, vehicles, mental peace, relationship with mother. Brings responsibilities and restrictions at home. Practice patience and maintain discipline.",
        });
      }

      // Ashtama Shani: Saturn in 8th from natal Moon
      // This is considered the most difficult Saturn transit (2.5 years)
      // Source: Classical Vedic Astrology, verified via authoritative sources
      if (houseDiff === 8) {
        effects.push({
          transitPlanet: Planet.Saturn,
          transitHouse: ((saturnSignIndex - ascendantIndex + 12) % 12) + 1,
          natalHouse: natalMoon.house,
          aspect: "Ashtama Shani",
          strength: "strong",
          description: "Saturn in 8th from natal Moon - Ashtama Shani (most challenging transit)",
          effects: "2.5-year highly transformative period. May bring sudden changes, unexpected events, health concerns, financial challenges, and karmic lessons. Saturn aspects 10th (career), 2nd (finances), and 5th (children) from here. Focus on spiritual practices, honesty, and helping others. This too shall pass.",
        });
      }
    }
  }

  return effects;
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
 * Get transit interpretation
 */
function getTransitInterpretation(planet: Planet, house: number): string {
  const interpretations: Record<string, Record<number, string>> = {
    [Planet.Jupiter]: {
      1: "Enhances personality, optimism, and new opportunities for personal growth.",
      2: "Brings financial gains, increase in resources, and family happiness.",
      3: "Improves communication, courage, and support from siblings.",
      4: "Provides domestic happiness, property gains, and emotional well-being.",
      5: "Blesses with children, creativity, intelligence, and speculative gains.",
      6: "Helps overcome obstacles, debts, and health issues.",
      7: "Benefits marriage, partnerships, and business relationships.",
      8: "Brings sudden gains, interest in occult, and transformation.",
      9: "Enhances fortune, spirituality, father's well-being, and foreign travel.",
      10: "Career advancement, recognition, and professional success.",
      11: "Fulfillment of desires, gains from friends, and increased income.",
      12: "Spiritual growth, foreign connections, and charitable activities.",
    },
    [Planet.Saturn]: {
      1: "Demands discipline, hard work, and patience in personal matters.",
      2: "Financial challenges requiring careful planning and savings.",
      3: "Tests courage, may bring challenges with siblings or communication.",
      4: "Responsibilities in home, property matters, and emotional stability.",
      5: "Delays in creativity, children matters require patience.",
      6: "Can actually be beneficial - helps overcome enemies and debts through hard work.",
      7: "Delays or responsibilities in marriage and partnerships.",
      8: "Transformative period with lessons in letting go and spiritual growth.",
      9: "Tests faith, may restrict travel, demands spiritual discipline.",
      10: "Career pressures, increased responsibilities, long-term success through perseverance.",
      11: "Delayed fulfillment of desires, but steady progress with effort.",
      12: "Period of introspection, spiritual discipline, and karmic cleansing.",
    },
    [Planet.Sun]: {
      1: "Boosts confidence, vitality, and leadership qualities.",
      2: "Focuses on financial matters and family leadership.",
      3: "Enhances courage, communication, and personal initiative.",
      4: "Brings attention to home, property, and emotional well-being.",
      5: "Activates creativity, romance, and matters related to children.",
      6: "Helps overcome obstacles and health issues with determination.",
      7: "Highlights partnerships, marriage, and public relations.",
      8: "Brings transformation, research abilities, and hidden matters to light.",
      9: "Enhances fortune, spirituality, and father's influence.",
      10: "Career focus, authority, recognition, and professional achievements.",
      11: "Social connections, gains, and fulfillment of ambitions.",
      12: "Foreign connections, expenses, and spiritual pursuits.",
    },
  };

  return interpretations[planet]?.[house] || "Brings changes and influences in this area of life.";
}

/**
 * Calculate future transit timeline
 */
export interface TransitEvent {
  planet: Planet;
  eventType: "sign_change" | "retrograde_start" | "retrograde_end" | "direct";
  date: Date;
  fromSign?: ZodiacSign;
  toSign: ZodiacSign;
  description: string;
}

/**
 * Get upcoming transit events for next N days
 */
export function getUpcomingTransits(
  startDate: Date,
  days: number = 90
): TransitEvent[] {
  const events: TransitEvent[] = [];
  const planets = [Planet.Jupiter, Planet.Saturn, Planet.Mars];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    for (const planet of planets) {
      const currentPosition = calculatePlanetPositionForDate(planet, date);
      const currentSign = getZodiacSign(currentPosition);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextPosition = calculatePlanetPositionForDate(planet, nextDate);
      const nextSign = getZodiacSign(nextPosition);

      if (currentSign !== nextSign) {
        events.push({
          planet,
          eventType: "sign_change",
          date: nextDate,
          fromSign: currentSign,
          toSign: nextSign,
          description: `${planet} enters ${nextSign}`,
        });
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate current transits with full analysis
 */
export function calculateCurrentTransits(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number,
  natalPlanets: PlanetPosition[],
  ascendantSign: ZodiacSign
) {
  const positions = calculateTransitPositions(date);
  
  // Map transit positions to include currentSign and currentHouse for UI display
  const positionsWithHouses = positions.map(p => {
    const ascendantIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
    const signIndex = ZODIAC_SIGNS.indexOf(p.sign);
    const currentHouse = ((signIndex - ascendantIndex + 12) % 12) + 1;
    
    return {
      ...p,
      currentSign: p.sign,
      currentHouse,
      degree: p.degree
    };
  });
  
  const effects = getTransitEffects(
    date,
    {
      planetPositions: natalPlanets,
      houses: [], // Houses not needed for basic transit calculation
      ascendantSign
    }
  );

  return {
    positions: positionsWithHouses,
    effects,
    date
  };
}

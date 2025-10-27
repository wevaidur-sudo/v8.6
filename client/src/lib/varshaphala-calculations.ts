import {
  type BirthData,
  type PlanetPosition,
  type HouseData,
  Planet,
  ZodiacSign,
  Nakshatra,
  PlanetaryDignity,
} from "@shared/astro-schema";
import * as Astronomy from "astronomy-engine";

/**
 * Varṣaphala (Annual/Solar Return Chart) Calculations
 * Cast for the moment when Sun returns to exact natal position each year
 * Provides yearly predictions and themes
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
 * Calculate Sun's position
 */
function calculateSunPosition(jd: number): number {
  const time = jdToAstroTime(jd);
  const geoSun = Astronomy.GeoVector(Astronomy.Body.Sun, time, false);
  const ecliptic = Astronomy.Ecliptic(geoSun);
  const tropicalLongitude = ecliptic.elon;
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealLongitude = (tropicalLongitude - ayanamsa + 360) % 360;
  return siderealLongitude;
}

/**
 * Find Solar Return date (when Sun returns to natal position)
 */
export function findSolarReturnDate(
  birthData: BirthData,
  targetYear: number,
  natalSunLongitude: number
): Date {
  const birthDate = new Date(birthData.dateOfBirth);
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  let searchDate = new Date(targetYear, birthMonth, birthDay, 12, 0, 0);

  for (let dayOffset = -2; dayOffset <= 2; dayOffset++) {
    const testDate = new Date(searchDate);
    testDate.setDate(testDate.getDate() + dayOffset);

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const checkDate = new Date(testDate);
        checkDate.setHours(hour, minute, 0, 0);

        const jd = dateToJulianDay(checkDate);
        const sunLong = calculateSunPosition(jd);

        const diff = Math.abs(sunLong - natalSunLongitude);
        const normalizedDiff = diff > 180 ? 360 - diff : diff;

        if (normalizedDiff < 0.1) {
          return checkDate;
        }
      }
    }
  }

  return searchDate;
}

/**
 * Calculate planetary positions for a specific date
 */
function calculatePlanetPositionForDate(
  planet: Planet,
  date: Date
): number {
  const jd = dateToJulianDay(date);
  const time = jdToAstroTime(jd);

  let tropicalLongitude: number;

  if (planet === Planet.Sun) {
    return calculateSunPosition(jd);
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
 * Calculate Ascendant for Solar Return
 */
function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number
): { ascendant: number; ascendantSign: ZodiacSign } {
  const [hours, minutes] = [date.getHours(), date.getMinutes()];
  const localTime = hours + minutes / 60;
  const ut = localTime - timezone;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y_jd = year + 4800 - a;
  const m_jd = month + 12 * a - 3;

  const jd_noon =
    day +
    Math.floor((153 * m_jd + 2) / 5) +
    365 * y_jd +
    Math.floor(y_jd / 4) -
    Math.floor(y_jd / 100) +
    Math.floor(y_jd / 400) -
    32045;
  const jd = jd_noon + (ut - 12) / 24;

  const jd_midnight = Math.floor(jd + 0.5) - 0.5;

  const t = (jd - 2451545.0) / 36525.0;
  const t0 = (jd_midnight - 2451545.0) / 36525.0;

  const gmst0 =
    280.46061837 +
    360.98564736629 * (jd_midnight - 2451545.0) +
    0.000387933 * t0 * t0 -
    (t0 * t0 * t0) / 38710000;

  const hours_since_midnight = (jd - jd_midnight) * 24;
  const gmst = gmst0 + 15.04106864 * hours_since_midnight;

  const lst = (gmst + longitude + 360) % 360;

  const epsilon =
    23.439291 - 0.0130042 * t - 0.00000164 * t * t + 0.000000504 * t * t * t;

  const latRad = latitude * (Math.PI / 180);
  const lstRad = lst * (Math.PI / 180);
  const epsRad = epsilon * (Math.PI / 180);

  const y = Math.cos(lstRad);
  const x =
    -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let tropicalAscendant = Math.atan2(y, x) * (180 / Math.PI);
  tropicalAscendant = (tropicalAscendant + 360) % 360;

  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealAscendant = (tropicalAscendant - ayanamsa + 360) % 360;

  const ascendantSign = ZODIAC_SIGNS[Math.floor(siderealAscendant / 30)];

  return { ascendant: siderealAscendant, ascendantSign };
}

/**
 * Get planetary dignity
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
 * Calculate Annual Chart
 */
export interface AnnualChart {
  year: number;
  solarReturnDate: Date;
  ascendant: number;
  ascendantSign: ZodiacSign;
  planetPositions: PlanetPosition[];
  houses: HouseData[];
  yearlyTheme: string;
  predictions: string[];
}

/**
 * Get Annual Chart for a specific year
 */
export function calculateAnnualChart(
  birthData: BirthData,
  targetYear: number,
  natalSunLongitude: number
): AnnualChart {
  const solarReturnDate = findSolarReturnDate(
    birthData,
    targetYear,
    natalSunLongitude
  );

  const { ascendant, ascendantSign } = calculateAscendant(
    solarReturnDate,
    birthData.latitude,
    birthData.longitude,
    birthData.timezone
  );

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

  const planetPositions: PlanetPosition[] = planets.map((planet) => {
    const longitude = calculatePlanetPositionForDate(planet, solarReturnDate);
    const sign = getZodiacSign(longitude);
    const degree = longitude % 30;
    const { nakshatra, pada } = getNakshatra(longitude);
    const dignity = getPlanetaryDignity(planet, sign);

    const ascendantIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
    const signIndex = ZODIAC_SIGNS.indexOf(sign);
    const house = ((signIndex - ascendantIndex + 12) % 12) + 1;

    return {
      planet,
      longitude,
      sign,
      degree,
      house,
      nakshatra,
      nakshatraPada: pada,
      isRetrograde: false,
      isCombust: false,
      dignity,
      speed: 0,
    };
  });

  const houses: HouseData[] = [];
  const ascendantIndex = ZODIAC_SIGNS.indexOf(ascendantSign);

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const signIndex = (ascendantIndex + i) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const lord = getSignLord(sign);

    const planetsInHouse = planetPositions
      .filter((p) => p.house === houseNumber)
      .map((p) => p.planet);

    houses.push({
      houseNumber,
      sign,
      signDegree: i * 30,
      lord,
      planetsInHouse,
    });
  }

  const yearlyTheme = getAnnualChartTheme(planetPositions, houses, ascendantSign);
  const predictions = getAnnualPredictions(planetPositions, houses);

  return {
    year: targetYear,
    solarReturnDate,
    ascendant,
    ascendantSign,
    planetPositions,
    houses,
    yearlyTheme,
    predictions,
  };
}

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
 * Get annual chart theme
 */
function getAnnualChartTheme(
  planetPositions: PlanetPosition[],
  houses: HouseData[],
  ascendantSign: ZodiacSign
): string {
  const firstHousePlanets = planetPositions.filter((p) => p.house === 1);

  if (firstHousePlanets.length > 0) {
    return `Year of personal transformation and new beginnings with ${firstHousePlanets.map((p) => p.planet).join(", ")} in the 1st house.`;
  }

  const tenthHousePlanets = planetPositions.filter((p) => p.house === 10);
  if (tenthHousePlanets.length > 0) {
    return `Career-focused year with ${tenthHousePlanets.map((p) => p.planet).join(", ")} in the 10th house.`;
  }

  return `Year governed by ${ascendantSign} ascendant, bringing focus to self-development and personal growth.`;
}

/**
 * Get annual predictions
 */
function getAnnualPredictions(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): string[] {
  const predictions: string[] = [];

  const jupiter = planetPositions.find((p) => p.planet === Planet.Jupiter);
  if (jupiter) {
    predictions.push(
      `Jupiter in ${jupiter.house}${getOrdinalSuffix(jupiter.house)} house brings growth and opportunities in ${getHouseTheme(jupiter.house)}.`
    );
  }

  const saturn = planetPositions.find((p) => p.planet === Planet.Saturn);
  if (saturn) {
    predictions.push(
      `Saturn in ${saturn.house}${getOrdinalSuffix(saturn.house)} house demands discipline and responsibility in ${getHouseTheme(saturn.house)}.`
    );
  }

  return predictions;
}

/**
 * Get house theme
 */
function getHouseTheme(house: number): string {
  const themes: Record<number, string> = {
    1: "personality and self-expression",
    2: "wealth and family matters",
    3: "communication and courage",
    4: "home and emotional well-being",
    5: "creativity and children",
    6: "health and service",
    7: "partnerships and marriage",
    8: "transformation and occult",
    9: "fortune and spirituality",
    10: "career and public image",
    11: "gains and social networks",
    12: "spirituality and expenses",
  };
  return themes[house] || "life areas";
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

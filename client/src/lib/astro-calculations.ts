import {
  type BirthData,
  type PlanetPosition,
  type HouseData,
  type ShadbalaStrength,
  Planet,
  ZodiacSign,
  Nakshatra,
  PlanetaryDignity,
} from "@shared/astro-schema";
import * as Astronomy from "astronomy-engine";

/**
 * Core astronomical calculations for Vedic astrology
 * Based on classical formulas from BPHS and modern astronomical algorithms
 * Uses astronomy-engine library for accurate VSOP87-based planetary positions
 */

// Zodiac signs in order
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

// Nakshatras in order (27 lunar mansions)
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
 * Calculate Lahiri Ayanamsa using Swiss Ephemeris constants
 * Official formula adopted by the Government of India Calendar Reform Committee
 * Based on Lahiri's calculations with Spica at 180° (exactly opposite to 0° Aries)
 */
function calculateLahiriAyanamsa(jd: number): number {
  // Julian centuries from J2000.0 (TT)
  const t = (jd - 2451545.0) / 36525.0;

  // Lahiri ayanamsa using official constants (most accurate)
  // Base value at J2000.0: 23°51'23.4520" = 23.8565144°
  // Linear coefficient: 1°23'51.4481"/century = 1.3975972°/century  
  // Quadratic coefficient: 0°0'0.0003"/century² = 0.000000083°/century²
  
  const base = 23.8565144; // 23°51'23.4520" at J2000.0 (official Lahiri value)
  const linear = 1.3975972; // 1°23'51.4481" per Julian century
  const quadratic = 0.000000083; // 0°0'0.0003" per Julian century squared

  const ayanamsa = base + t * linear + t * t * quadratic;

  return ayanamsa;
}

/**
 * Calculate Sun's position using astronomy-engine (VSOP87-based)
 */
function calculateSunPosition(jd: number): number {
  // Convert JD to AstroTime for astronomy-engine
  const time = jdToAstroTime(jd);
  
  // Get Sun's geocentric position
  const geoSun = Astronomy.GeoVector(Astronomy.Body.Sun, time, false);
  
  // Convert to ecliptic coordinates
  const ecliptic = Astronomy.Ecliptic(geoSun);
  
  // Ecliptic longitude is in degrees (tropical)
  const tropicalLongitude = ecliptic.elon;

  // Apply Lahiri ayanamsa to convert to sidereal
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealLongitude = (tropicalLongitude - ayanamsa + 360) % 360;

  return siderealLongitude;
}

/**
 * Helper function to convert Julian Day to Astronomy.AstroTime
 */
function jdToAstroTime(jd: number): Astronomy.AstroTime {
  // Convert JD to Date first
  // JD 0 = January 1, 4713 BC at noon
  // JavaScript Date epoch = January 1, 1970 at midnight (JD 2440587.5)
  const milliseconds = (jd - 2440587.5) * 86400000;
  const date = new Date(milliseconds);
  
  // Convert Date to AstroTime (astronomy-engine requirement)
  return Astronomy.MakeTime(date);
}

/**
 * Calculate Moon's position using astronomy-engine (ELP2000-based)
 */
function calculateMoonPosition(jd: number): number {
  // Convert JD to AstroTime for astronomy-engine
  const time = jdToAstroTime(jd);
  
  // Get Moon's geocentric ecliptic coordinates
  const geoMoon = Astronomy.GeoMoon(time);
  const ecliptic = Astronomy.Ecliptic(geoMoon);
  
  // Ecliptic longitude is in degrees (tropical)
  const tropicalLongitude = ecliptic.elon;

  // Apply Lahiri ayanamsa
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealLongitude = (tropicalLongitude - ayanamsa + 360) % 360;

  return siderealLongitude;
}

/**
 * Calculate planetary positions using astronomy-engine (VSOP87-based)
 * Provides accurate positions for all planets
 */
function calculatePlanetPosition(
  planet: Planet,
  jd: number
): number {
  if (planet === Planet.Sun) {
    return calculateSunPosition(jd);
  } else if (planet === Planet.Moon) {
    return calculateMoonPosition(jd);
  }

  // Convert JD to AstroTime for astronomy-engine
  const time = jdToAstroTime(jd);

  // Map our planet enum to astronomy-engine body names
  const bodyMap: Record<string, Astronomy.Body> = {
    [Planet.Mercury]: Astronomy.Body.Mercury,
    [Planet.Venus]: Astronomy.Body.Venus,
    [Planet.Mars]: Astronomy.Body.Mars,
    [Planet.Jupiter]: Astronomy.Body.Jupiter,
    [Planet.Saturn]: Astronomy.Body.Saturn,
  };

  const body = bodyMap[planet];
  if (!body) return 0;

  // Get geocentric position of planet
  const geoVector = Astronomy.GeoVector(body, time, false);
  
  // Convert to ecliptic coordinates
  const ecliptic = Astronomy.Ecliptic(geoVector);
  
  // Ecliptic longitude is in degrees (tropical)
  const tropicalLongitude = ecliptic.elon;

  // Apply Lahiri ayanamsa to convert to sidereal
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealLongitude = (tropicalLongitude - ayanamsa + 360) % 360;

  return siderealLongitude;
}

/**
 * Calculate Rahu and Ketu (North and South lunar nodes)
 * Rahu is the ascending node, Ketu is 180° opposite
 */
function calculateNodalPositions(jd: number): {
  rahu: number;
  ketu: number;
} {
  const t = (jd - 2451545.0) / 36525.0; // Julian centuries

  // Mean longitude of ascending node (tropical)
  // Formula based on Jean Meeus "Astronomical Algorithms"
  const tropicalRahu = (125.0445550 - 1934.1361849 * t + 0.0020762 * t * t) % 360;

  // Apply Lahiri ayanamsa to convert to sidereal
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const rahu = (tropicalRahu - ayanamsa + 360) % 360;
  const ketu = (rahu + 180) % 360;

  return { rahu, ketu };
}

/**
 * Calculate Ascendant (Lagna) from birth time and location
 * Uses proper sidereal time calculation without double-counting UT
 */
export function calculateAscendant(
  birthData: BirthData
): { ascendant: number; ascendantSign: ZodiacSign } {
  // Parse birth date and time
  const dateStr = birthData.dateOfBirth;
  const timeStr = birthData.timeOfBirth;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Calculate UT from local time (subtract timezone offset)
  const localTime = hours + minutes / 60;
  const ut = localTime - birthData.timezone;

  // Calculate full JD for the birth moment
  const a = Math.floor((14 - month) / 12);
  const y_jd = year + 4800 - a;
  const m_jd = month + 12 * a - 3;
  
  const jd_noon = day + Math.floor((153 * m_jd + 2) / 5) + 365 * y_jd + Math.floor(y_jd / 4) - Math.floor(y_jd / 100) + Math.floor(y_jd / 400) - 32045;
  const jd = jd_noon + (ut - 12) / 24; // Full JD including time (subtract 12 because JD starts at noon)

  // Calculate true midnight JD (0h UT) using Meeus approach
  const jd_midnight = Math.floor(jd + 0.5) - 0.5;

  const t = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0 for obliquity
  const t0 = (jd_midnight - 2451545.0) / 36525.0; // Julian centuries from J2000.0 for GMST at 0h

  // Calculate Greenwich Mean Sidereal Time at 0h UT using Meeus Eq. 12.4
  const gmst0 = 280.46061837 + 360.98564736629 * (jd_midnight - 2451545.0) + 0.000387933 * t0 * t0 - t0 * t0 * t0 / 38710000;

  // Add the time elapsed since 0h UT (in degrees, 1 hour = 15.04106864°)
  const hours_since_midnight = (jd - jd_midnight) * 24; // Hours elapsed since midnight
  const gmst = gmst0 + 15.04106864 * hours_since_midnight;

  // Calculate Local Sidereal Time
  const lst = (gmst + birthData.longitude + 360) % 360;

  // Calculate obliquity of the ecliptic
  const epsilon = 23.439291 - 0.0130042 * t - 0.00000164 * t * t + 0.000000504 * t * t * t;

  // Calculate Ascendant using proper spherical trigonometry
  const latRad = birthData.latitude * (Math.PI / 180);
  const lstRad = lst * (Math.PI / 180);
  const epsRad = epsilon * (Math.PI / 180);

  // Tropical ascendant calculation
  const y = Math.cos(lstRad);
  const x = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let tropicalAscendant = Math.atan2(y, x) * (180 / Math.PI);
  tropicalAscendant = (tropicalAscendant + 360) % 360;

  // Apply Lahiri ayanamsa to convert to sidereal
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const siderealAscendant = (tropicalAscendant - ayanamsa + 360) % 360;

  const ascendantSign = ZODIAC_SIGNS[Math.floor(siderealAscendant / 30)];

  return { ascendant: siderealAscendant, ascendantSign };
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
 * Determine planetary dignity
 */
function getPlanetaryDignity(
  planet: Planet,
  sign: ZodiacSign
): PlanetaryDignity {
  // Exaltation points
  const exaltations: Record<string, ZodiacSign> = {
    [Planet.Sun]: ZodiacSign.Aries,
    [Planet.Moon]: ZodiacSign.Taurus,
    [Planet.Mars]: ZodiacSign.Capricorn,
    [Planet.Mercury]: ZodiacSign.Virgo,
    [Planet.Jupiter]: ZodiacSign.Cancer,
    [Planet.Venus]: ZodiacSign.Pisces,
    [Planet.Saturn]: ZodiacSign.Libra,
  };

  // Debilitation points (opposite of exaltation)
  const debilitations: Record<string, ZodiacSign> = {
    [Planet.Sun]: ZodiacSign.Libra,
    [Planet.Moon]: ZodiacSign.Scorpio,
    [Planet.Mars]: ZodiacSign.Cancer,
    [Planet.Mercury]: ZodiacSign.Pisces,
    [Planet.Jupiter]: ZodiacSign.Capricorn,
    [Planet.Venus]: ZodiacSign.Virgo,
    [Planet.Saturn]: ZodiacSign.Aries,
  };

  // Own signs
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
 * Check if planet is combust (too close to Sun)
 */
function isCombust(planet: Planet, planetLongitude: number, sunLongitude: number): boolean {
  if (planet === Planet.Sun || planet === Planet.Rahu || planet === Planet.Ketu) {
    return false;
  }

  const combustionDistances: Record<string, number> = {
    [Planet.Moon]: 12,
    [Planet.Mars]: 17,
    [Planet.Mercury]: 14,
    [Planet.Jupiter]: 11,
    [Planet.Venus]: 10,
    [Planet.Saturn]: 15,
  };

  const distance = combustionDistances[planet] || 0;
  const angularDistance = Math.abs(planetLongitude - sunLongitude);
  const normalizedDistance = Math.min(angularDistance, 360 - angularDistance);

  return normalizedDistance < distance;
}

/**
 * Calculate all planetary positions for a birth chart
 */
export function calculatePlanetaryPositions(
  birthData: BirthData
): PlanetPosition[] {
  const date = new Date(`${birthData.dateOfBirth}T${birthData.timeOfBirth}`);
  const jd = dateToJulianDay(date);

  const { ascendant, ascendantSign } = calculateAscendant(birthData);
  const sunLongitude = calculatePlanetPosition(Planet.Sun, jd);
  const nodalPositions = calculateNodalPositions(jd);

  const planets: Planet[] = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  const positions: PlanetPosition[] = [];

  // Calculate positions for each planet
  for (const planet of planets) {
    const longitude = calculatePlanetPosition(planet, jd);
    const sign = getZodiacSign(longitude);
    const degree = longitude % 30;
    const { nakshatra, pada } = getNakshatra(longitude);
    
    // Calculate house (Whole Sign House system)
    const ascendantSignIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
    const planetSignIndex = ZODIAC_SIGNS.indexOf(sign);
    let house = ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;

    const dignity = getPlanetaryDignity(planet, sign);
    const combust = isCombust(planet, longitude, sunLongitude);

    positions.push({
      planet,
      longitude,
      sign,
      degree,
      house,
      nakshatra,
      nakshatraPada: pada,
      isRetrograde: false, // Simplified - requires velocity calculation
      isCombust: combust,
      dignity,
      speed: 0, // Simplified
    });
  }

  // Add Rahu
  const rahuSign = getZodiacSign(nodalPositions.rahu);
  const rahuSignIndex = ZODIAC_SIGNS.indexOf(rahuSign);
  const ascendantSignIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
  const rahuHouse = ((rahuSignIndex - ascendantSignIndex + 12) % 12) + 1;
  const rahuNakshatra = getNakshatra(nodalPositions.rahu);

  positions.push({
    planet: Planet.Rahu,
    longitude: nodalPositions.rahu,
    sign: rahuSign,
    degree: nodalPositions.rahu % 30,
    house: rahuHouse,
    nakshatra: rahuNakshatra.nakshatra,
    nakshatraPada: rahuNakshatra.pada,
    isRetrograde: true, // Rahu always retrograde
    isCombust: false,
    dignity: PlanetaryDignity.NeutralSign,
    speed: -0.05,
  });

  // Add Ketu
  const ketuSign = getZodiacSign(nodalPositions.ketu);
  const ketuSignIndex = ZODIAC_SIGNS.indexOf(ketuSign);
  const ketuHouse = ((ketuSignIndex - ascendantSignIndex + 12) % 12) + 1;
  const ketuNakshatra = getNakshatra(nodalPositions.ketu);

  positions.push({
    planet: Planet.Ketu,
    longitude: nodalPositions.ketu,
    sign: ketuSign,
    degree: nodalPositions.ketu % 30,
    house: ketuHouse,
    nakshatra: ketuNakshatra.nakshatra,
    nakshatraPada: ketuNakshatra.pada,
    isRetrograde: true, // Ketu always retrograde
    isCombust: false,
    dignity: PlanetaryDignity.NeutralSign,
    speed: -0.05,
  });

  // Add Ascendant as a reference point
  const ascNakshatra = getNakshatra(ascendant);
  positions.push({
    planet: Planet.Ascendant,
    longitude: ascendant,
    sign: ascendantSign,
    degree: ascendant % 30,
    house: 1,
    nakshatra: ascNakshatra.nakshatra,
    nakshatraPada: ascNakshatra.pada,
    isRetrograde: false,
    isCombust: false,
    dignity: PlanetaryDignity.NeutralSign,
    speed: 0,
  });

  return positions;
}

/**
 * Calculate house data
 */
export function calculateHouses(
  planetPositions: PlanetPosition[],
  ascendantSign: ZodiacSign
): HouseData[] {
  const houses: HouseData[] = [];
  const ascendantIndex = ZODIAC_SIGNS.indexOf(ascendantSign);

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const signIndex = (ascendantIndex + i) % 12;
    const sign = ZODIAC_SIGNS[signIndex];

    // Find planets in this house
    const planetsInHouse = planetPositions
      .filter(p => p.house === houseNumber && p.planet !== Planet.Ascendant)
      .map(p => p.planet);

    // Determine house lord (ruler of the sign)
    const lord = getSignLord(sign);

    houses.push({
      houseNumber,
      sign,
      signDegree: signIndex * 30,
      lord,
      planetsInHouse,
    });
  }

  return houses;
}

/**
 * Get the lord (ruler) of a zodiac sign
 */
function getSignLord(sign: ZodiacSign): Planet {
  const lordship: Record<ZodiacSign, Planet> = {
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

  return lordship[sign];
}

/**
 * Calculate Shadbala (Six-fold strength) for planets
 */
export function calculateShadbala(
  planetPositions: PlanetPosition[]
): ShadbalaStrength[] {
  const strengths: ShadbalaStrength[] = [];

  const minRequirements: Record<string, number> = {
    [Planet.Sun]: 390,
    [Planet.Moon]: 360,
    [Planet.Mars]: 300,
    [Planet.Mercury]: 420,
    [Planet.Jupiter]: 390,
    [Planet.Venus]: 330,
    [Planet.Saturn]: 300,
  };

  for (const planetPos of planetPositions) {
    if (
      planetPos.planet === Planet.Ascendant ||
      planetPos.planet === Planet.Rahu ||
      planetPos.planet === Planet.Ketu
    ) {
      continue;
    }

    // Simplified Shadbala calculation
    let sthanaBala = 0;
    let digBala = 0;
    let kalaBala = 100;
    let chestaBala = 100;
    let naisargikaBala = 100;
    let drikBala = 0;

    // Sthana Bala (Positional strength)
    switch (planetPos.dignity) {
      case PlanetaryDignity.Exalted:
        sthanaBala = 200;
        break;
      case PlanetaryDignity.OwnSign:
        sthanaBala = 150;
        break;
      case PlanetaryDignity.Moolatrikona:
        sthanaBala = 180;
        break;
      case PlanetaryDignity.FriendlySign:
        sthanaBala = 100;
        break;
      case PlanetaryDignity.Debilitated:
        sthanaBala = 30;
        break;
      default:
        sthanaBala = 70;
    }

    // Dig Bala (Directional strength) - simplified
    const directionHouses: Record<string, number[]> = {
      [Planet.Sun]: [10],
      [Planet.Moon]: [4],
      [Planet.Mars]: [10],
      [Planet.Mercury]: [1],
      [Planet.Jupiter]: [1],
      [Planet.Venus]: [4],
      [Planet.Saturn]: [7],
    };

    if (directionHouses[planetPos.planet]?.includes(planetPos.house)) {
      digBala = 100;
    } else {
      digBala = 50;
    }

    const totalBala =
      sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala;

    // Convert to Virupas (1 Rupa = 60 Virupas)
    const totalVirupas = totalBala;

    const minRequired = minRequirements[planetPos.planet] || 300;

    strengths.push({
      planet: planetPos.planet,
      sthanaBala,
      digBala,
      kalaBala,
      chestaBala,
      naisargikaBala,
      drikBala,
      totalBala,
      totalVirupas,
      isStrong: totalVirupas >= minRequired,
    });
  }

  return strengths;
}

import {
  type PlanetPosition,
  type HouseData,
  type ShadbalaStrength,
  type BirthData,
  Planet,
  ZodiacSign,
} from "@shared/astro-schema";

/**
 * Comprehensive Shadbala (Six-fold Planetary Strength) calculations
 * Based on Brihat Parashara Hora Shastra formulas
 * Provides professional-grade planetary strength assessment
 */

/**
 * Calculate Sthana Bala (Positional Strength)
 * Includes Uchcha Bala, Saptavargaja Bala, Ojhayugma Bala, Kendra Bala, Drekkana Bala
 */
function calculateSthanaBala(
  planet: Planet,
  planetPosition: PlanetPosition,
  houses: HouseData[]
): number {
  let sthanaBala = 0;

  const ucchaPoints: Record<string, number> = {
    [ZodiacSign.Aries]: 10,
    [ZodiacSign.Taurus]: 3,
    [ZodiacSign.Cancer]: 5,
    [ZodiacSign.Virgo]: 15,
    [ZodiacSign.Libra]: 10,
    [ZodiacSign.Capricorn]: 28,
    [ZodiacSign.Pisces]: 27,
  };

  const ucchaLongitudes: Record<string, number> = {
    [Planet.Sun]: 10,
    [Planet.Moon]: 33,
    [Planet.Mars]: 298,
    [Planet.Mercury]: 165,
    [Planet.Jupiter]: 95,
    [Planet.Venus]: 357,
    [Planet.Saturn]: 200,
  };

  if (ucchaLongitudes[planet.toString()]) {
    const ucchaLong = ucchaLongitudes[planet.toString()];
    const planetLong = planetPosition.longitude;
    const diff = Math.abs(ucchaLong - planetLong);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    const ucchaBala = ((180 - normalizedDiff) / 180) * 60;
    sthanaBala += ucchaBala;
  }

  if ([1, 4, 7, 10].includes(planetPosition.house)) {
    sthanaBala += 60;
  } else if ([2, 5, 8, 11].includes(planetPosition.house)) {
    sthanaBala += 30;
  } else {
    sthanaBala += 15;
  }

  if ([ZodiacSign.Aries, ZodiacSign.Gemini, ZodiacSign.Leo, ZodiacSign.Libra, ZodiacSign.Sagittarius, ZodiacSign.Aquarius].includes(planetPosition.sign)) {
    if ([Planet.Sun, Planet.Mars, Planet.Jupiter, Planet.Saturn].includes(planet)) {
      sthanaBala += 15;
    }
  } else {
    if ([Planet.Moon, Planet.Venus, Planet.Mercury].includes(planet)) {
      sthanaBala += 15;
    }
  }

  return sthanaBala;
}

/**
 * Calculate Dig Bala (Directional Strength)
 * Planets gain strength in specific houses (directions)
 */
function calculateDigBala(
  planet: Planet,
  planetPosition: PlanetPosition
): number {
  const digBalaHouses: Record<string, number> = {
    [Planet.Jupiter]: 1,
    [Planet.Mercury]: 1,
    [Planet.Mars]: 10,
    [Planet.Saturn]: 7,
    [Planet.Sun]: 10,
    [Planet.Moon]: 4,
    [Planet.Venus]: 4,
  };

  const strongHouse = digBalaHouses[planet.toString()];
  if (!strongHouse) return 0;

  const houseDiff = Math.abs(planetPosition.house - strongHouse);
  const normalizedDiff = houseDiff > 6 ? 12 - houseDiff : houseDiff;

  const digBala = ((6 - normalizedDiff) / 6) * 60;
  return Math.max(0, digBala);
}

/**
 * Calculate Kala Bala (Temporal Strength)
 * Includes Natonnata Bala, Paksha Bala, Tribhaga Bala, Varsha-Masa-Dina-Hora Balas
 */
function calculateKalaBala(
  planet: Planet,
  planetPosition: PlanetPosition,
  birthData: BirthData,
  moonPosition: PlanetPosition,
  sunPosition: PlanetPosition
): number {
  let kalaBala = 0;

  const moonPhase = ((moonPosition.longitude - sunPosition.longitude + 360) % 360) / 360;

  if ([Planet.Moon, Planet.Venus, Planet.Saturn].includes(planet)) {
    kalaBala += moonPhase * 60;
  } else if ([Planet.Sun, Planet.Mars, Planet.Jupiter].includes(planet)) {
    kalaBala += (1 - moonPhase) * 60;
  } else {
    kalaBala += 30;
  }

  const [hours] = birthData.timeOfBirth.split(':').map(Number);
  const isDay = hours >= 6 && hours < 18;

  if (isDay) {
    if ([Planet.Sun, Planet.Jupiter, Planet.Venus].includes(planet)) {
      kalaBala += 60;
    } else if ([Planet.Moon, Planet.Mars, Planet.Saturn].includes(planet)) {
      kalaBala += 0;
    } else {
      kalaBala += 30;
    }
  } else {
    if ([Planet.Moon, Planet.Mars, Planet.Saturn].includes(planet)) {
      kalaBala += 60;
    } else if ([Planet.Sun, Planet.Jupiter, Planet.Venus].includes(planet)) {
      kalaBala += 0;
    } else {
      kalaBala += 30;
    }
  }

  const birthDate = new Date(birthData.dateOfBirth);
  const year = birthDate.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeapYear && planet === Planet.Jupiter) {
    kalaBala += 15;
  }

  const hour = hours % 24;
  const horaLord = getHoraLord(hour, birthDate.getDay());
  if (horaLord === planet) {
    kalaBala += 60;
  }

  return kalaBala;
}

/**
 * Get Hora Lord
 */
function getHoraLord(hour: number, dayOfWeek: number): Planet {
  const horaSequence = [
    Planet.Sun,
    Planet.Venus,
    Planet.Mercury,
    Planet.Moon,
    Planet.Saturn,
    Planet.Jupiter,
    Planet.Mars,
  ];

  const dayLords = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  const dayLord = dayLords[dayOfWeek];
  const dayLordIndex = horaSequence.indexOf(dayLord);

  const horaIndex = (dayLordIndex + hour) % 7;
  return horaSequence[horaIndex];
}

/**
 * Calculate Chesta Bala (Motional Strength)
 * Based on planetary motion and retrograde status
 */
function calculateChestaBala(
  planet: Planet,
  planetPosition: PlanetPosition
): number {
  if (planet === Planet.Sun || planet === Planet.Moon) {
    return 0;
  }

  if (planetPosition.isRetrograde) {
    return 60;
  }

  const speed = Math.abs(planetPosition.speed);
  const avgSpeeds: Record<string, number> = {
    [Planet.Mars]: 0.5,
    [Planet.Mercury]: 1.0,
    [Planet.Jupiter]: 0.08,
    [Planet.Venus]: 1.0,
    [Planet.Saturn]: 0.03,
  };

  const avgSpeed = avgSpeeds[planet.toString()] || 0.5;
  const chestaBala = (speed / avgSpeed) * 60;

  return Math.min(60, chestaBala);
}

/**
 * Calculate Naisargika Bala (Natural Strength)
 * Inherent strength of each planet
 */
function calculateNaisargikaBala(planet: Planet): number {
  const naisargikaBala: Record<string, number> = {
    [Planet.Sun]: 60,
    [Planet.Moon]: 51.43,
    [Planet.Venus]: 42.86,
    [Planet.Jupiter]: 34.29,
    [Planet.Mercury]: 25.71,
    [Planet.Mars]: 17.14,
    [Planet.Saturn]: 8.57,
    [Planet.Rahu]: 30,
    [Planet.Ketu]: 30,
  };

  return naisargikaBala[planet.toString()] || 30;
}

/**
 * Calculate Drik Bala (Aspectual Strength)
 * Strength gained or lost through aspects from other planets
 */
function calculateDrikBala(
  planet: Planet,
  allPlanets: PlanetPosition[]
): number {
  let drikBala = 0;

  const benefics = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  const malefics = [Planet.Mars, Planet.Saturn, Planet.Rahu, Planet.Ketu];

  for (const otherPlanet of allPlanets) {
    if (otherPlanet.planet === planet) continue;

    const aspectStrength = getAspectStrength(
      planet,
      otherPlanet.planet,
      allPlanets
    );

    if (aspectStrength > 0) {
      if (benefics.includes(otherPlanet.planet)) {
        drikBala += aspectStrength * 0.25;
      } else if (malefics.includes(otherPlanet.planet)) {
        drikBala -= aspectStrength * 0.25;
      }
    }
  }

  return drikBala + 30;
}

/**
 * Get aspect strength between two planets
 */
function getAspectStrength(
  planet1: Planet,
  planet2: Planet,
  allPlanets: PlanetPosition[]
): number {
  const pos1 = allPlanets.find((p) => p.planet === planet1);
  const pos2 = allPlanets.find((p) => p.planet === planet2);

  if (!pos1 || !pos2) return 0;

  const houseDiff = Math.abs(pos1.house - pos2.house);

  if (houseDiff === 6) {
    return 60;
  }

  if (planet2 === Planet.Mars && [3, 7].includes(houseDiff)) {
    return 45;
  }

  if (planet2 === Planet.Jupiter && [4, 8].includes(houseDiff)) {
    return 45;
  }

  if (planet2 === Planet.Saturn && [2, 9].includes(houseDiff)) {
    return 45;
  }

  return 0;
}

/**
 * Calculate complete Shadbala for all planets
 */
export function calculateComprehensiveShadbala(
  planetPositions: PlanetPosition[],
  houses: HouseData[],
  birthData: BirthData
): ShadbalaStrength[] {
  const results: ShadbalaStrength[] = [];

  const moonPosition = planetPositions.find((p) => p.planet === Planet.Moon);
  const sunPosition = planetPositions.find((p) => p.planet === Planet.Sun);

  if (!moonPosition || !sunPosition) {
    return results;
  }

  const planets = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  for (const planet of planets) {
    const position = planetPositions.find((p) => p.planet === planet);
    if (!position) continue;

    const sthanaBala = calculateSthanaBala(planet, position, houses);
    const digBala = calculateDigBala(planet, position);
    const kalaBala = calculateKalaBala(
      planet,
      position,
      birthData,
      moonPosition,
      sunPosition
    );
    const chestaBala = calculateChestaBala(planet, position);
    const naisargikaBala = calculateNaisargikaBala(planet);
    const drikBala = calculateDrikBala(planet, planetPositions);

    const totalBala =
      sthanaBala +
      digBala +
      kalaBala +
      chestaBala +
      naisargikaBala +
      drikBala;

    const totalVirupas = totalBala;

    const minimumStrength: Record<string, number> = {
      [Planet.Sun]: 390,
      [Planet.Moon]: 360,
      [Planet.Mars]: 300,
      [Planet.Mercury]: 420,
      [Planet.Jupiter]: 390,
      [Planet.Venus]: 330,
      [Planet.Saturn]: 300,
    };

    const isStrong = totalVirupas >= (minimumStrength[planet.toString()] || 300);

    results.push({
      planet,
      sthanaBala,
      digBala,
      kalaBala,
      chestaBala,
      naisargikaBala,
      drikBala,
      totalBala,
      totalVirupas,
      isStrong,
    });
  }

  return results;
}

/**
 * Get strength interpretation
 */
export function getStrengthInterpretation(
  strength: ShadbalaStrength
): string {
  if (strength.isStrong) {
    return `${strength.planet} is very strong (${Math.round(strength.totalVirupas)} Virupas) and will give excellent results. The planet is capable of delivering its full potential.`;
  } else {
    return `${strength.planet} is weak (${Math.round(strength.totalVirupas)} Virupas) and may not give full results. Consider strengthening remedies for this planet.`;
  }
}

/**
 * Get strongest and weakest planets
 */
export function getStrongestAndWeakest(
  shadbalaResults: ShadbalaStrength[]
): {
  strongest: ShadbalaStrength;
  weakest: ShadbalaStrength;
} {
  const sorted = [...shadbalaResults].sort(
    (a, b) => b.totalVirupas - a.totalVirupas
  );

  return {
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  };
}

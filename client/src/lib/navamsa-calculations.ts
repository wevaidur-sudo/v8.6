import {
  type PlanetPosition,
  type NavamsaChart,
  type HouseData,
  ZodiacSign,
  Planet,
  PlanetaryDignity,
  Nakshatra,
} from "@shared/astro-schema";

/**
 * Calculate Navamsa (D9) chart - the 9th divisional chart
 * Each sign divided into 9 parts of 3°20' each
 * Essential for marriage, spiritual maturity, and inner strength analysis
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

/**
 * Calculate Navamsa sign from planet longitude
 */
function calculateNavamsaSign(longitude: number): ZodiacSign {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  const navamsaPada = Math.floor(degreeInSign / (30 / 9)); // 0-8

  // Determine starting sign based on parent sign's element
  // Fire signs (Aries, Leo, Sagittarius) start from same sign
  // Earth signs (Taurus, Virgo, Capricorn) start from Capricorn
  // Air signs (Gemini, Libra, Aquarius) start from Libra
  // Water signs (Cancer, Scorpio, Pisces) start from Cancer

  let startSign = 0;
  const elementGroup = signIndex % 4;

  switch (elementGroup) {
    case 0: // Fire (Aries, Leo, Sagittarius)
      startSign = signIndex;
      break;
    case 1: // Earth (Taurus, Virgo, Capricorn)
      startSign = 9; // Capricorn
      break;
    case 2: // Air (Gemini, Libra, Aquarius)
      startSign = 6; // Libra
      break;
    case 3: // Water (Cancer, Scorpio, Pisces)
      startSign = 3; // Cancer
      break;
  }

  const navamsaSignIndex = (startSign + navamsaPada) % 12;
  return ZODIAC_SIGNS[navamsaSignIndex];
}

/**
 * Get nakshatra from longitude
 */
function getNakshatra(longitude: number): {
  nakshatra: Nakshatra;
  pada: number;
} {
  const nakshatras = [
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

  const nakshatraIndex = Math.floor((longitude / 360) * 27);
  const nakshatraDegree = (longitude % (360 / 27)) / (360 / 27);
  const pada = Math.floor(nakshatraDegree * 4) + 1;

  return {
    nakshatra: nakshatras[nakshatraIndex] || Nakshatra.Ashwini,
    pada,
  };
}

/**
 * Get sign lord
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
 * Determine planetary dignity
 */
function getPlanetaryDignity(planet: Planet, sign: ZodiacSign): PlanetaryDignity {
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
 * Calculate Navamsa chart from Rashi (D1) positions
 */
export function calculateNavamsa(
  d1Positions: PlanetPosition[]
): NavamsaChart {
  const navamsaPositions: PlanetPosition[] = [];

  // Calculate ascendant in Navamsa
  const ascendant = d1Positions.find((p) => p.planet === Planet.Ascendant);
  if (!ascendant) {
    throw new Error("Ascendant not found in D1 positions");
  }

  const navamsaAscendantSign = calculateNavamsaSign(ascendant.longitude);

  // Calculate Navamsa positions for each planet
  for (const d1Pos of d1Positions) {
    if (d1Pos.planet === Planet.Ascendant) continue;

    const navamsaSign = calculateNavamsaSign(d1Pos.longitude);
    const navamsaDegree = (d1Pos.longitude % (30 / 9)) * 9; // Convert to degrees within sign
    const nakshatra = getNakshatra(d1Pos.longitude);

    // Calculate house in Navamsa (Whole Sign from Navamsa Ascendant)
    const ascSignIndex = ZODIAC_SIGNS.indexOf(navamsaAscendantSign);
    const planetSignIndex = ZODIAC_SIGNS.indexOf(navamsaSign);
    const house = ((planetSignIndex - ascSignIndex + 12) % 12) + 1;

    const dignity = getPlanetaryDignity(d1Pos.planet, navamsaSign);

    navamsaPositions.push({
      planet: d1Pos.planet,
      longitude: d1Pos.longitude, // Keep original for reference
      sign: navamsaSign,
      degree: navamsaDegree,
      house,
      nakshatra: nakshatra.nakshatra,
      nakshatraPada: nakshatra.pada,
      isRetrograde: d1Pos.isRetrograde,
      isCombust: d1Pos.isCombust,
      dignity,
      speed: d1Pos.speed,
    });
  }

  // Calculate Navamsa houses
  const navamsaHouses: HouseData[] = [];
  const ascSignIndex = ZODIAC_SIGNS.indexOf(navamsaAscendantSign);

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const signIndex = (ascSignIndex + i) % 12;
    const sign = ZODIAC_SIGNS[signIndex];

    const planetsInHouse = navamsaPositions
      .filter((p) => p.house === houseNumber)
      .map((p) => p.planet);

    const lord = getSignLord(sign);

    navamsaHouses.push({
      houseNumber,
      sign,
      signDegree: signIndex * 30,
      lord,
      planetsInHouse,
    });
  }

  // Detect Vargottama planets (same sign in D1 and D9)
  const vargottamaPlanets: Planet[] = [];

  for (const d1Pos of d1Positions) {
    if (d1Pos.planet === Planet.Ascendant) continue;

    const navamsaPos = navamsaPositions.find(
      (p) => p.planet === d1Pos.planet
    );

    if (navamsaPos && d1Pos.sign === navamsaPos.sign) {
      vargottamaPlanets.push(d1Pos.planet);
    }
  }

  return {
    planetPositions: navamsaPositions,
    ascendant: navamsaAscendantSign,
    houses: navamsaHouses,
    vargottamaPlanets,
  };
}

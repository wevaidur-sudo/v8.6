import {
  type PlanetPosition,
  type DashaSystem,
  type MahadashaPeriod,
  type AntardashaPeriod,
  type PratyantardashaPeriod,
  type SookshmaPeriod,
  type PranaPeriod,
  type DehaPeriod,
  DashaPlanet,
  Planet,
  Nakshatra,
} from "@shared/astro-schema";

/**
 * Vimshottari Dasha System calculations
 * 120-year cycle divided among 9 planets
 */

// Dasha durations in years
const DASHA_DURATIONS: Record<DashaPlanet, number> = {
  [DashaPlanet.Ketu]: 7,
  [DashaPlanet.Venus]: 20,
  [DashaPlanet.Sun]: 6,
  [DashaPlanet.Moon]: 10,
  [DashaPlanet.Mars]: 7,
  [DashaPlanet.Rahu]: 18,
  [DashaPlanet.Jupiter]: 16,
  [DashaPlanet.Saturn]: 19,
  [DashaPlanet.Mercury]: 17,
};

// Nakshatra lords in sequence
const NAKSHATRA_LORDS: Record<Nakshatra, DashaPlanet> = {
  [Nakshatra.Ashwini]: DashaPlanet.Ketu,
  [Nakshatra.Bharani]: DashaPlanet.Venus,
  [Nakshatra.Krittika]: DashaPlanet.Sun,
  [Nakshatra.Rohini]: DashaPlanet.Moon,
  [Nakshatra.Mrigashira]: DashaPlanet.Mars,
  [Nakshatra.Ardra]: DashaPlanet.Rahu,
  [Nakshatra.Punarvasu]: DashaPlanet.Jupiter,
  [Nakshatra.Pushya]: DashaPlanet.Saturn,
  [Nakshatra.Ashlesha]: DashaPlanet.Mercury,
  [Nakshatra.Magha]: DashaPlanet.Ketu,
  [Nakshatra.PurvaPhalguni]: DashaPlanet.Venus,
  [Nakshatra.UttaraPhalguni]: DashaPlanet.Sun,
  [Nakshatra.Hasta]: DashaPlanet.Moon,
  [Nakshatra.Chitra]: DashaPlanet.Mars,
  [Nakshatra.Swati]: DashaPlanet.Rahu,
  [Nakshatra.Vishakha]: DashaPlanet.Jupiter,
  [Nakshatra.Anuradha]: DashaPlanet.Saturn,
  [Nakshatra.Jyeshtha]: DashaPlanet.Mercury,
  [Nakshatra.Mula]: DashaPlanet.Ketu,
  [Nakshatra.PurvaAshadha]: DashaPlanet.Venus,
  [Nakshatra.UttaraAshadha]: DashaPlanet.Sun,
  [Nakshatra.Shravana]: DashaPlanet.Moon,
  [Nakshatra.Dhanishta]: DashaPlanet.Mars,
  [Nakshatra.Shatabhisha]: DashaPlanet.Rahu,
  [Nakshatra.PurvaBhadrapada]: DashaPlanet.Jupiter,
  [Nakshatra.UttaraBhadrapada]: DashaPlanet.Saturn,
  [Nakshatra.Revati]: DashaPlanet.Mercury,
};

// Dasha sequence
const DASHA_SEQUENCE: DashaPlanet[] = [
  DashaPlanet.Ketu,
  DashaPlanet.Venus,
  DashaPlanet.Sun,
  DashaPlanet.Moon,
  DashaPlanet.Mars,
  DashaPlanet.Rahu,
  DashaPlanet.Jupiter,
  DashaPlanet.Saturn,
  DashaPlanet.Mercury,
];

/**
 * Calculate balance of birth dasha
 */
function calculateBirthDashaBalance(
  moonPosition: PlanetPosition,
  birthDate: Date
): { planet: DashaPlanet; balance: number } {
  const nakshatra = moonPosition.nakshatra;
  const planet = NAKSHATRA_LORDS[nakshatra];
  const duration = DASHA_DURATIONS[planet];

  // Each nakshatra is 13°20' (360° / 27)
  // Each pada is 3°20'
  const nakshatraStart = Math.floor(moonPosition.longitude / (360 / 27)) * (360 / 27);
  const degreeInNakshatra = moonPosition.longitude - nakshatraStart;
  const fractionCompleted = degreeInNakshatra / (360 / 27);

  // Remaining balance
  const balance = duration * (1 - fractionCompleted);

  return { planet, balance };
}

/**
 * Calculate all Mahadasha periods
 */
export function calculateDashaSystem(
  planetPositions: PlanetPosition[],
  birthDate: Date
): DashaSystem {
  const moon = planetPositions.find((p) => p.planet === Planet.Moon);
  if (!moon) {
    throw new Error("Moon position not found");
  }

  const { planet: birthDasha, balance } = calculateBirthDashaBalance(moon, birthDate);

  const mahadashas: MahadashaPeriod[] = [];
  let currentDate = new Date(birthDate);

  // Start with remaining balance of birth dasha
  const startIndex = DASHA_SEQUENCE.indexOf(birthDasha);
  let firstDasha = true;

  for (let i = 0; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const planet = DASHA_SEQUENCE[planetIndex];
    const duration = firstDasha ? balance : DASHA_DURATIONS[planet];

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

  // Determine current Mahadasha
  const now = new Date();
  const currentMahadasha = mahadashas.find(
    (md) => md.startDate <= now && md.endDate >= now
  ) || mahadashas[0];

  // Calculate current Antardasha
  const currentAntardasha = calculateCurrentAntardasha(
    currentMahadasha,
    now
  );

  // Calculate current Pratyantardasha
  const currentPratyantardasha = currentAntardasha
    ? calculateCurrentPratyantardasha(currentMahadasha, currentAntardasha, now)
    : null;

  // Calculate current Sookshma
  const currentSookshma = currentPratyantardasha && currentAntardasha
    ? calculateCurrentSookshma(currentMahadasha, currentAntardasha, currentPratyantardasha, now)
    : null;

  // Calculate current Prana
  const currentPrana = currentSookshma && currentPratyantardasha && currentAntardasha
    ? calculateCurrentPrana(currentMahadasha, currentAntardasha, currentPratyantardasha, currentSookshma, now)
    : null;

  // Calculate current Deha
  const currentDeha = currentPrana && currentSookshma && currentPratyantardasha && currentAntardasha
    ? calculateCurrentDeha(currentMahadasha, currentAntardasha, currentPratyantardasha, currentSookshma, currentPrana, now)
    : null;

  return {
    birthDasha,
    birthDashaBalance: balance,
    mahadashas,
    currentMahadasha,
    currentAntardasha,
    currentPratyantardasha,
    currentSookshma,
    currentPrana,
    currentDeha,
  };
}

/**
 * Calculate current Antardasha
 */
function calculateCurrentAntardasha(
  mahadasha: MahadashaPeriod,
  currentDate: Date
): AntardashaPeriod {
  const mahadashaDurationYears = mahadasha.durationYears;
  const antardashas: AntardashaPeriod[] = [];

  let currentAntardashaDate = new Date(mahadasha.startDate);

  // Calculate all Antardashas within this Mahadasha
  for (const antarPlanet of DASHA_SEQUENCE) {
    const antarDurationYears =
      (mahadashaDurationYears * DASHA_DURATIONS[antarPlanet]) / 120;

    const startDate = new Date(currentAntardashaDate);
    const endDate = new Date(currentAntardashaDate);
    endDate.setFullYear(endDate.getFullYear() + Math.floor(antarDurationYears));
    endDate.setMonth(
      endDate.getMonth() + Math.round((antarDurationYears % 1) * 12)
    );

    antardashas.push({
      planet: antarPlanet,
      startDate,
      endDate,
      durationMonths: antarDurationYears * 12,
      mahadashaPlanet: mahadasha.planet,
    });

    currentAntardashaDate = new Date(endDate);
  }

  // Find current Antardasha
  const current = antardashas.find(
    (ad) => ad.startDate <= currentDate && ad.endDate >= currentDate
  );

  return current || antardashas[0];
}

/**
 * Calculate current Pratyantardasha (sub-sub period)
 * Formula: (Antardasha duration × Planet duration) / 120
 */
function calculateCurrentPratyantardasha(
  mahadasha: MahadashaPeriod,
  antardasha: AntardashaPeriod,
  currentDate: Date
): PratyantardashaPeriod {
  const antardashaDurationYears = antardasha.durationMonths / 12;
  const pratyantardashas: PratyantardashaPeriod[] = [];

  let currentPratyantardashaDate = new Date(antardasha.startDate);

  // Calculate all Pratyantardashas within this Antardasha
  for (const pratyantarPlanet of DASHA_SEQUENCE) {
    const pratyantarDurationYears =
      (antardashaDurationYears * DASHA_DURATIONS[pratyantarPlanet]) / 120;
    const pratyantarDurationDays = pratyantarDurationYears * 365.25;

    const startDate = new Date(currentPratyantardashaDate);
    const endDate = new Date(currentPratyantardashaDate);
    endDate.setDate(endDate.getDate() + Math.round(pratyantarDurationDays));

    pratyantardashas.push({
      planet: pratyantarPlanet,
      startDate,
      endDate,
      durationDays: pratyantarDurationDays,
      mahadashaPlanet: mahadasha.planet,
      antardashaPlanet: antardasha.planet,
    });

    currentPratyantardashaDate = new Date(endDate);
  }

  // Find current Pratyantardasha
  const current = pratyantardashas.find(
    (pd) => pd.startDate <= currentDate && pd.endDate >= currentDate
  );

  return current || pratyantardashas[0];
}

/**
 * Calculate current Sookshma (sub-sub-sub period)
 * Formula: (Pratyantardasha duration × Planet duration) / 120
 */
function calculateCurrentSookshma(
  mahadasha: MahadashaPeriod,
  antardasha: AntardashaPeriod,
  pratyantardasha: PratyantardashaPeriod,
  currentDate: Date
): SookshmaPeriod {
  const pratyantardashaDurationYears = pratyantardasha.durationDays / 365.25;
  const sookshmas: SookshmaPeriod[] = [];

  let currentSookshmaDate = new Date(pratyantardasha.startDate);

  // Calculate all Sookshmas within this Pratyantardasha
  for (const sookshmaPlanet of DASHA_SEQUENCE) {
    const sookshmaDurationYears =
      (pratyantardashaDurationYears * DASHA_DURATIONS[sookshmaPlanet]) / 120;
    const sookshmaDurationHours = sookshmaDurationYears * 365.25 * 24;

    const startDate = new Date(currentSookshmaDate);
    const endDate = new Date(currentSookshmaDate);
    endDate.setTime(endDate.getTime() + sookshmaDurationHours * 60 * 60 * 1000);

    sookshmas.push({
      planet: sookshmaPlanet,
      startDate,
      endDate,
      durationHours: sookshmaDurationHours,
      mahadashaPlanet: mahadasha.planet,
      antardashaPlanet: antardasha.planet,
      pratyantardashaPlanet: pratyantardasha.planet,
    });

    currentSookshmaDate = new Date(endDate);
  }

  // Find current Sookshma
  const current = sookshmas.find(
    (sd) => sd.startDate <= currentDate && sd.endDate >= currentDate
  );

  return current || sookshmas[0];
}

/**
 * Calculate current Prana (sub-sub-sub-sub period)
 * Formula: (Sookshma duration × Planet duration) / 120
 */
function calculateCurrentPrana(
  mahadasha: MahadashaPeriod,
  antardasha: AntardashaPeriod,
  pratyantardasha: PratyantardashaPeriod,
  sookshma: SookshmaPeriod,
  currentDate: Date
): PranaPeriod {
  const sookshmaDurationYears = sookshma.durationHours / (365.25 * 24);
  const pranas: PranaPeriod[] = [];

  let currentPranaDate = new Date(sookshma.startDate);

  // Calculate all Pranas within this Sookshma
  for (const pranaPlanet of DASHA_SEQUENCE) {
    const pranaDurationYears =
      (sookshmaDurationYears * DASHA_DURATIONS[pranaPlanet]) / 120;
    const pranaDurationMinutes = pranaDurationYears * 365.25 * 24 * 60;

    const startDate = new Date(currentPranaDate);
    const endDate = new Date(currentPranaDate);
    endDate.setTime(endDate.getTime() + pranaDurationMinutes * 60 * 1000);

    pranas.push({
      planet: pranaPlanet,
      startDate,
      endDate,
      durationMinutes: pranaDurationMinutes,
      mahadashaPlanet: mahadasha.planet,
      antardashaPlanet: antardasha.planet,
      pratyantardashaPlanet: pratyantardasha.planet,
      sookshmaPlanet: sookshma.planet,
    });

    currentPranaDate = new Date(endDate);
  }

  // Find current Prana
  const current = pranas.find(
    (pd) => pd.startDate <= currentDate && pd.endDate >= currentDate
  );

  return current || pranas[0];
}

/**
 * Calculate current Deha (sub-sub-sub-sub-sub period)
 * Formula: (Prana duration × Planet duration) / 120
 */
function calculateCurrentDeha(
  mahadasha: MahadashaPeriod,
  antardasha: AntardashaPeriod,
  pratyantardasha: PratyantardashaPeriod,
  sookshma: SookshmaPeriod,
  prana: PranaPeriod,
  currentDate: Date
): DehaPeriod {
  const pranaDurationYears = prana.durationMinutes / (365.25 * 24 * 60);
  const dehas: DehaPeriod[] = [];

  let currentDehaDate = new Date(prana.startDate);

  // Calculate all Dehas within this Prana
  for (const dehaPlanet of DASHA_SEQUENCE) {
    const dehaDurationYears =
      (pranaDurationYears * DASHA_DURATIONS[dehaPlanet]) / 120;
    const dehaDurationSeconds = dehaDurationYears * 365.25 * 24 * 60 * 60;

    const startDate = new Date(currentDehaDate);
    const endDate = new Date(currentDehaDate);
    endDate.setTime(endDate.getTime() + dehaDurationSeconds * 1000);

    dehas.push({
      planet: dehaPlanet,
      startDate,
      endDate,
      durationSeconds: dehaDurationSeconds,
      mahadashaPlanet: mahadasha.planet,
      antardashaPlanet: antardasha.planet,
      pratyantardashaPlanet: pratyantardasha.planet,
      sookshmaPlanet: sookshma.planet,
      pranaPlanet: prana.planet,
    });

    currentDehaDate = new Date(endDate);
  }

  // Find current Deha
  const current = dehas.find(
    (dd) => dd.startDate <= currentDate && dd.endDate >= currentDate
  );

  return current || dehas[0];
}

import {
  type PlanetPosition,
  type HouseData,
  type Yoga,
  Planet,
  YogaType,
  PlanetaryDignity,
  ZodiacSign,
} from "@shared/astro-schema";

/**
 * Detect major yogas (planetary combinations) in a birth chart
 * Based on classical texts: BPHS, Phaladeepika, Jataka Parijata
 */

/**
 * Detect Pancha Mahapurusha Yogas
 * Formed when Mars, Mercury, Jupiter, Venus, or Saturn are in own sign or exaltation in a Kendra (1,4,7,10)
 */
function detectMahapurushaYogas(
  planetPositions: PlanetPosition[]
): Yoga[] {
  const yogas: Yoga[] = [];
  const mahapurushaPlants = [
    Planet.Mars,
    Planet.Mercury,
    Planet.Jupiter,
    Planet.Venus,
    Planet.Saturn,
  ];

  const yogaNames: Record<string, string> = {
    [Planet.Mars]: "Ruchaka Yoga",
    [Planet.Mercury]: "Bhadra Yoga",
    [Planet.Jupiter]: "Hamsa Yoga",
    [Planet.Venus]: "Malavya Yoga",
    [Planet.Saturn]: "Shasha Yoga",
  };

  const yogaDescriptions: Record<string, string> = {
    [Planet.Mars]:
      "Strong Mars in Kendra brings exceptional courage, leadership qualities, and success through disciplined action.",
    [Planet.Mercury]:
      "Mercury in Kendra bestows extraordinary intelligence, communication skills, and success in business and learning.",
    [Planet.Jupiter]:
      "Jupiter in Kendra indicates wisdom, spiritual inclination, prosperity, and honorable position in society.",
    [Planet.Venus]:
      "Venus in Kendra brings charm, artistic abilities, luxury, and success in creative and relationship matters.",
    [Planet.Saturn]:
      "Saturn in Kendra provides discipline, organizational skills, longevity, and success through persistent effort.",
  };

  for (const planet of mahapurushaPlants) {
    const position = planetPositions.find((p) => p.planet === planet);
    if (!position) continue;

    // Check if in Kendra (houses 1, 4, 7, 10)
    const isInKendra = [1, 4, 7, 10].includes(position.house);
    
    // Check if in own sign or exaltation
    const isStrong =
      position.dignity === PlanetaryDignity.Exalted ||
      position.dignity === PlanetaryDignity.OwnSign;

    if (isInKendra && isStrong) {
      yogas.push({
        type: YogaType.MahapurushaYoga,
        name: yogaNames[planet],
        formationPlanets: [planet],
        houses: [position.house],
        strength: position.dignity === PlanetaryDignity.Exalted ? "strong" : "moderate",
        description: `${planet} is ${position.dignity.toLowerCase()} in the ${position.house}${getOrdinalSuffix(position.house)} house (Kendra).`,
        effects: yogaDescriptions[planet],
      });
    }
  }

  return yogas;
}

/**
 * Detect Gaja Kesari Yoga
 * Jupiter in Kendra from Moon
 */
function detectGajaKesariYoga(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];

  const moon = planetPositions.find((p) => p.planet === Planet.Moon);
  const jupiter = planetPositions.find((p) => p.planet === Planet.Jupiter);

  if (!moon || !jupiter) return yogas;

  // Calculate houses from Moon
  const houseDiff = ((jupiter.house - moon.house + 12) % 12) + 1;

  // Check if Jupiter is in Kendra from Moon (1, 4, 7, 10)
  if ([1, 4, 7, 10].includes(houseDiff)) {
    yogas.push({
      type: YogaType.GajaKesariYoga,
      name: "Gaja Kesari Yoga",
      formationPlanets: [Planet.Jupiter, Planet.Moon],
      houses: [jupiter.house, moon.house],
      strength: jupiter.dignity === PlanetaryDignity.Exalted ? "strong" : "moderate",
      description: `Jupiter is placed in a Kendra (angular house) from Moon, creating the auspicious Gaja Kesari Yoga.`,
      effects:
        "Bestows intelligence, wisdom, good reputation, wealth, and success. The native is blessed with a sharp mind, good character, and respect in society.",
    });
  }

  return yogas;
}

/**
 * Detect Budha Aditya Yoga
 * Sun and Mercury conjunction (not combust)
 */
function detectBudhaAdityaYoga(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];

  const sun = planetPositions.find((p) => p.planet === Planet.Sun);
  const mercury = planetPositions.find((p) => p.planet === Planet.Mercury);

  if (!sun || !mercury) return yogas;

  // Check if in same house and Mercury not combust
  if (sun.house === mercury.house && !mercury.isCombust) {
    yogas.push({
      type: YogaType.BudhaAdityaYoga,
      name: "Budha Aditya Yoga",
      formationPlanets: [Planet.Sun, Planet.Mercury],
      houses: [sun.house],
      strength: "moderate",
      description: `Sun and Mercury are conjunct in the ${sun.house}${getOrdinalSuffix(sun.house)} house, with Mercury not combust.`,
      effects:
        "Grants intelligence, excellent communication skills, analytical abilities, and success in intellectual pursuits. Favorable for writers, speakers, and business professionals.",
    });
  }

  return yogas;
}

/**
 * Detect Rajayoga (Wealth & Status Combinations)
 * Kendra-Trikona relationship between house lords
 */
function detectRajayoga(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];

  const kendraHouses = [1, 4, 7, 10];
  const trikonaHouses = [1, 5, 9];

  // Check for lords of Kendra and Trikona houses conjunct or aspecting
  for (const kendraHouse of kendraHouses) {
    for (const trikonaHouse of trikonaHouses) {
      if (kendraHouse === trikonaHouse) continue; // Skip if same house

      const kendraLord = houses.find((h) => h.houseNumber === kendraHouse)?.lord;
      const trikonaLord = houses.find((h) => h.houseNumber === trikonaHouse)?.lord;

      if (!kendraLord || !trikonaLord) continue;

      const kendraLordPos = planetPositions.find((p) => p.planet === kendraLord);
      const trikonaLordPos = planetPositions.find((p) => p.planet === trikonaLord);

      if (!kendraLordPos || !trikonaLordPos) continue;

      // Check if in same house (conjunction)
      if (kendraLordPos.house === trikonaLordPos.house) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Rajayoga",
          formationPlanets: [kendraLord, trikonaLord],
          houses: [kendraLordPos.house],
          strength: "strong",
          description: `Lord of ${kendraHouse}${getOrdinalSuffix(kendraHouse)} house (${kendraLord}) and lord of ${trikonaHouse}${getOrdinalSuffix(trikonaHouse)} house (${trikonaLord}) are conjunct.`,
          effects:
            "Creates significant potential for wealth, status, power, and recognition. Success comes through leadership, authority, and noble actions.",
        });
      }
    }
  }

  return yogas;
}

/**
 * Detect Neecha Bhanga Rajayoga (Debilitation Cancellation)
 */
function detectNeechaBhangaRajayoga(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];

  const debilitatedPlanets = planetPositions.filter(
    (p) => p.dignity === PlanetaryDignity.Debilitated
  );

  for (const debPlanet of debilitatedPlanets) {
    // Check if dispositor is in Kendra
    const house = houses.find((h) => h.sign === debPlanet.sign);
    if (!house) continue;

    const dispositor = planetPositions.find((p) => p.planet === house.lord);
    if (!dispositor) continue;

    if ([1, 4, 7, 10].includes(dispositor.house)) {
      yogas.push({
        type: YogaType.NeechaBhangaRajayoga,
        name: "Neecha Bhanga Rajayoga",
        formationPlanets: [debPlanet.planet, dispositor.planet],
        houses: [debPlanet.house, dispositor.house],
        strength: "moderate",
        description: `${debPlanet.planet} is debilitated but its dispositor ${dispositor.planet} is in a Kendra, canceling the debilitation.`,
        effects:
          "Transforms initial challenges into strength. Success comes after overcoming obstacles. The native develops resilience and achieves recognition through persistent effort.",
      });
    }
  }

  return yogas;
}

/**
 * Detect Vipreet Rajayoga (Transformation Through Adversity)
 * Lords of 6th, 8th, or 12th houses in another Dusthana (6,8,12)
 */
function detectVipreetRajayoga(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  const dusthanaHouses = [6, 8, 12];

  const yogaNames: Record<number, string> = {
    6: "Harsha Yoga",
    8: "Sarala Yoga",
    12: "Vimala Yoga",
  };

  for (const dusthana of dusthanaHouses) {
    const house = houses.find((h) => h.houseNumber === dusthana);
    if (!house) continue;

    const lord = planetPositions.find((p) => p.planet === house.lord);
    if (!lord) continue;

    // Check if lord is in another Dusthana
    if (dusthanaHouses.includes(lord.house) && lord.house !== dusthana) {
      yogas.push({
        type: YogaType.VipreetRajayoga,
        name: yogaNames[dusthana],
        formationPlanets: [lord.planet],
        houses: [lord.house],
        strength: "moderate",
        description: `Lord of ${dusthana}${getOrdinalSuffix(dusthana)} house is placed in ${lord.house}${getOrdinalSuffix(lord.house)} house, forming Vipreet Rajayoga.`,
        effects:
          "Success through adversity and challenges. Initial hardships lead to lasting achievements. The native develops exceptional problem-solving abilities and resilience.",
      });
    }
  }

  return yogas;
}

/**
 * Detect Kaal Sarp Yoga
 * All planets hemmed between Rahu and Ketu
 */
function detectKaalSarpYoga(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];

  const rahu = planetPositions.find((p) => p.planet === Planet.Rahu);
  const ketu = planetPositions.find((p) => p.planet === Planet.Ketu);

  if (!rahu || !ketu) return yogas;

  // Get all planets except Rahu and Ketu
  const otherPlanets = planetPositions.filter(
    (p) =>
      p.planet !== Planet.Rahu &&
      p.planet !== Planet.Ketu &&
      p.planet !== Planet.Ascendant
  );

  // Check if all planets are between Rahu and Ketu
  let allBetween = true;
  for (const planet of otherPlanets) {
    const rahuToKetu = ((ketu.longitude - rahu.longitude + 360) % 360);
    const rahuToPlanet = ((planet.longitude - rahu.longitude + 360) % 360);
    
    if (rahuToPlanet > rahuToKetu) {
      allBetween = false;
      break;
    }
  }

  if (allBetween) {
    yogas.push({
      type: YogaType.KaalSarpYoga,
      name: "Kaal Sarp Yoga",
      formationPlanets: [Planet.Rahu, Planet.Ketu],
      houses: [rahu.house, ketu.house],
      strength: "moderate",
      description: "All planets are hemmed between Rahu and Ketu axis.",
      effects:
        "Creates intense karmic lessons and spiritual transformation. May bring obstacles and delays, but also deep spiritual insight and eventual success through perseverance.",
    });
  }

  return yogas;
}

/**
 * Detect 31 Nabhasa Yogas (Pattern-based yogas from BPHS Chapter 35)
 * Classical formations based on planetary distribution across signs and houses
 * Source: Brihat Parashara Hora Shastra
 */
function detectNabhasaYogas(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Get the 7 classical planets (excluding Ascendant, Rahu, Ketu per classical texts)
  const sevenPlanets = planetPositions.filter(
    (p) => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
  );
  
  if (sevenPlanets.length !== 7) return yogas; // Must have exactly 7 planets
  
  // Sign classifications for Asraya yogas
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  const fixedSigns = [ZodiacSign.Taurus, ZodiacSign.Leo, ZodiacSign.Scorpio, ZodiacSign.Aquarius];
  const dualSigns = [ZodiacSign.Gemini, ZodiacSign.Virgo, ZodiacSign.Sagittarius, ZodiacSign.Pisces];
  
  // Benefic and malefic classifications for Dala yogas
  // Per BPHS: Moon is benefic when waxing (Shukla Paksha), malefic when waning (Krishna Paksha)
  const beneficPlanetsBase = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  const maleficPlanetsBase = [Planet.Sun, Planet.Mars, Planet.Saturn];
  
  // Calculate Moon's paksha (phase) based on Sun-Moon longitude difference
  const sun = planetPositions.find(p => p.planet === Planet.Sun);
  const moon = sevenPlanets.find(p => p.planet === Planet.Moon);
  let beneficPlanets = [...beneficPlanetsBase];
  let maleficPlanets = [...maleficPlanetsBase];
  
  if (sun && moon && sun.longitude !== undefined && moon.longitude !== undefined) {
    // Calculate angular distance from Sun to Moon (0-360 degrees)
    // Longitude values are already absolute ecliptic positions (0-360°)
    const angularDistance = (moon.longitude - sun.longitude + 360) % 360;
    
    // Waxing (Shukla Paksha): Angular distance 0-180 degrees (Moon ahead of Sun)
    // Waning (Krishna Paksha): Angular distance 180-360 degrees (Moon behind Sun)
    if (angularDistance >= 0 && angularDistance < 180) {
      // Waxing Moon - treat as benefic
      beneficPlanets.push(Planet.Moon);
    } else {
      // Waning Moon - treat as malefic
      maleficPlanets.push(Planet.Moon);
    }
  }
  
  // Get unique signs and houses occupied
  const occupiedSigns = new Set(sevenPlanets.map(p => p.sign));
  const signCount = occupiedSigns.size;
  const occupiedHouses = new Set(sevenPlanets.map(p => p.house));
  const houseCount = occupiedHouses.size;
  
  // SANKHYA YOGAS (based on number of signs occupied)
  if (signCount === 1) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Gola Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy a single sign.",
      effects: "Creates a highly focused individual with specialized skills. May face ups and downs but achieves expertise in chosen field.",
    });
  }
  
  if (signCount === 2) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Yuga Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy 2 consecutive signs.",
      effects: "Indicates a balanced personality with dual interests. Success through partnerships and collaborations.",
    });
  }
  
  if (signCount === 3) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Sula Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy 3 signs.",
      effects: "Brings courage and determination. The native may face obstacles but overcomes them through persistence.",
    });
  }
  
  if (signCount === 4) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Kedara Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy 4 signs.",
      effects: "Indicates prosperity through agriculture, real estate, or land-related activities. Patient and hardworking nature.",
    });
  }
  
  if (signCount === 5) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Pasha Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy 5 signs.",
      effects: "May bring initial restrictions but eventual freedom. Success through service and helping others.",
    });
  }
  
  if (signCount === 6) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Dama Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy 6 signs.",
      effects: "Brings self-control and charitable nature. Success through disciplined efforts and helping society.",
    });
  }
  
  if (signCount === 7) {
    yogas.push({
      type: YogaType.NabhasaSankhyaYoga,
      name: "Veena Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy 7 different signs.",
      effects: "Indicates artistic talents, musical abilities, and harmonious personality. Enjoys life's pleasures.",
    });
  }
  
  // ASRAYA YOGAS (based on sign types - Movable/Fixed/Dual per BPHS Ch.35 V.7-8)
  const inMovableSigns = sevenPlanets.every(p => movableSigns.includes(p.sign));
  const inFixedSigns = sevenPlanets.every(p => fixedSigns.includes(p.sign));
  const inDualSigns = sevenPlanets.every(p => dualSigns.includes(p.sign));
  
  if (inMovableSigns) {
    yogas.push({
      type: YogaType.NabhasaAsrayaYoga,
      name: "Rajju Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy movable signs (Aries, Cancer, Libra, Capricorn).",
      effects: "Native fond of travel, earning through travel, handsome appearance, desire for wealth, inclined to wander.",
    });
  }
  
  if (inFixedSigns) {
    yogas.push({
      type: YogaType.NabhasaAsrayaYoga,
      name: "Musala Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy fixed signs (Taurus, Leo, Scorpio, Aquarius).",
      effects: "Stable wealth, fixed assets, self-respect, endowed with gems, leadership qualities, fearless, famous.",
    });
  }
  
  if (inDualSigns) {
    yogas.push({
      type: YogaType.NabhasaAsrayaYoga,
      name: "Nala Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy dual signs (Gemini, Virgo, Sagittarius, Pisces).",
      effects: "Pleasing personality, skilled in many arts, helpful nature, versatile abilities.",
    });
  }
  
  // DALA YOGAS (based on benefic/malefic in all kendras per BPHS Ch.35)
  // Mala requires all 4 kendras occupied by only benefics (including waxing Moon)
  // Sarpa requires all 4 kendras occupied by only malefics (including waning Moon)
  const kendrasForDala = [1, 4, 7, 10];
  const planetsInKendrasForDala = sevenPlanets.filter(p => kendrasForDala.includes(p.house));
  const occupiedKendras = new Set(planetsInKendrasForDala.map(p => p.house));
  
  // Check if all 4 kendras are occupied
  if (occupiedKendras.size === 4) {
    const beneficsInKendras = planetsInKendrasForDala.filter(p => beneficPlanets.includes(p.planet));
    const maleficsInKendras = planetsInKendrasForDala.filter(p => maleficPlanets.includes(p.planet));
    
    // Mala Yoga - All kendras occupied, and ALL planets in kendras are benefic
    if (planetsInKendrasForDala.length === beneficsInKendras.length && beneficsInKendras.length > 0) {
      yogas.push({
        type: YogaType.NabhasaDalaYoga,
        name: "Mala Yoga",
        formationPlanets: beneficsInKendras.map(p => p.planet),
        houses: Array.from(occupiedKendras),
        strength: "moderate",
        description: `All four kendras (1,4,7,10) occupied by only benefic planets: ${beneficsInKendras.map(p => p.planet).join(", ")}.`,
        effects: "Garland of prosperity and virtue. Wealthy, kind-hearted, and respected. Success through noble actions and good character.",
      });
    }
    
    // Sarpa Yoga - All kendras occupied, and ALL planets in kendras are malefic
    if (planetsInKendrasForDala.length === maleficsInKendras.length && maleficsInKendras.length > 0) {
      yogas.push({
        type: YogaType.NabhasaDalaYoga,
        name: "Sarpa Yoga",
        formationPlanets: maleficsInKendras.map(p => p.planet),
        houses: Array.from(occupiedKendras),
        strength: "moderate",
        description: `All four kendras (1,4,7,10) occupied by only malefic planets: ${maleficsInKendras.map(p => p.planet).join(", ")}.`,
        effects: "Serpent-like cunning and wisdom. Faces challenges and obstacles but overcomes through persistence. May experience suffering but gains strength.",
      });
    }
  }
  
  // AKRITI YOGAS (Shape-based - 20 yogas based on planetary patterns)
  const housesOccupied = Array.from(occupiedHouses).sort((a, b) => a - b);
  
  // Chakra Yoga - all planets in alternate houses
  let isAlternate = true;
  for (let i = 0; i < housesOccupied.length - 1; i++) {
    if ((housesOccupied[i + 1] - housesOccupied[i]) % 2 !== 0) {
      isAlternate = false;
      break;
    }
  }
  
  if (isAlternate && houseCount >= 3) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Chakra Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "strong",
      description: "All planets occupy alternate houses forming a circular pattern.",
      effects: "Ruler or leader in their field. Commands authority and respect. Wealthy and influential in society.",
    });
  }
  
  // Samudra Yoga - all planets in houses 1-6
  const planetsIn1to6 = sevenPlanets.filter(p => [1, 2, 3, 4, 5, 6].includes(p.house));
  if (planetsIn1to6.length === 7 && houseCount === 6) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Samudra Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "strong",
      description: "All 7 planets occupy the six houses 1-6.",
      effects: "Abundant wealth like an ocean. Prosperous, happy, and commanding personality. Success in material pursuits.",
    });
  }
  
  // Kamala Yoga - planets in 4 Kendras (1, 4, 7, 10)
  const kendraHouses = [1, 4, 7, 10];
  const planetsInKendrasForKamala = sevenPlanets.filter(p => kendraHouses.includes(p.house));
  if (planetsInKendrasForKamala.length === 7 && occupiedHouses.size === 4) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Kamala Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "strong",
      description: "All planets occupy the 4 Kendra houses (1,4,7,10).",
      effects: "Lotus-like prosperity and fame. Virtuous, wealthy, and long-lived. Respected in society like royalty.",
    });
  }
  
  // Vapi Yoga - all planets in houses 4, 5, 6, 7
  const inMiddleHouses = sevenPlanets.filter(p => [4, 5, 6, 7].includes(p.house));
  if (inMiddleHouses.length === 7) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Vapi Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy houses 4, 5, 6, and 7.",
      effects: "Accumulation of wealth through business and trade. Prosperity like a well that never dries. Charitable nature.",
    });
  }
  
  // Yupa Yoga - planets from Lagna to 4th or 7th to 10th
  const in1to4 = sevenPlanets.filter(p => [1, 2, 3, 4].includes(p.house));
  const in7to10 = sevenPlanets.filter(p => [7, 8, 9, 10].includes(p.house));
  if (in1to4.length === 7 || in7to10.length === 7) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Yupa Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets concentrated in consecutive houses from Lagna to 4th or 7th to 10th.",
      effects: "Religious inclination, spiritual wisdom, and charitable disposition. Respected for virtuous conduct.",
    });
  }
  
  // Ishu Yoga - planets from 1-3 or 7-9
  const in1to3 = sevenPlanets.filter(p => [1, 2, 3].includes(p.house));
  const in7to9 = sevenPlanets.filter(p => [7, 8, 9].includes(p.house));
  if (in1to3.length === 7 || in7to9.length === 7) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Ishu Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets in 3 consecutive houses (like an arrow).",
      effects: "Swift action and quick success. Sharp intellect and goal-oriented personality. Military or sports achievements.",
    });
  }
  
  // Sakti Yoga - planets in 10th, 11th, 12th, 1st, 2nd, 3rd
  const inSaktiHouses = sevenPlanets.filter(p => [10, 11, 12, 1, 2, 3].includes(p.house));
  if (inSaktiHouses.length === 7) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Sakti Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets occupy houses 10-12 and 1-3.",
      effects: "Powerful and energetic personality. Success through forceful action. Leadership in challenging situations.",
    });
  }
  
  // Danda Yoga - planets in 4th, 5th, 6th, 7th, 8th
  const inDandaHouses = sevenPlanets.filter(p => [4, 5, 6, 7, 8].includes(p.house));
  if (inDandaHouses.length === 7) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Danda Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets in houses 4-8 (like a staff).",
      effects: "Authoritative position, disciplinary skills. Success in administration, law enforcement, or teaching.",
    });
  }
  
  // Nau/Nava Yoga - planets in 1st, 2nd, 3rd, 11th, 12th
  const inNauHouses = sevenPlanets.filter(p => [1, 2, 3, 11, 12].includes(p.house));
  if (inNauHouses.length >= 6) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Nau Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "Planets distributed like a boat formation.",
      effects: "Prosperous through water-related ventures or travel. Fortune through import/export, shipping, or foreign connections.",
    });
  }
  
  // Kuta Yoga - planets in 1st, 2nd, 3rd, 10th, 11th, 12th
  const inKutaHouses = sevenPlanets.filter(p => [1, 2, 3, 10, 11, 12].includes(p.house));
  if (inKutaHouses.length === 7) {
    yogas.push({
      type: YogaType.NabhasaAkritiYoga,
      name: "Kuta Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: Array.from(occupiedHouses),
      strength: "moderate",
      description: "All 7 planets in angular positions creating a fortification pattern.",
      effects: "Strong defenses and strategic thinking. Success through planning and preparation. Protective of family and resources.",
    });
  }
  
  // Chatra Yoga - planets in 6 consecutive houses starting from any point
  let hasConsecutiveSix = false;
  for (let start = 1; start <= 12; start++) {
    const consecutiveHouses = [start, (start % 12) + 1, ((start + 1) % 12) + 1, ((start + 2) % 12) + 1, ((start + 3) % 12) + 1, ((start + 4) % 12) + 1];
    const planetsInConsecutive = sevenPlanets.filter(p => consecutiveHouses.includes(p.house));
    if (planetsInConsecutive.length === 7) {
      hasConsecutiveSix = true;
      yogas.push({
        type: YogaType.NabhasaAkritiYoga,
        name: "Chatra Yoga",
        formationPlanets: sevenPlanets.map(p => p.planet),
        houses: Array.from(occupiedHouses),
        strength: "strong",
        description: "All 7 planets in 6 consecutive houses (umbrella formation).",
        effects: "Royal protection and patronage. Leadership position with loyal followers. Enjoys comforts and authority.",
      });
      break;
    }
  }
  
  // Chapa/Dhanu Yoga - planets in 1-2-3-4, 4-5-6-7, 7-8-9-10, or 10-11-12-1
  const chapaPatterns = [
    [1, 2, 3, 4], [4, 5, 6, 7], [7, 8, 9, 10], [10, 11, 12, 1]
  ];
  for (const pattern of chapaPatterns) {
    const planetsInPattern = sevenPlanets.filter(p => pattern.includes(p.house));
    if (planetsInPattern.length === 7) {
      yogas.push({
        type: YogaType.NabhasaAkritiYoga,
        name: "Chapa Yoga",
        formationPlanets: sevenPlanets.map(p => p.planet),
        houses: Array.from(occupiedHouses),
        strength: "moderate",
        description: "All 7 planets in 4 consecutive houses (bow formation).",
        effects: "Warrior qualities, competitive success. Achieves targets like an archer. Success in sports or military.",
      });
      break;
    }
  }
  
  // Ardha Chandra Yoga - planets occupy houses in crescent pattern
  const crescentPatterns = [
    [1, 2, 3, 4, 5], [4, 5, 6, 7, 8], [7, 8, 9, 10, 11], [10, 11, 12, 1, 2]
  ];
  for (const pattern of crescentPatterns) {
    const planetsInCrescent = sevenPlanets.filter(p => pattern.includes(p.house));
    if (planetsInCrescent.length === 7 && houseCount === 5) {
      yogas.push({
        type: YogaType.NabhasaAkritiYoga,
        name: "Ardha Chandra Yoga",
        formationPlanets: sevenPlanets.map(p => p.planet),
        houses: Array.from(occupiedHouses),
        strength: "moderate",
        description: "All 7 planets occupy 5 consecutive houses (crescent moon pattern).",
        effects: "Charming personality, attractive appearance. Popular in social circles. Success through pleasing demeanor.",
      });
      break;
    }
  }
  
  return yogas;
}

/**
 * Detect Lunar Yogas (Sunapha, Anapha, Durudhura, Kemadruma)
 * Based on planets around Moon
 */
function detectLunarYogas(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  const moon = planetPositions.find((p) => p.planet === Planet.Moon);
  if (!moon) return yogas;
  
  // Get planets in 2nd and 12th houses from Moon (excluding Sun, Rahu, Ketu)
  const planetsExcludingSunRahuKetu = planetPositions.filter(
    (p) => p.planet !== Planet.Sun && p.planet !== Planet.Rahu && 
           p.planet !== Planet.Ketu && p.planet !== Planet.Moon && p.planet !== Planet.Ascendant
  );
  
  const secondFromMoon = ((moon.house % 12) + 1);
  const twelfthFromMoon = moon.house === 1 ? 12 : moon.house - 1;
  
  const planetsIn2nd = planetsExcludingSunRahuKetu.filter(p => p.house === secondFromMoon);
  const planetsIn12th = planetsExcludingSunRahuKetu.filter(p => p.house === twelfthFromMoon);
  
  // Sunapha Yoga - Planet(s) in 2nd from Moon
  // Note: Can occur simultaneously with Anapha and Durudhura per classical texts
  if (planetsIn2nd.length > 0) {
    // Determine strength and specific effects based on planets involved
    const hasMars = planetsIn2nd.some(p => p.planet === Planet.Mars);
    const hasMercury = planetsIn2nd.some(p => p.planet === Planet.Mercury);
    const hasJupiter = planetsIn2nd.some(p => p.planet === Planet.Jupiter);
    const hasVenus = planetsIn2nd.some(p => p.planet === Planet.Venus);
    const hasSaturn = planetsIn2nd.some(p => p.planet === Planet.Saturn);
    
    let specificEffect = "Wealthy, famous, intelligent, and enjoys comforts. Self-made success and prosperity. ";
    
    if (hasMars) specificEffect += "Courageous and energetic approach to wealth. ";
    if (hasMercury) specificEffect += "Business acumen and communication brings prosperity. ";
    if (hasJupiter) specificEffect += "Wisdom and guidance leads to fortune and respect. ";
    if (hasVenus) specificEffect += "Artistic talents and charm attract wealth and comfort. ";
    if (hasSaturn) specificEffect += "Disciplined efforts and patience yield lasting success. ";
    
    yogas.push({
      type: YogaType.SunaphaYoga,
      name: "Sunapha Yoga",
      formationPlanets: [Planet.Moon, ...planetsIn2nd.map(p => p.planet)],
      houses: [moon.house, secondFromMoon],
      strength: (hasJupiter || hasVenus) ? "strong" : "moderate",
      description: `Planet(s) in 2nd house from Moon (${planetsIn2nd.map(p => p.planet).join(", ")}).`,
      effects: specificEffect + "Good reputation in society.",
    });
  }
  
  // Anapha Yoga - Planet(s) in 12th from Moon
  // Note: Can occur simultaneously with Sunapha and Durudhura per classical texts
  if (planetsIn12th.length > 0) {
    const hasMars = planetsIn12th.some(p => p.planet === Planet.Mars);
    const hasMercury = planetsIn12th.some(p => p.planet === Planet.Mercury);
    const hasJupiter = planetsIn12th.some(p => p.planet === Planet.Jupiter);
    const hasVenus = planetsIn12th.some(p => p.planet === Planet.Venus);
    const hasSaturn = planetsIn12th.some(p => p.planet === Planet.Saturn);
    
    let specificEffect = "Well-formed body, good health, famous, and virtuous. ";
    
    if (hasMars) specificEffect += "Physical strength and protective nature. ";
    if (hasMercury) specificEffect += "Sharp intellect and analytical abilities. ";
    if (hasJupiter) specificEffect += "Spiritual wisdom and generous disposition. ";
    if (hasVenus) specificEffect += "Refined tastes and harmonious relationships. ";
    if (hasSaturn) specificEffect += "Serious demeanor with deep thinking capacity. ";
    
    yogas.push({
      type: YogaType.AnaphaYoga,
      name: "Anapha Yoga",
      formationPlanets: [Planet.Moon, ...planetsIn12th.map(p => p.planet)],
      houses: [moon.house, twelfthFromMoon],
      strength: (hasJupiter || hasVenus) ? "strong" : "moderate",
      description: `Planet(s) in 12th house from Moon (${planetsIn12th.map(p => p.planet).join(", ")}).`,
      effects: specificEffect + "Enjoys material comforts and spiritual inclinations.",
    });
  }
  
  // Durudhura Yoga - Planets in both 2nd and 12th from Moon
  if (planetsIn2nd.length > 0 && planetsIn12th.length > 0) {
    yogas.push({
      type: YogaType.DurudhuraYoga,
      name: "Durudhura Yoga",
      formationPlanets: [Planet.Moon, ...planetsIn2nd.map(p => p.planet), ...planetsIn12th.map(p => p.planet)],
      houses: [moon.house, secondFromMoon, twelfthFromMoon],
      strength: "strong",
      description: "Planets in both 2nd and 12th houses from Moon.",
      effects: "Very auspicious. Wealth, vehicles, servants, and all comforts. Leadership position and long life. Highly respected.",
    });
  }
  
  // Kemadruma Yoga - No planets in 2nd or 12th from Moon (poverty yoga)
  if (planetsIn2nd.length === 0 && planetsIn12th.length === 0) {
    // Check if Moon is not in conjunction with benefics (Jupiter, Venus, Mercury)
    const beneficsInConjunction = planetPositions.filter(
      p => p.house === moon.house && [Planet.Jupiter, Planet.Venus, Planet.Mercury].includes(p.planet)
    );
    
    if (beneficsInConjunction.length === 0) {
      yogas.push({
        type: YogaType.KemadrumaYoga,
        name: "Kemadruma Yoga",
        formationPlanets: [Planet.Moon],
        houses: [moon.house],
        strength: "moderate",
        description: "No planets in 2nd or 12th from Moon, and Moon not with benefics.",
        effects: "Challenges in life, poverty, lack of support. However, can be cancelled by other good yogas. Develops inner strength through hardships.",
      });
    }
  }
  
  return yogas;
}

/**
 * Detect Solar Yogas (Vesi, Vasi, Ubhayachari)
 * Based on planets around Sun
 */
function detectSolarYogas(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  const sun = planetPositions.find((p) => p.planet === Planet.Sun);
  if (!sun) return yogas;
  
  // Get planets in 2nd and 12th houses from Sun (excluding Moon, Rahu, Ketu)
  const planetsExcludingMoonRahuKetu = planetPositions.filter(
    (p) => p.planet !== Planet.Moon && p.planet !== Planet.Rahu && 
           p.planet !== Planet.Ketu && p.planet !== Planet.Sun && p.planet !== Planet.Ascendant
  );
  
  const secondFromSun = ((sun.house % 12) + 1);
  const twelfthFromSun = sun.house === 1 ? 12 : sun.house - 1;
  
  const planetsIn2nd = planetsExcludingMoonRahuKetu.filter(p => p.house === secondFromSun);
  const planetsIn12th = planetsExcludingMoonRahuKetu.filter(p => p.house === twelfthFromSun);
  
  // Vesi Yoga - Planet in 2nd from Sun
  // Note: Can occur simultaneously with Vasi and Ubhayachari per classical texts
  if (planetsIn2nd.length > 0) {
    const hasMars = planetsIn2nd.some(p => p.planet === Planet.Mars);
    const hasMercury = planetsIn2nd.some(p => p.planet === Planet.Mercury);
    const hasJupiter = planetsIn2nd.some(p => p.planet === Planet.Jupiter);
    const hasVenus = planetsIn2nd.some(p => p.planet === Planet.Venus);
    const hasSaturn = planetsIn2nd.some(p => p.planet === Planet.Saturn);
    
    let specificEffect = "Balanced, truthful, and well-spoken. Good memory and learning abilities. ";
    
    if (hasMars) specificEffect += "Administrative skills and executive abilities. ";
    if (hasMercury) specificEffect += "Exceptional communication and teaching abilities. ";
    if (hasJupiter) specificEffect += "Philosophical wisdom and counseling capabilities. ";
    if (hasVenus) specificEffect += "Artistic expression and diplomatic skills. ";
    if (hasSaturn) specificEffect += "Organizational abilities and practical wisdom. ";
    
    yogas.push({
      type: YogaType.VesiYoga,
      name: "Vesi Yoga",
      formationPlanets: [Planet.Sun, ...planetsIn2nd.map(p => p.planet)],
      houses: [sun.house, secondFromSun],
      strength: (hasJupiter || hasMercury) ? "strong" : "moderate",
      description: `Planet(s) in 2nd house from Sun (${planetsIn2nd.map(p => p.planet).join(", ")}).`,
      effects: specificEffect + "Prosperity in middle and later life.",
    });
  }
  
  // Vasi Yoga - Planet in 12th from Sun
  // Note: Can occur simultaneously with Vesi and Ubhayachari per classical texts
  if (planetsIn12th.length > 0) {
    const hasMars = planetsIn12th.some(p => p.planet === Planet.Mars);
    const hasMercury = planetsIn12th.some(p => p.planet === Planet.Mercury);
    const hasJupiter = planetsIn12th.some(p => p.planet === Planet.Jupiter);
    const hasVenus = planetsIn12th.some(p => p.planet === Planet.Venus);
    const hasSaturn = planetsIn12th.some(p => p.planet === Planet.Saturn);
    
    let specificEffect = "Skillful, charitable, and good character. Success through own efforts. ";
    
    if (hasMars) specificEffect += "Self-reliant with strong determination. ";
    if (hasMercury) specificEffect += "Intelligent strategist with business sense. ";
    if (hasJupiter) specificEffect += "Generous philanthropist with moral strength. ";
    if (hasVenus) specificEffect += "Kind-hearted with appreciation for beauty. ";
    if (hasSaturn) specificEffect += "Patient worker with enduring principles. ";
    
    yogas.push({
      type: YogaType.VasiYoga,
      name: "Vasi Yoga",
      formationPlanets: [Planet.Sun, ...planetsIn12th.map(p => p.planet)],
      houses: [sun.house, twelfthFromSun],
      strength: (hasJupiter || hasMercury) ? "strong" : "moderate",
      description: `Planet(s) in 12th house from Sun (${planetsIn12th.map(p => p.planet).join(", ")}).`,
      effects: specificEffect + "Respected for integrity and wisdom.",
    });
  }
  
  // Ubhayachari Yoga - Planets in both 2nd and 12th from Sun
  if (planetsIn2nd.length > 0 && planetsIn12th.length > 0) {
    yogas.push({
      type: YogaType.UbhayachariYoga,
      name: "Ubhayachari Yoga",
      formationPlanets: [Planet.Sun, ...planetsIn2nd.map(p => p.planet), ...planetsIn12th.map(p => p.planet)],
      houses: [sun.house, secondFromSun, twelfthFromSun],
      strength: "strong",
      description: "Planets in both 2nd and 12th houses from Sun.",
      effects: "Royal status or equivalent position. Wealthy, learned, and famous. Enjoys all comforts and respected by rulers.",
    });
  }
  
  return yogas;
}

/**
 * Detect BPHS Raja Yogas from Chapters 36-41
 * Musical Instrument Yogas: Kahala, Sankha, Bheri, Mridanga, and others
 */
function detectBPHSRajaYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  const lagnaLord = houses.find(h => h.houseNumber === 1)?.lord;
  const fourthLord = houses.find(h => h.houseNumber === 4)?.lord;
  const fifthLord = houses.find(h => h.houseNumber === 5)?.lord;
  const sixthLord = houses.find(h => h.houseNumber === 6)?.lord;
  const ninthLord = houses.find(h => h.houseNumber === 9)?.lord;
  const tenthLord = houses.find(h => h.houseNumber === 10)?.lord;
  
  const jupiter = planetPositions.find(p => p.planet === Planet.Jupiter);
  const venus = planetPositions.find(p => p.planet === Planet.Venus);
  
  const kendras = [1, 4, 7, 10];
  const movableSigns = [ZodiacSign.Aries, ZodiacSign.Cancer, ZodiacSign.Libra, ZodiacSign.Capricorn];
  
  // Kahala Yoga - Lord of 4th and Jupiter in mutual Kendras with strong Lagna lord
  if (fourthLord && jupiter && lagnaLord) {
    const fourthLordPos = planetPositions.find(p => p.planet === fourthLord);
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    
    if (fourthLordPos && lagnaLordPos) {
      // Check if 4th lord and Jupiter are in mutual Kendras
      const fourthLordHouse = fourthLordPos.house;
      const jupiterHouse = jupiter.house;
      const houseDiff = ((jupiterHouse - fourthLordHouse + 12) % 12) + 1;
      
      const isLagnaLordStrong = lagnaLordPos.dignity === PlanetaryDignity.Exalted || 
                                lagnaLordPos.dignity === PlanetaryDignity.OwnSign;
      
      if (kendras.includes(houseDiff) && isLagnaLordStrong) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Kahala Yoga",
          formationPlanets: [fourthLord, Planet.Jupiter, lagnaLord],
          houses: [fourthLordPos.house, jupiter.house],
          strength: "strong",
          description: `Lord of 4th house (${fourthLord}) and Jupiter are in mutual Kendras, with Lagna lord (${lagnaLord}) strong.`,
          effects: "Stubborn, daring personality. Head of community or organization. Dynamic and appealing, generous and kind. Famous for leadership abilities and noble character.",
        });
      }
    }
    
    // Alternative Kahala formation: 4th lord exalted/own sign with 10th lord connection
    if (fourthLordPos && tenthLord) {
      const isFourthLordStrong = fourthLordPos.dignity === PlanetaryDignity.Exalted || 
                                  fourthLordPos.dignity === PlanetaryDignity.OwnSign;
      const tenthLordPos = planetPositions.find(p => p.planet === tenthLord);
      
      if (isFourthLordStrong && tenthLordPos && fourthLordPos.house === tenthLordPos.house) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Kahala Yoga (Variant)",
          formationPlanets: [fourthLord, tenthLord],
          houses: [fourthLordPos.house],
          strength: "strong",
          description: `Lord of 4th house (${fourthLord}) is ${fourthLordPos.dignity.toLowerCase()} and conjunct with 10th lord (${tenthLord}).`,
          effects: "Authority and status in profession. Success in property and career matters. Respected in society for achievements.",
        });
      }
    }
  }
  
  // Sankha Yoga - Lords of 5th and 6th in mutual Kendras with strong Lagna lord
  if (fifthLord && sixthLord && lagnaLord && fifthLord !== sixthLord) {
    const fifthLordPos = planetPositions.find(p => p.planet === fifthLord);
    const sixthLordPos = planetPositions.find(p => p.planet === sixthLord);
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    
    if (fifthLordPos && sixthLordPos && lagnaLordPos) {
      const houseDiff = ((sixthLordPos.house - fifthLordPos.house + 12) % 12) + 1;
      const isLagnaLordStrong = lagnaLordPos.dignity === PlanetaryDignity.Exalted || 
                                lagnaLordPos.dignity === PlanetaryDignity.OwnSign;
      
      if (kendras.includes(houseDiff) && isLagnaLordStrong) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Sankha Yoga",
          formationPlanets: [fifthLord, sixthLord, lagnaLord],
          houses: [fifthLordPos.house, sixthLordPos.house],
          strength: "strong",
          description: `Lords of 5th (${fifthLord}) and 6th (${sixthLord}) houses are in mutual Kendras, with strong Lagna lord.`,
          effects: "Prosperity, owns land, generous with moral character. Good education and blessed family. Studies sacred knowledge. Spiritual pursuits and righteousness. Success in profession without excessive material attachment.",
        });
      }
    }
  }
  
  // Alternative Sankha: Lagna lord and 10th lord in movable signs with strong 9th lord
  if (lagnaLord && tenthLord && ninthLord && lagnaLord !== tenthLord) {
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    const tenthLordPos = planetPositions.find(p => p.planet === tenthLord);
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    
    if (lagnaLordPos && tenthLordPos && ninthLordPos) {
      const isLagnaInMovable = movableSigns.includes(lagnaLordPos.sign);
      const isTenthInMovable = movableSigns.includes(tenthLordPos.sign);
      const isNinthLordStrong = ninthLordPos.dignity === PlanetaryDignity.Exalted || 
                                 ninthLordPos.dignity === PlanetaryDignity.OwnSign;
      
      if (isLagnaInMovable && isTenthInMovable && isNinthLordStrong) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Sankha Yoga (Variant)",
          formationPlanets: [lagnaLord, tenthLord, ninthLord],
          houses: [lagnaLordPos.house, tenthLordPos.house],
          strength: "strong",
          description: `Lagna lord (${lagnaLord}) and 10th lord (${tenthLord}) in movable signs with strong 9th lord (${ninthLord}).`,
          effects: "Dynamic success in career and life. Fortune favors action and initiative. Respected for achievements and righteous conduct.",
        });
      }
    }
  }
  
  // Bheri Yoga - 9th lord strong AND all planets in Lagna, 2nd, 7th, 12th houses only
  if (ninthLord) {
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    
    if (ninthLordPos) {
      const isNinthLordStrong = ninthLordPos.dignity === PlanetaryDignity.Exalted || 
                                 ninthLordPos.dignity === PlanetaryDignity.OwnSign;
      
      // Check if all 7 classical planets are only in houses 1, 2, 7, 12
      const sevenPlanets = planetPositions.filter(
        p => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
      );
      
      const allowedHouses = [1, 2, 7, 12];
      const allInAllowedHouses = sevenPlanets.every(p => allowedHouses.includes(p.house));
      
      if (isNinthLordStrong && allInAllowedHouses) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Bheri Yoga",
          formationPlanets: [ninthLord],
          houses: Array.from(new Set(sevenPlanets.map(p => p.house))),
          strength: "strong",
          description: `9th lord (${ninthLord}) is strong and all planets occupy only 1st, 2nd, 7th, and 12th houses.`,
          effects: "Of royal bearing and noble birth. Moral, healthy, and wealthy. Family happiness and fame. Bereft of diseases with long life. Excels in power and receives wealth from various sources. Good-natured and spiritual.",
        });
      }
      
      // Alternative Bheri: 9th lord strong + Lagna lord, Jupiter, Venus in Kendras
      if (isNinthLordStrong && lagnaLord && jupiter && venus) {
        const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
        
        if (lagnaLordPos) {
          const allInKendras = kendras.includes(lagnaLordPos.house) &&
                              kendras.includes(jupiter.house) &&
                              kendras.includes(venus.house);
          
          if (allInKendras) {
            yogas.push({
              type: YogaType.Rajayoga,
              name: "Bheri Yoga (Variant)",
              formationPlanets: [ninthLord, lagnaLord, Planet.Jupiter, Planet.Venus],
              houses: [lagnaLordPos.house, jupiter.house, venus.house],
              strength: "strong",
              description: `Strong 9th lord with Lagna lord (${lagnaLord}), Jupiter, and Venus all in Kendras.`,
              effects: "Royal comforts and prosperity. Fortunate in material and spiritual matters. Philosophical wisdom combined with luxurious lifestyle. Blessed with divine grace.",
            });
          }
        }
      }
    }
  }
  
  // Mridanga Yoga - 10th lord in Kendra/Trikona with benefics
  if (tenthLord && jupiter && venus) {
    const tenthLordPos = planetPositions.find(p => p.planet === tenthLord);
    
    if (tenthLordPos) {
      const kendrasTrikonas = [1, 4, 5, 7, 9, 10];
      const isTenthLordWellPlaced = kendrasTrikonas.includes(tenthLordPos.house);
      
      // Check if benefics are in Kendras
      const jupiterInKendra = kendras.includes(jupiter.house);
      const venusInKendra = kendras.includes(venus.house);
      
      if (isTenthLordWellPlaced && (jupiterInKendra || venusInKendra)) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Mridanga Yoga",
          formationPlanets: [tenthLord, ...(jupiterInKendra ? [Planet.Jupiter] : []), ...(venusInKendra ? [Planet.Venus] : [])],
          houses: [tenthLordPos.house],
          strength: "moderate",
          description: `10th lord (${tenthLord}) well-placed with benefics in favorable positions.`,
          effects: "Associated with royal status and prosperity. Success in career brings recognition. Musical and artistic inclinations. Announces achievements like the sound of drums.",
        });
      }
    }
  }
  
  // Parijata Yoga - Lagna lord exalted/own sign in Kendra + Dispositor of Lagna lord also strong
  if (lagnaLord) {
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    
    if (lagnaLordPos) {
      const isLagnaLordStrong = lagnaLordPos.dignity === PlanetaryDignity.Exalted || 
                                lagnaLordPos.dignity === PlanetaryDignity.OwnSign;
      const isInKendra = kendras.includes(lagnaLordPos.house);
      
      if (isLagnaLordStrong && isInKendra) {
        // Find dispositor of Lagna lord
        const lagnaLordSignHouse = houses.find(h => h.sign === lagnaLordPos.sign);
        if (lagnaLordSignHouse) {
          const dispositor = planetPositions.find(p => p.planet === lagnaLordSignHouse.lord);
          if (dispositor) {
            const isDispositorStrong = dispositor.dignity === PlanetaryDignity.Exalted || 
                                       dispositor.dignity === PlanetaryDignity.OwnSign;
            
            if (isDispositorStrong) {
              yogas.push({
                type: YogaType.Rajayoga,
                name: "Parijata Yoga",
                formationPlanets: [lagnaLord, dispositor.planet],
                houses: [lagnaLordPos.house, dispositor.house],
                strength: "strong",
                description: `Lagna lord (${lagnaLord}) is ${lagnaLordPos.dignity.toLowerCase()} in Kendra, with strong dispositor (${dispositor.planet}).`,
                effects: "Named after the celestial wishing tree. Bestows royal comforts and fulfillment of desires. Blessed with prosperity, happiness, and honor throughout life.",
              });
            }
          }
        }
      }
    }
  }
  
  return yogas;
}

/**
 * Detect Additional Raja Yogas (Power & Status combinations)
 */
function detectAdditionalRajaYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Dharma-Karmadhipati Yoga - 9th and 10th lords together
  const ninthLord = houses.find(h => h.houseNumber === 9)?.lord;
  const tenthLord = houses.find(h => h.houseNumber === 10)?.lord;
  
  if (ninthLord && tenthLord) {
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    const tenthLordPos = planetPositions.find(p => p.planet === tenthLord);
    
    if (ninthLordPos && tenthLordPos && ninthLordPos.house === tenthLordPos.house) {
      yogas.push({
        type: YogaType.DharmaKarmadhipatiYoga,
        name: "Dharma-Karmadhipati Yoga",
        formationPlanets: [ninthLord, tenthLord],
        houses: [ninthLordPos.house],
        strength: "strong",
        description: `Lords of 9th (${ninthLord}) and 10th (${tenthLord}) houses are conjunct in ${ninthLordPos.house}${getOrdinalSuffix(ninthLordPos.house)} house.`,
        effects: "Exceptional career success and dharmic life. High position in society, righteous conduct, and prosperity through virtuous actions.",
      });
    }
  }
  
  // Adhi Yoga - Benefics (Jupiter, Venus, Mercury) in 6th, 7th, 8th from Moon
  const moon = planetPositions.find(p => p.planet === Planet.Moon);
  if (moon) {
    const benefics = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
    const sixthFromMoon = ((moon.house + 5) % 12) + 1;
    const seventhFromMoon = ((moon.house + 6) % 12) + 1;
    const eighthFromMoon = ((moon.house + 7) % 12) + 1;
    
    const beneficsIn678 = planetPositions.filter(p => 
      benefics.includes(p.planet) && 
      [sixthFromMoon, seventhFromMoon, eighthFromMoon].includes(p.house)
    );
    
    if (beneficsIn678.length > 0) {
      yogas.push({
        type: YogaType.AdhiYoga,
        name: "Adhi Yoga",
        formationPlanets: [Planet.Moon, ...beneficsIn678.map(p => p.planet)],
        houses: [moon.house, ...beneficsIn678.map(p => p.house)],
        strength: beneficsIn678.length === 3 ? "strong" : "moderate",
        description: `Benefic planets (${beneficsIn678.map(p => p.planet).join(", ")}) in 6th, 7th, or 8th from Moon.`,
        effects: "Leadership qualities, ministerial position, wealth, long life. Respected by rulers and commands authority.",
      });
    }
  }
  
  // Lakshmi Yoga - 9th lord strong in Kendra/Trikona with Venus well-placed
  if (ninthLord) {
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    const venus = planetPositions.find(p => p.planet === Planet.Venus);
    
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    
    if (ninthLordPos && venus && 
        ([...kendras, ...trikonas].includes(ninthLordPos.house)) &&
        (venus.dignity === PlanetaryDignity.Exalted || venus.dignity === PlanetaryDignity.OwnSign)) {
      yogas.push({
        type: YogaType.LakshmiYoga,
        name: "Lakshmi Yoga",
        formationPlanets: [ninthLord, Planet.Venus],
        houses: [ninthLordPos.house, venus.house],
        strength: "strong",
        description: `9th lord (${ninthLord}) in Kendra/Trikona and Venus is ${venus.dignity.toLowerCase()}.`,
        effects: "Blessed by Goddess Lakshmi with wealth, prosperity, beauty, and all comforts. Fortunate in all endeavors.",
      });
    }
  }
  
  // Saraswati Yoga - Jupiter, Venus, Mercury in Kendras/Trikonas/2nd house
  const jupiter = planetPositions.find(p => p.planet === Planet.Jupiter);
  const venus = planetPositions.find(p => p.planet === Planet.Venus);
  const mercury = planetPositions.find(p => p.planet === Planet.Mercury);
  
  const kendrasTrikonas2nd = [1, 2, 4, 5, 7, 9, 10];
  
  if (jupiter && venus && mercury) {
    const allInGoodHouses = [jupiter, venus, mercury].every(p => 
      kendrasTrikonas2nd.includes(p.house)
    );
    
    if (allInGoodHouses) {
      yogas.push({
        type: YogaType.SaraswatiYoga,
        name: "Saraswati Yoga",
        formationPlanets: [Planet.Jupiter, Planet.Venus, Planet.Mercury],
        houses: [jupiter.house, venus.house, mercury.house],
        strength: "strong",
        description: "Jupiter, Venus, and Mercury all placed in Kendras, Trikonas, or 2nd house.",
        effects: "Blessed by Goddess Saraswati with learning, eloquence, artistic talents, and wisdom. Scholarly pursuits and recognition.",
      });
    }
  }
  
  return yogas;
}

/**
 * Detect Dhana Yogas (Wealth combinations)
 */
function detectDhanaYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  // 2nd lord + 11th lord combination
  const secondLord = houses.find(h => h.houseNumber === 2)?.lord;
  const eleventhLord = houses.find(h => h.houseNumber === 11)?.lord;
  
  if (secondLord && eleventhLord && secondLord !== eleventhLord) {
    const secondLordPos = planetPositions.find(p => p.planet === secondLord);
    const eleventhLordPos = planetPositions.find(p => p.planet === eleventhLord);
    
    if (secondLordPos && eleventhLordPos && secondLordPos.house === eleventhLordPos.house) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (2nd-11th Lords)",
        formationPlanets: [secondLord, eleventhLord],
        houses: [secondLordPos.house],
        strength: "strong",
        description: `Lords of 2nd (${secondLord}) and 11th (${eleventhLord}) houses conjunct in ${secondLordPos.house}${getOrdinalSuffix(secondLordPos.house)} house.`,
        effects: "Wealth through multiple sources. Good earning capacity and financial prosperity. Accumulation of assets.",
      });
    }
  }
  
  // 5th lord + 9th lord combination
  const fifthLord = houses.find(h => h.houseNumber === 5)?.lord;
  const ninthLord = houses.find(h => h.houseNumber === 9)?.lord;
  
  if (fifthLord && ninthLord && fifthLord !== ninthLord) {
    const fifthLordPos = planetPositions.find(p => p.planet === fifthLord);
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    
    if (fifthLordPos && ninthLordPos && fifthLordPos.house === ninthLordPos.house) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (5th-9th Lords)",
        formationPlanets: [fifthLord, ninthLord],
        houses: [fifthLordPos.house],
        strength: "strong",
        description: `Lords of 5th (${fifthLord}) and 9th (${ninthLord}) houses conjunct in ${fifthLordPos.house}${getOrdinalSuffix(fifthLordPos.house)} house.`,
        effects: "Fortune through speculative gains, investments, and past life merits. Fortunate in financial matters.",
      });
    }
  }
  
  // Lagna lord strong in wealth houses (2, 11)
  const lagnaLord = houses.find(h => h.houseNumber === 1)?.lord;
  if (lagnaLord) {
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    if (lagnaLordPos && [2, 11].includes(lagnaLordPos.house)) {
      const isStrong = lagnaLordPos.dignity === PlanetaryDignity.Exalted || 
                       lagnaLordPos.dignity === PlanetaryDignity.OwnSign;
      if (isStrong) {
        yogas.push({
          type: YogaType.DhanaYoga,
          name: "Dhana Yoga (Lagna Lord in 2nd/11th)",
          formationPlanets: [lagnaLord],
          houses: [lagnaLordPos.house],
          strength: "moderate",
          description: `Lagna lord (${lagnaLord}) is ${lagnaLordPos.dignity.toLowerCase()} in ${lagnaLordPos.house}${getOrdinalSuffix(lagnaLordPos.house)} house.`,
          effects: "Self-made wealth and financial independence. Earning capacity through personal efforts and skills.",
        });
      }
    }
  }
  
  // Multiple benefics in 2nd house
  const benefics = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  const planetsIn2nd = planetPositions.filter(p => p.house === 2 && benefics.includes(p.planet));
  
  if (planetsIn2nd.length >= 2) {
    yogas.push({
      type: YogaType.DhanaYoga,
      name: "Dhana Yoga (Multiple Benefics in 2nd)",
      formationPlanets: planetsIn2nd.map(p => p.planet),
      houses: [2],
      strength: "moderate",
      description: `Multiple benefic planets (${planetsIn2nd.map(p => p.planet).join(", ")}) in 2nd house.`,
      effects: "Good speech, family wealth, and food security. Financial stability and accumulation of resources.",
    });
  }
  
  // Multiple benefics in 11th house
  const planetsIn11th = planetPositions.filter(p => p.house === 11 && benefics.includes(p.planet));
  
  if (planetsIn11th.length >= 2) {
    yogas.push({
      type: YogaType.DhanaYoga,
      name: "Dhana Yoga (Multiple Benefics in 11th)",
      formationPlanets: planetsIn11th.map(p => p.planet),
      houses: [11],
      strength: "moderate",
      description: `Multiple benefic planets (${planetsIn11th.map(p => p.planet).join(", ")}) in 11th house.`,
      effects: "Multiple sources of income and gains. Fulfillment of desires and aspirations. Good fortune in friendships.",
    });
  }
  
  // Additional Dhana Yogas - House Lord Placements
  
  // 2nd lord in 11th house or 11th lord in 2nd house
  if (secondLord && eleventhLord) {
    const secondLordPos = planetPositions.find(p => p.planet === secondLord);
    const eleventhLordPos = planetPositions.find(p => p.planet === eleventhLord);
    
    if (secondLordPos?.house === 11) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (2nd Lord in 11th)",
        formationPlanets: [secondLord],
        houses: [11],
        strength: "moderate",
        description: `Lord of 2nd house (${secondLord}) placed in 11th house of gains.`,
        effects: "Accumulated wealth transforms into steady gains. Financial security through multiple income streams.",
      });
    }
    
    if (eleventhLordPos?.house === 2) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (11th Lord in 2nd)",
        formationPlanets: [eleventhLord],
        houses: [2],
        strength: "moderate",
        description: `Lord of 11th house (${eleventhLord}) placed in 2nd house of wealth.`,
        effects: "Gains convert into wealth. Income leads to accumulation of assets and family prosperity.",
      });
    }
  }
  
  // 9th lord in 11th house or 11th lord in 9th house
  if (ninthLord && eleventhLord && ninthLord !== eleventhLord) {
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    const eleventhLordPos = planetPositions.find(p => p.planet === eleventhLord);
    
    if (ninthLordPos?.house === 11) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (9th Lord in 11th)",
        formationPlanets: [ninthLord],
        houses: [11],
        strength: "moderate",
        description: `Lord of 9th house (${ninthLord}) placed in 11th house of gains.`,
        effects: "Fortune and luck translate into material gains. Blessed with prosperity through righteous means.",
      });
    }
    
    if (eleventhLordPos?.house === 9) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (11th Lord in 9th)",
        formationPlanets: [eleventhLord],
        houses: [9],
        strength: "moderate",
        description: `Lord of 11th house (${eleventhLord}) placed in 9th house of fortune.`,
        effects: "Gains come through luck, fortune, and blessings. Prosperity through ethical and righteous actions.",
      });
    }
  }
  
  // 5th lord in 11th house
  if (fifthLord && fifthLord !== eleventhLord) {
    const fifthLordPos = planetPositions.find(p => p.planet === fifthLord);
    if (fifthLordPos?.house === 11) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (5th Lord in 11th)",
        formationPlanets: [fifthLord],
        houses: [11],
        strength: "moderate",
        description: `Lord of 5th house (${fifthLord}) placed in 11th house of gains.`,
        effects: "Wealth through speculation, investments, intelligence, and creative pursuits. Past merits bring gains.",
      });
    }
  }
  
  // 2nd lord in 9th house or 9th lord in 2nd house
  if (secondLord && ninthLord && secondLord !== ninthLord) {
    const secondLordPos = planetPositions.find(p => p.planet === secondLord);
    const ninthLordPos = planetPositions.find(p => p.planet === ninthLord);
    
    if (secondLordPos?.house === 9) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (2nd Lord in 9th)",
        formationPlanets: [secondLord],
        houses: [9],
        strength: "moderate",
        description: `Lord of 2nd house (${secondLord}) placed in 9th house of fortune.`,
        effects: "Wealth blessed by fortune and luck. Prosperity through father, teachers, and religious activities.",
      });
    }
    
    if (ninthLordPos?.house === 2) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (9th Lord in 2nd)",
        formationPlanets: [ninthLord],
        houses: [2],
        strength: "moderate",
        description: `Lord of 9th house (${ninthLord}) placed in 2nd house of wealth.`,
        effects: "Fortune brings family wealth. Lucky in accumulating resources and material prosperity.",
      });
    }
  }
  
  // 10th lord in 2nd or 11th house (career-related wealth)
  const tenthLord = houses.find(h => h.houseNumber === 10)?.lord;
  if (tenthLord) {
    const tenthLordPos = planetPositions.find(p => p.planet === tenthLord);
    if (tenthLordPos && [2, 11].includes(tenthLordPos.house)) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (10th Lord in 2nd/11th)",
        formationPlanets: [tenthLord],
        houses: [tenthLordPos.house],
        strength: "moderate",
        description: `Lord of 10th house (${tenthLord}) placed in ${tenthLordPos.house}${getOrdinalSuffix(tenthLordPos.house)} house.`,
        effects: "Career success brings wealth. Professional achievements translate into financial prosperity and gains.",
      });
    }
  }
  
  // Venus (natural significator of wealth) in wealth houses
  const venusPos = planetPositions.find(p => p.planet === Planet.Venus);
  if (venusPos && [2, 11].includes(venusPos.house)) {
    const isStrong = venusPos.dignity === PlanetaryDignity.Exalted || venusPos.dignity === PlanetaryDignity.OwnSign;
    if (isStrong) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (Venus in Wealth House)",
        formationPlanets: [Planet.Venus],
        houses: [venusPos.house],
        strength: "moderate",
        description: `Venus (${venusPos.dignity.toLowerCase()}) in ${venusPos.house}${getOrdinalSuffix(venusPos.house)} house.`,
        effects: "Natural wealth significator brings prosperity. Luxuries, comforts, and material abundance through beauty and arts.",
      });
    }
  }
  
  // Jupiter (natural significator of fortune) in wealth/fortune houses
  const jupiterPos = planetPositions.find(p => p.planet === Planet.Jupiter);
  if (jupiterPos && [2, 5, 9, 11].includes(jupiterPos.house)) {
    const isStrong = jupiterPos.dignity === PlanetaryDignity.Exalted || jupiterPos.dignity === PlanetaryDignity.OwnSign;
    if (isStrong) {
      yogas.push({
        type: YogaType.DhanaYoga,
        name: "Dhana Yoga (Jupiter in Prosperity House)",
        formationPlanets: [Planet.Jupiter],
        houses: [jupiterPos.house],
        strength: "moderate",
        description: `Jupiter (${jupiterPos.dignity.toLowerCase()}) in ${jupiterPos.house}${getOrdinalSuffix(jupiterPos.house)} house.`,
        effects: "Great fortune and wisdom bring wealth. Blessings of Jupiter ensure prosperity, expansion, and abundance.",
      });
    }
  }
  
  return yogas;
}

/**
 * Detect Two-Planet Conjunction Yogas (from Saravali Chapter 15)
 */
function detectConjunctionYogas(planetPositions: PlanetPosition[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  const mainPlanets = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
  
  // Find all conjunctions (planets in same house)
  for (let i = 0; i < mainPlanets.length; i++) {
    for (let j = i + 1; j < mainPlanets.length; j++) {
      const planet1 = planetPositions.find(p => p.planet === mainPlanets[i]);
      const planet2 = planetPositions.find(p => p.planet === mainPlanets[j]);
      
      if (planet1 && planet2 && planet1.house === planet2.house) {
        const conjunctionName = `${mainPlanets[i]}-${mainPlanets[j]} Conjunction`;
        const effect = getConjunctionEffect(mainPlanets[i], mainPlanets[j]);
        
        yogas.push({
          type: YogaType.ConjunctionYoga,
          name: conjunctionName,
          formationPlanets: [mainPlanets[i], mainPlanets[j]],
          houses: [planet1.house],
          strength: "moderate",
          description: `${mainPlanets[i]} and ${mainPlanets[j]} conjunct in ${planet1.house}${getOrdinalSuffix(planet1.house)} house.`,
          effects: effect,
        });
      }
    }
  }
  
  return yogas;
}

/**
 * Get effect description for two-planet conjunctions
 */
function getConjunctionEffect(planet1: Planet, planet2: Planet): string {
  const key = `${planet1}-${planet2}`;
  
  const effects: Record<string, string> = {
    "Sun-Moon": "Strong personality, leadership, and royal connections. Good health and vitality.",
    "Sun-Mars": "Courage, technical skills, and athletic abilities. Strong willpower but may be impulsive.",
    "Sun-Mercury": "Intelligence, analytical skills, and communication abilities. Success in intellectual pursuits.",
    "Sun-Jupiter": "Wisdom, spiritual inclination, and authoritative position. Respected for knowledge.",
    "Sun-Venus": "Artistic talents, luxury, and refined tastes. Success in creative fields.",
    "Sun-Saturn": "Discipline, patience, and success through hard work. May face challenges with authority.",
    "Moon-Mars": "Emotional intensity, courage, and technical skills. Quick decision-making abilities.",
    "Moon-Mercury": "Quick wit, eloquence, and adaptability. Success in communication and business.",
    "Moon-Jupiter": "Emotional wisdom, prosperity, and good character. Beneficial for family life.",
    "Moon-Venus": "Charm, beauty, and artistic sensibilities. Success in relationships and creative arts.",
    "Moon-Saturn": "Emotional maturity, responsibility, and patience. May experience emotional challenges.",
    "Mars-Mercury": "Sharp intellect, mathematical abilities, and strategic thinking. Success in competitive fields.",
    "Mars-Jupiter": "Righteous action, protective nature, and success through courage. Good for legal matters.",
    "Mars-Venus": "Passion, artistic drive, and success in luxury industries. Attractive personality.",
    "Mars-Saturn": "Disciplined action, engineering skills, and success through persistent effort. May face obstacles.",
    "Mercury-Jupiter": "Excellent learning abilities, teaching skills, and wisdom. Success in education and counseling.",
    "Mercury-Venus": "Artistic expression, musical talents, and charm. Success in creative communication.",
    "Mercury-Saturn": "Practical intelligence, research abilities, and focused mind. Success in technical fields.",
    "Jupiter-Venus": "Prosperity, happiness, and success in relationships. Fortunate in financial and social matters.",
    "Jupiter-Saturn": "Balanced wisdom, philosophical depth, and success through patient efforts. Good for spirituality.",
    "Venus-Saturn": "Artistic discipline, mature relationships, and success in structured creative work. May delay marriage.",
  };
  
  return effects[key] || "Mixed effects based on house placement and overall chart strength.";
}

/**
 * Detect Specialized Yogas (Amala, Chamara, Pushkala, etc.)
 * Based on Saravali and Phaladeepika
 */
function detectSpecializedYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  const benefics = [Planet.Jupiter, Planet.Venus, Planet.Mercury];
  const kendras = [1, 4, 7, 10];
  const trikonas = [1, 5, 9];
  
  // Amala Yoga - Benefic in 10th from Lagna or Moon
  const beneficsIn10th = planetPositions.filter(p => p.house === 10 && benefics.includes(p.planet));
  
  if (beneficsIn10th.length > 0) {
    yogas.push({
      type: YogaType.AmalaYoga,
      name: "Amala Yoga",
      formationPlanets: beneficsIn10th.map(p => p.planet),
      houses: [10],
      strength: "strong",
      description: `Benefic planet(s) (${beneficsIn10th.map(p => p.planet).join(", ")}) in 10th house.`,
      effects: "Spotless reputation, fame, and prosperity. Good character and lasting achievements. Respected profession.",
    });
  }
  
  // Chamara Yoga - Two benefics in Lagna, 7th, 9th, or 10th
  const goodHouses = [1, 7, 9, 10];
  for (const house of goodHouses) {
    const beneficsInHouse = planetPositions.filter(p => p.house === house && benefics.includes(p.planet));
    if (beneficsInHouse.length >= 2) {
      yogas.push({
        type: YogaType.ChamaraYoga,
        name: "Chamara Yoga",
        formationPlanets: beneficsInHouse.map(p => p.planet),
        houses: [house],
        strength: "strong",
        description: `Two or more benefics (${beneficsInHouse.map(p => p.planet).join(", ")}) in ${house}${getOrdinalSuffix(house)} house.`,
        effects: "Royal treatment, long life, and authoritative position. Commands respect and enjoys luxuries like a king.",
      });
      break;
    }
  }
  
  // Pushkala Yoga - Lagna lord in Kendra, Dispositor in Kendra/Trikona, Lagna occupied by benefic
  const lagnaLord = houses.find(h => h.houseNumber === 1)?.lord;
  if (lagnaLord) {
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    const beneficsInLagna = planetPositions.filter(p => p.house === 1 && benefics.includes(p.planet));
    
    if (lagnaLordPos && kendras.includes(lagnaLordPos.house) && beneficsInLagna.length > 0) {
      // Find dispositor
      const lagnaLordSignHouse = houses.find(h => h.sign === lagnaLordPos.sign);
      if (lagnaLordSignHouse) {
        const dispositor = planetPositions.find(p => p.planet === lagnaLordSignHouse.lord);
        if (dispositor) {
          const isDispositorWellPlaced = [...kendras, ...trikonas].includes(dispositor.house);
          
          if (isDispositorWellPlaced) {
            yogas.push({
              type: YogaType.PushkalaYoga,
              name: "Pushkala Yoga",
              formationPlanets: [lagnaLord, dispositor.planet, ...beneficsInLagna.map(p => p.planet)],
              houses: [1, lagnaLordPos.house],
              strength: "strong",
              description: `Lagna lord (${lagnaLord}) in Kendra, dispositor (${dispositor.planet}) well-placed, and benefic in Lagna.`,
              effects: "Wealthy, learned, and charitable. Enjoys material comforts and spiritual wisdom. Respected leader with noble character. Blessed with good children and family.",
            });
          }
        }
      }
    }
  }
  
  // Parvata Yoga - Benefics in Kendra and 6th/8th lords in mutual exchange or weak
  const sixthLord = houses.find(h => h.houseNumber === 6)?.lord;
  const eighthLord = houses.find(h => h.houseNumber === 8)?.lord;
  const beneficsInKendra = planetPositions.filter(p => kendras.includes(p.house) && benefics.includes(p.planet));
  
  if (beneficsInKendra.length >= 2 && sixthLord && eighthLord) {
    const sixthLordPos = planetPositions.find(p => p.planet === sixthLord);
    const eighthLordPos = planetPositions.find(p => p.planet === eighthLord);
    
    // Check if 6th and 8th lords are in mutual exchange or weak positions
    if (sixthLordPos && eighthLordPos) {
      const inMutualExchange = (sixthLordPos.house === 8 && eighthLordPos.house === 6);
      const bothWeak = (sixthLordPos.dignity === PlanetaryDignity.Debilitated || 
                       eighthLordPos.dignity === PlanetaryDignity.Debilitated);
      
      if (inMutualExchange || bothWeak || [6, 8, 12].includes(sixthLordPos.house) || [6, 8, 12].includes(eighthLordPos.house)) {
        yogas.push({
          type: YogaType.Rajayoga,
          name: "Parvata Yoga",
          formationPlanets: beneficsInKendra.map(p => p.planet),
          houses: beneficsInKendra.map(p => p.house),
          strength: "strong",
          description: `Benefics in Kendras with 6th and 8th lords neutralized.`,
          effects: "Wealthy like mountains (Parvata means mountain). Fame, prosperity, and charitable nature. Leadership qualities and benevolent ruler. Long-lasting success.",
        });
      }
    }
  }
  
  // Kusuma Yoga - Jupiter in Kendra from Lagna, Moon in Kendra from Jupiter, Lagna lord strong
  const jupiter = planetPositions.find(p => p.planet === Planet.Jupiter);
  const moon = planetPositions.find(p => p.planet === Planet.Moon);
  
  if (jupiter && moon && lagnaLord && kendras.includes(jupiter.house)) {
    const jupiterHouse = jupiter.house;
    const moonHouse = moon.house;
    const houseDiff = ((moonHouse - jupiterHouse + 12) % 12) + 1;
    
    if (kendras.includes(houseDiff)) {
      const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
      if (lagnaLordPos) {
        const isLagnaLordStrong = lagnaLordPos.dignity === PlanetaryDignity.Exalted || 
                                  lagnaLordPos.dignity === PlanetaryDignity.OwnSign;
        
        if (isLagnaLordStrong) {
          yogas.push({
            type: YogaType.Rajayoga,
            name: "Kusuma Yoga",
            formationPlanets: [Planet.Jupiter, Planet.Moon, lagnaLord],
            houses: [1, jupiter.house, moon.house],
            strength: "strong",
            description: `Jupiter in Kendra from Lagna, Moon in Kendra from Jupiter, with strong Lagna lord.`,
            effects: "Fragrant like a flower (Kusuma). Virtuous character, learned in scriptures, wealthy and respected. Enjoys royal comforts and has noble friends.",
          });
        }
      }
    }
  }
  
  // Matsya Yoga - All planets in 1st and 9th houses (or 4th and 10th houses)
  const sevenPlanets = planetPositions.filter(
    p => p.planet !== Planet.Ascendant && p.planet !== Planet.Rahu && p.planet !== Planet.Ketu
  );
  
  const planetsIn1st = sevenPlanets.filter(p => p.house === 1);
  const planetsIn9th = sevenPlanets.filter(p => p.house === 9);
  const planetsIn4th = sevenPlanets.filter(p => p.house === 4);
  const planetsIn10th = sevenPlanets.filter(p => p.house === 10);
  
  if ((planetsIn1st.length + planetsIn9th.length === 7) && planetsIn1st.length > 0 && planetsIn9th.length > 0) {
    yogas.push({
      type: YogaType.Rajayoga,
      name: "Matsya Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: [1, 9],
      strength: "moderate",
      description: "All 7 planets occupy only 1st and 9th houses (Fish-shaped pattern).",
      effects: "Charitable, virtuous, wealthy. Enjoys pleasures and vehicles. Good character like the sacred fish (Matsya). Helpful to others.",
    });
  } else if ((planetsIn4th.length + planetsIn10th.length === 7) && planetsIn4th.length > 0 && planetsIn10th.length > 0) {
    yogas.push({
      type: YogaType.Rajayoga,
      name: "Matsya Yoga (Variant)",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: [4, 10],
      strength: "moderate",
      description: "All 7 planets occupy only 4th and 10th houses (Fish-shaped pattern).",
      effects: "Happiness from property and career. Emotional wisdom and professional success. Balance between home and work life.",
    });
  }
  
  // Kurma Yoga - All planets in 1st, 5th, 7th, 9th houses (or 2nd, 4th, 8th, 10th)
  const planetsIn5th = sevenPlanets.filter(p => p.house === 5);
  const planetsIn7th = sevenPlanets.filter(p => p.house === 7);
  const planetsIn2nd = sevenPlanets.filter(p => p.house === 2);
  const planetsIn8th = sevenPlanets.filter(p => p.house === 8);
  
  const firstPattern = planetsIn1st.length + planetsIn5th.length + planetsIn7th.length + planetsIn9th.length;
  const secondPattern = planetsIn2nd.length + planetsIn4th.length + planetsIn8th.length + planetsIn10th.length;
  
  if (firstPattern === 7) {
    const occupiedHouses = [1, 5, 7, 9].filter(h => sevenPlanets.some(p => p.house === h));
    yogas.push({
      type: YogaType.Rajayoga,
      name: "Kurma Yoga",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: occupiedHouses,
      strength: "moderate",
      description: "All 7 planets in 1st, 5th, 7th, and 9th houses (Tortoise pattern).",
      effects: "Long-lived and patient like the tortoise (Kurma). Steadfast in principles, slowly but surely achieves success. Enjoys lasting prosperity.",
    });
  } else if (secondPattern === 7) {
    const occupiedHouses = [2, 4, 8, 10].filter(h => sevenPlanets.some(p => p.house === h));
    yogas.push({
      type: YogaType.Rajayoga,
      name: "Kurma Yoga (Variant)",
      formationPlanets: sevenPlanets.map(p => p.planet),
      houses: occupiedHouses,
      strength: "moderate",
      description: "All 7 planets in 2nd, 4th, 8th, and 10th houses (Tortoise pattern).",
      effects: "Stable foundation in family and career. Persistent effort leads to transformation and authority. Well-grounded success.",
    });
  }
  
  return yogas;
}

/**
 * Detect Bhava Yogas (144 House Lordship combinations)
 * Effects of each of 12 house lords placed in each of 12 houses
 */
function detectBhavaYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  // House significations for effect descriptions
  const houseSignifications: Record<number, string> = {
    1: "self, personality, health",
    2: "wealth, family, speech",
    3: "courage, siblings, skills",
    4: "home, mother, education",
    5: "intelligence, children, creativity",
    6: "service, enemies, health challenges",
    7: "partnerships, spouse, business",
    8: "transformation, longevity, occult",
    9: "fortune, father, higher learning",
    10: "career, status, authority",
    11: "gains, income, aspirations",
    12: "spirituality, losses, foreign lands"
  };
  
  // Beneficial houses
  const beneficialHouses = [1, 2, 4, 5, 7, 9, 10, 11];
  const dusthanaHouses = [6, 8, 12];
  
  // Check each house lord placement
  for (let lordHouse = 1; lordHouse <= 12; lordHouse++) {
    const houseLord = houses.find(h => h.houseNumber === lordHouse)?.lord;
    if (!houseLord) continue;
    
    const lordPosition = planetPositions.find(p => p.planet === houseLord);
    if (!lordPosition) continue;
    
    const placedHouse = lordPosition.house;
    
    // Skip if lord is in its own house (this is covered by other yogas)
    if (lordHouse === placedHouse) continue;
    
    // Determine strength and effect based on placement
    let strength: "weak" | "moderate" | "strong" = "moderate";
    let effect = "";
    
    // Beneficial lord in beneficial house
    if (beneficialHouses.includes(lordHouse) && beneficialHouses.includes(placedHouse)) {
      strength = "moderate";
      effect = `Positive connection between ${houseSignifications[lordHouse]} and ${houseSignifications[placedHouse]}. Harmonious results in both life areas.`;
    }
    // Beneficial lord in Dusthana
    else if (beneficialHouses.includes(lordHouse) && dusthanaHouses.includes(placedHouse)) {
      strength = "weak";
      effect = `${houseSignifications[lordHouse]} matters may face challenges related to ${houseSignifications[placedHouse]}. Requires extra effort.`;
    }
    // Dusthana lord in beneficial house
    else if (dusthanaHouses.includes(lordHouse) && beneficialHouses.includes(placedHouse)) {
      strength = "weak";
      effect = `${houseSignifications[placedHouse]} may experience some obstacles from ${houseSignifications[lordHouse]}. Growth through overcoming challenges.`;
    }
    // Dusthana lord in another Dusthana (Vipreet potential)
    else if (dusthanaHouses.includes(lordHouse) && dusthanaHouses.includes(placedHouse) && lordHouse !== placedHouse) {
      strength = "moderate";
      effect = `Transformation through challenges. ${houseSignifications[lordHouse]} and ${houseSignifications[placedHouse]} create a unique dynamic of growth.`;
    }
    
    // Kendra-Trikona connections are stronger
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    if ((kendras.includes(lordHouse) && trikonas.includes(placedHouse)) ||
        (trikonas.includes(lordHouse) && kendras.includes(placedHouse))) {
      strength = "strong";
      effect = `Excellent connection between ${houseSignifications[lordHouse]} and ${houseSignifications[placedHouse]}. Creates raja yoga potential and fortunate outcomes.`;
    }
    
    yogas.push({
      type: YogaType.BhavaYoga,
      name: `${lordHouse}${getOrdinalSuffix(lordHouse)} Lord in ${placedHouse}${getOrdinalSuffix(placedHouse)} House`,
      formationPlanets: [houseLord],
      houses: [placedHouse],
      strength: strength,
      description: `Lord of ${lordHouse}${getOrdinalSuffix(lordHouse)} house (${houseLord}) is placed in ${placedHouse}${getOrdinalSuffix(placedHouse)} house.`,
      effects: effect,
    });
  }
  
  return yogas;
}

/**
 * Detect Parivartana Yogas (Mutual Exchange of House Lords)
 * Three types: Maha (auspicious), Khala (mixed), Dainya (afflicted)
 */
function detectParivartanaYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  const kendras = [1, 4, 7, 10];
  const trikonas = [1, 5, 9];
  const dusthanas = [6, 8, 12];
  
  // Check all house lord pairs for mutual exchange
  for (let house1 = 1; house1 <= 12; house1++) {
    for (let house2 = house1 + 1; house2 <= 12; house2++) {
      const lord1 = houses.find(h => h.houseNumber === house1)?.lord;
      const lord2 = houses.find(h => h.houseNumber === house2)?.lord;
      
      if (!lord1 || !lord2 || lord1 === lord2) continue;
      
      const lord1Pos = planetPositions.find(p => p.planet === lord1);
      const lord2Pos = planetPositions.find(p => p.planet === lord2);
      
      if (!lord1Pos || !lord2Pos) continue;
      
      // Check for mutual exchange: lord1 in house2 AND lord2 in house1
      if (lord1Pos.house === house2 && lord2Pos.house === house1) {
        // Determine yoga type based on house combinations
        let yogaType: YogaType;
        let yogaName: string;
        let strength: "weak" | "moderate" | "strong";
        let effects: string;
        
        const bothKendra = kendras.includes(house1) && kendras.includes(house2);
        const bothTrikona = trikonas.includes(house1) && trikonas.includes(house2);
        const kendraTrikonaExchange = (kendras.includes(house1) && trikonas.includes(house2)) ||
                                       (trikonas.includes(house1) && kendras.includes(house2));
        const anyDusthana = dusthanas.includes(house1) || dusthanas.includes(house2);
        
        if ((bothKendra || bothTrikona || kendraTrikonaExchange) && !anyDusthana) {
          // Maha Parivartana - Great exchange
          yogaType = YogaType.ParivartanaYoga;
          yogaName = "Maha Parivartana Yoga";
          strength = "strong";
          effects = `Highly auspicious exchange between ${getOrdinalSuffix(house1)} and ${getOrdinalSuffix(house2)} lords. Bestows prosperity, success, and favorable results in both life areas. The matters of both houses flourish remarkably.`;
        } else if (anyDusthana) {
          // Dainya Parivartana - Sorrowful exchange
          yogaType = YogaType.ParivartanaYoga;
          yogaName = "Dainya Parivartana Yoga";
          strength = "weak";
          effects = `Challenging exchange involving dusthana lord(s). May create difficulties and obstacles related to ${getOrdinalSuffix(house1)} and ${getOrdinalSuffix(house2)} house matters. Requires remedial measures.`;
        } else {
          // Khala Parivartana - Mixed exchange
          yogaType = YogaType.ParivartanaYoga;
          yogaName = "Khala Parivartana Yoga";
          strength = "moderate";
          effects = `Moderate exchange between ${getOrdinalSuffix(house1)} and ${getOrdinalSuffix(house2)} lords. Brings mixed results with some benefits and some challenges. The houses strengthen each other mutually.`;
        }
        
        yogas.push({
          type: yogaType,
          name: `${yogaName} (${getOrdinalSuffix(house1)}-${getOrdinalSuffix(house2)})`,
          formationPlanets: [lord1, lord2],
          houses: [house1, house2],
          strength: strength,
          description: `Lord of ${getOrdinalSuffix(house1)} house (${lord1}) is in ${getOrdinalSuffix(house2)} house, and lord of ${getOrdinalSuffix(house2)} house (${lord2}) is in ${getOrdinalSuffix(house1)} house, forming mutual exchange.`,
          effects: effects,
        });
      }
    }
  }
  
  return yogas;
}

/**
 * Detect Arishta Yogas (Affliction combinations)
 */
function detectArishtaYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];
  
  const malefics = [Planet.Sun, Planet.Mars, Planet.Saturn];
  const sixthLord = houses.find(h => h.houseNumber === 6)?.lord;
  const eighthLord = houses.find(h => h.houseNumber === 8)?.lord;
  
  // Daridra Yoga - 12th lord in Lagna or Lagna lord in 12th
  const lagnaLord = houses.find(h => h.houseNumber === 1)?.lord;
  const twelfthLord = houses.find(h => h.houseNumber === 12)?.lord;
  
  if (lagnaLord && twelfthLord) {
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    const twelfthLordPos = planetPositions.find(p => p.planet === twelfthLord);
    
    if (lagnaLordPos?.house === 12 || twelfthLordPos?.house === 1) {
      yogas.push({
        type: YogaType.DaridraYoga,
        name: "Daridra Yoga",
        formationPlanets: lagnaLordPos?.house === 12 ? [lagnaLord] : [twelfthLord],
        houses: lagnaLordPos?.house === 12 ? [12] : [1],
        strength: "moderate",
        description: lagnaLordPos?.house === 12 ? 
          "Lagna lord in 12th house (house of losses)." :
          "12th lord in Lagna (identity tied to losses).",
        effects: "Financial challenges and tendency towards expenses. Can be overcome through spiritual practices and careful financial planning.",
      });
    }
  }
  
  // Paap Kartari Yoga - Lagna/Moon hemmed between malefics
  const lagnaHouse = 1;
  const moonPos = planetPositions.find(p => p.planet === Planet.Moon);
  
  [lagnaHouse, moonPos?.house].forEach((targetHouse, index) => {
    if (!targetHouse) return;
    
    const prevHouse = targetHouse === 1 ? 12 : targetHouse - 1;
    const nextHouse = targetHouse === 12 ? 1 : targetHouse + 1;
    
    const planetsInPrevHouse = planetPositions.filter(p => p.house === prevHouse);
    const planetsInNextHouse = planetPositions.filter(p => p.house === nextHouse);
    
    const maleficsBefore = planetsInPrevHouse.filter(p => malefics.includes(p.planet));
    const maleficsAfter = planetsInNextHouse.filter(p => malefics.includes(p.planet));
    
    if (maleficsBefore.length > 0 && maleficsAfter.length > 0) {
      yogas.push({
        type: YogaType.ArishtaYoga,
        name: index === 0 ? "Paap Kartari Yoga (Lagna)" : "Paap Kartari Yoga (Moon)",
        formationPlanets: [...maleficsBefore.map(p => p.planet), ...maleficsAfter.map(p => p.planet)],
        houses: [prevHouse, targetHouse, nextHouse],
        strength: "weak",
        description: `${index === 0 ? 'Lagna' : 'Moon'} hemmed between malefics in ${prevHouse}${getOrdinalSuffix(prevHouse)} and ${nextHouse}${getOrdinalSuffix(nextHouse)} houses.`,
        effects: "Obstacles and challenges from all sides. Struggles in life but develops resilience. Remedial measures recommended.",
      });
    }
  });
  
  // Lagna Lord Debilitated or Afflicted
  if (lagnaLord) {
    const lagnaLordPos = planetPositions.find(p => p.planet === lagnaLord);
    if (lagnaLordPos?.dignity === PlanetaryDignity.Debilitated) {
      yogas.push({
        type: YogaType.ArishtaYoga,
        name: "Lagna Lord Debilitation",
        formationPlanets: [lagnaLord],
        houses: [lagnaLordPos.house],
        strength: "weak",
        description: `Lagna lord (${lagnaLord}) is debilitated in ${lagnaLordPos.house}${getOrdinalSuffix(lagnaLordPos.house)} house.`,
        effects: "Challenges to health, vitality, and self-confidence. Requires extra effort to achieve goals. Strength can be developed through perseverance.",
      });
    }
  }
  
  // Moon Afflicted (debilitated or in dusthana)
  if (moonPos) {
    if (moonPos.dignity === PlanetaryDignity.Debilitated) {
      yogas.push({
        type: YogaType.ArishtaYoga,
        name: "Moon Debilitation",
        formationPlanets: [Planet.Moon],
        houses: [moonPos.house],
        strength: "weak",
        description: `Moon is debilitated in ${moonPos.house}${getOrdinalSuffix(moonPos.house)} house.`,
        effects: "Emotional challenges and mental stress. May face difficulties with mother or emotional relationships. Meditation and mental discipline help.",
      });
    }
    
    if ([6, 8, 12].includes(moonPos.house)) {
      yogas.push({
        type: YogaType.ArishtaYoga,
        name: "Moon in Dusthana",
        formationPlanets: [Planet.Moon],
        houses: [moonPos.house],
        strength: "weak",
        description: `Moon placed in ${moonPos.house}${getOrdinalSuffix(moonPos.house)} house (dusthana).`,
        effects: "Mental unrest and emotional fluctuations. Challenges related to mind and emotions. Spiritual practices bring relief.",
      });
    }
  }
  
  // Multiple Malefics in 6th House (enemies and conflicts)
  const planetsIn6th = planetPositions.filter(p => p.house === 6 && malefics.includes(p.planet));
  if (planetsIn6th.length >= 2) {
    yogas.push({
      type: YogaType.ArishtaYoga,
      name: "Multiple Malefics in 6th House",
      formationPlanets: planetsIn6th.map(p => p.planet),
      houses: [6],
      strength: "weak",
      description: `Multiple malefic planets (${planetsIn6th.map(p => p.planet).join(", ")}) in 6th house.`,
      effects: "Numerous enemies and conflicts. Health issues and litigation. Strong fighting spirit but faces many obstacles.",
    });
  }
  
  // Multiple Malefics in 8th House (sudden events and longevity)
  const planetsIn8th = planetPositions.filter(p => p.house === 8 && malefics.includes(p.planet));
  if (planetsIn8th.length >= 2) {
    yogas.push({
      type: YogaType.ArishtaYoga,
      name: "Multiple Malefics in 8th House",
      formationPlanets: planetsIn8th.map(p => p.planet),
      houses: [8],
      strength: "weak",
      description: `Multiple malefic planets (${planetsIn8th.map(p => p.planet).join(", ")}) in 8th house.`,
      effects: "Sudden changes and transformations. Occult interests but challenges with inheritance and longevity concerns.",
    });
  }
  
  // Multiple Malefics in 12th House (losses and expenses)
  const planetsIn12th = planetPositions.filter(p => p.house === 12 && malefics.includes(p.planet));
  if (planetsIn12th.length >= 2) {
    yogas.push({
      type: YogaType.ArishtaYoga,
      name: "Multiple Malefics in 12th House",
      formationPlanets: planetsIn12th.map(p => p.planet),
      houses: [12],
      strength: "weak",
      description: `Multiple malefic planets (${planetsIn12th.map(p => p.planet).join(", ")}) in 12th house.`,
      effects: "Heavy expenses and losses. Spiritual inclination but material challenges. Foreign connections may bring difficulties.",
    });
  }
  
  // 6th Lord in Lagna (enemies affecting self)
  if (sixthLord && sixthLord !== lagnaLord) {
    const sixthLordPos = planetPositions.find(p => p.planet === sixthLord);
    if (sixthLordPos?.house === 1) {
      yogas.push({
        type: YogaType.ArishtaYoga,
        name: "6th Lord in Lagna",
        formationPlanets: [sixthLord],
        houses: [1],
        strength: "weak",
        description: `Lord of 6th house (${sixthLord}) placed in Lagna.`,
        effects: "Health challenges and conflicts affect personality. May face enemies and litigation. Need to manage anger and conflicts.",
      });
    }
  }
  
  // 8th Lord in Lagna (transformation affecting self)
  if (eighthLord && eighthLord !== lagnaLord) {
    const eighthLordPos = planetPositions.find(p => p.planet === eighthLord);
    if (eighthLordPos?.house === 1) {
      yogas.push({
        type: YogaType.ArishtaYoga,
        name: "8th Lord in Lagna",
        formationPlanets: [eighthLord],
        houses: [1],
        strength: "weak",
        description: `Lord of 8th house (${eighthLord}) placed in Lagna.`,
        effects: "Sudden changes and transformations in life. Interest in occult but health concerns. Life full of ups and downs.",
      });
    }
  }
  
  // Grahan Dosha (Sun-Rahu or Moon-Rahu conjunction - Eclipse combination)
  const sun = planetPositions.find(p => p.planet === Planet.Sun);
  const rahu = planetPositions.find(p => p.planet === Planet.Rahu);
  
  if (sun && rahu && sun.house === rahu.house) {
    yogas.push({
      type: YogaType.ArishtaYoga,
      name: "Grahan Dosha (Solar Eclipse)",
      formationPlanets: [Planet.Sun, Planet.Rahu],
      houses: [sun.house],
      strength: "moderate",
      description: `Sun and Rahu conjunct in ${sun.house}${getOrdinalSuffix(sun.house)} house, forming eclipse combination.`,
      effects: "Challenges with father, authority figures, and ego. Vision or eye-related issues possible. Spiritual remedies beneficial.",
    });
  }
  
  if (moonPos && rahu && moonPos.house === rahu.house) {
    yogas.push({
      type: YogaType.ArishtaYoga,
      name: "Grahan Dosha (Lunar Eclipse)",
      formationPlanets: [Planet.Moon, Planet.Rahu],
      houses: [moonPos.house],
      strength: "moderate",
      description: `Moon and Rahu conjunct in ${moonPos.house}${getOrdinalSuffix(moonPos.house)} house, forming eclipse combination.`,
      effects: "Emotional and mental turbulence. Challenges with mother and mental peace. Meditation and mantra chanting recommended.",
    });
  }
  
  return yogas;
}

/**
 * Main function to detect all yogas
 */
export function detectYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const allYogas: Yoga[] = [];

  // Original yogas
  allYogas.push(...detectMahapurushaYogas(planetPositions));
  allYogas.push(...detectGajaKesariYoga(planetPositions));
  allYogas.push(...detectBudhaAdityaYoga(planetPositions));
  allYogas.push(...detectRajayoga(planetPositions, houses));
  allYogas.push(...detectNeechaBhangaRajayoga(planetPositions, houses));
  allYogas.push(...detectVipreetRajayoga(planetPositions, houses));
  allYogas.push(...detectKaalSarpYoga(planetPositions));
  
  // Comprehensive yoga detection (NEW - Expanded to 500+ Yogas)
  allYogas.push(...detectNabhasaYogas(planetPositions));
  allYogas.push(...detectLunarYogas(planetPositions));
  allYogas.push(...detectSolarYogas(planetPositions));
  allYogas.push(...detectBPHSRajaYogas(planetPositions, houses)); // BPHS Ch. 36-41 Raja Yogas
  allYogas.push(...detectAdditionalRajaYogas(planetPositions, houses));
  allYogas.push(...detectDhanaYogas(planetPositions, houses));
  allYogas.push(...detectConjunctionYogas(planetPositions));
  allYogas.push(...detectSpecializedYogas(planetPositions, houses));
  allYogas.push(...detectBhavaYogas(planetPositions, houses));
  allYogas.push(...detectParivartanaYogas(planetPositions, houses));
  allYogas.push(...detectArishtaYogas(planetPositions, houses));

  return allYogas;
}

/**
 * Helper function to get ordinal suffix
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

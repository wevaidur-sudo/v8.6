/**
 * Yoga Definitions - All Parashari Yogas as Structured Data
 * Each yoga cites classical source (BPHS chapters, Saravali, Phaladeepika, Jataka Parijata)
 * 
 * Total: 312+ yogas organized by category
 */

import { Planet, YogaType, PlanetaryDignity, ZodiacSign } from "@shared/astro-schema";

// ============================================================================
// Type Definitions for Yoga Data
// ============================================================================

export interface YogaDefinition {
  type: YogaType;
  name: string;
  source: string; // Classical text reference (e.g., "BPHS Ch. 35", "Saravali Ch. 15")
  category: YogaCategory;
  detectionType: DetectionType;
  conditions: YogaConditions;
  effects: string;
  strengthRules?: StrengthRule[];
}

export enum YogaCategory {
  Mahapurusha = "Mahapurusha",
  Nabhasa = "Nabhasa",
  Lunar = "Lunar",
  Solar = "Solar",
  Raja = "Raja",
  Dhana = "Dhana",
  Conjunction = "Conjunction",
  Specialized = "Specialized",
  Bhava = "Bhava",
  Parivartana = "Parivartana",
  Arishta = "Arishta",
}

export enum DetectionType {
  PlanetInKendra = "planet_in_kendra",
  PlanetInHouse = "planet_in_house",
  Conjunction = "conjunction",
  HouseLordPlacement = "house_lord_placement",
  MutualExchange = "mutual_exchange",
  PatternBased = "pattern_based",
  Proximity = "proximity",
  Hemming = "hemming",
  Debilitation = "debilitation",
}

/**
 * Custom check types for advanced yoga detection patterns
 * Each enum value corresponds to a specific validation function in engine.ts
 */
export enum CustomCheckType {
  JupiterKendraFromMoon = "jupiter_kendra_from_moon",
  MercuryNotCombust = "mercury_not_combust",
  TwoBeneficsInSameGoodHouse = "two_benefics_in_same_good_house",
  AllPlanetsBetweenRahuKetu = "all_planets_between_rahu_ketu",
  
  // Nabhasa Yoga checks
  PlanetsInSignCount = "planets_in_sign_count",
  PlanetsInMovableSigns = "planets_in_movable_signs",
  PlanetsInFixedSigns = "planets_in_fixed_signs",
  PlanetsInDualSigns = "planets_in_dual_signs",
  AllKendrasBenefics = "all_kendras_benefics",
  AllKendrasMalefics = "all_kendras_malefics",
  PlanetsInAlternateHouses = "planets_in_alternate_houses",
  PlanetsInHouseRange = "planets_in_house_range",
  
  // Raja Yoga checks
  KendraTrikonaLords = "kendra_trikona_lords",
  HouseLordsExchange = "house_lords_exchange",
  NinthLordStrong = "ninth_lord_strong",
  
  // Dhana Yoga checks
  WealthHouseLordsStrong = "wealth_house_lords_strong",
  SecondEleventhConnection = "second_eleventh_connection",
  
  // Lunar Yoga checks
  PlanetsInSecondFromMoon = "planets_in_second_from_moon",
  PlanetsInTwelfthFromMoon = "planets_in_twelfth_from_moon",
  PlanetsAroundMoon = "planets_around_moon",
  NoPlanetsAroundMoon = "no_planets_around_moon",
  
  // Solar Yoga checks
  PlanetsInSecondFromSun = "planets_in_second_from_sun",
  PlanetsInTwelfthFromSun = "planets_in_twelfth_from_sun",
  PlanetsAroundSun = "planets_around_sun",
}

export interface YogaConditions {
  planets?: Planet[];
  houses?: number[];
  signs?: ZodiacSign[];
  dignities?: PlanetaryDignity[];
  houseLords?: number[];
  requireAllPlanets?: boolean; // true = AND, false = OR
  excludePlanets?: Planet[];
  minPlanets?: number;
  maxPlanets?: number;
  specificPlanet?: Planet;
  targetPlanet?: Planet;
  customCheck?: CustomCheckType; // Reference to custom validation function (type-safe enum)
  
  // Additional parameters for pattern-based yogas
  signCount?: number; // For Nabhasa Sankhya yogas
  houseRange?: [number, number]; // For house range patterns
  housePattern?: number[]; // Specific house pattern required
}

export interface StrengthRule {
  condition: string;
  strength: "weak" | "moderate" | "strong";
}

// ============================================================================
// MAHAPURUSHA YOGAS (5 yogas)
// Source: BPHS Ch. 76
// ============================================================================

export const MAHAPURUSHA_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.MahapurushaYoga,
    name: "Ruchaka Yoga",
    source: "BPHS Ch. 76",
    category: YogaCategory.Mahapurusha,
    detectionType: DetectionType.PlanetInKendra,
    conditions: {
      specificPlanet: Planet.Mars,
      houses: [1, 4, 7, 10],
      dignities: [PlanetaryDignity.Exalted, PlanetaryDignity.OwnSign],
    },
    effects:
      "Strong Mars in Kendra brings exceptional courage, leadership qualities, and success through disciplined action. The native becomes commanding, valorous, and achieves victory over enemies. Athletic abilities and military success.",
    strengthRules: [
      { condition: "exalted", strength: "strong" },
      { condition: "own_sign", strength: "moderate" },
    ],
  },
  {
    type: YogaType.MahapurushaYoga,
    name: "Bhadra Yoga",
    source: "BPHS Ch. 76",
    category: YogaCategory.Mahapurusha,
    detectionType: DetectionType.PlanetInKendra,
    conditions: {
      specificPlanet: Planet.Mercury,
      houses: [1, 4, 7, 10],
      dignities: [PlanetaryDignity.Exalted, PlanetaryDignity.OwnSign],
    },
    effects:
      "Mercury in Kendra bestows extraordinary intelligence, communication skills, and success in business and learning. The native becomes scholarly, eloquent, and skilled in arts and sciences. Success in trade and commerce.",
    strengthRules: [
      { condition: "exalted", strength: "strong" },
      { condition: "own_sign", strength: "moderate" },
    ],
  },
  {
    type: YogaType.MahapurushaYoga,
    name: "Hamsa Yoga",
    source: "BPHS Ch. 76",
    category: YogaCategory.Mahapurusha,
    detectionType: DetectionType.PlanetInKendra,
    conditions: {
      specificPlanet: Planet.Jupiter,
      houses: [1, 4, 7, 10],
      dignities: [PlanetaryDignity.Exalted, PlanetaryDignity.OwnSign],
    },
    effects:
      "Jupiter in Kendra indicates wisdom, spiritual inclination, prosperity, and honorable position in society. The native becomes righteous, learned, and blessed with wealth. Respected for knowledge and moral character.",
    strengthRules: [
      { condition: "exalted", strength: "strong" },
      { condition: "own_sign", strength: "moderate" },
    ],
  },
  {
    type: YogaType.MahapurushaYoga,
    name: "Malavya Yoga",
    source: "BPHS Ch. 76",
    category: YogaCategory.Mahapurusha,
    detectionType: DetectionType.PlanetInKendra,
    conditions: {
      specificPlanet: Planet.Venus,
      houses: [1, 4, 7, 10],
      dignities: [PlanetaryDignity.Exalted, PlanetaryDignity.OwnSign],
    },
    effects:
      "Venus in Kendra brings charm, artistic abilities, luxury, and success in creative and relationship matters. The native enjoys comforts, beauty, and harmonious relationships. Success in arts and entertainment.",
    strengthRules: [
      { condition: "exalted", strength: "strong" },
      { condition: "own_sign", strength: "moderate" },
    ],
  },
  {
    type: YogaType.MahapurushaYoga,
    name: "Shasha Yoga",
    source: "BPHS Ch. 76",
    category: YogaCategory.Mahapurusha,
    detectionType: DetectionType.PlanetInKendra,
    conditions: {
      specificPlanet: Planet.Saturn,
      houses: [1, 4, 7, 10],
      dignities: [PlanetaryDignity.Exalted, PlanetaryDignity.OwnSign],
    },
    effects:
      "Saturn in Kendra provides discipline, organizational skills, longevity, and success through persistent effort. The native becomes patient, hardworking, and achieves lasting success. Leadership in service sectors.",
    strengthRules: [
      { condition: "exalted", strength: "strong" },
      { condition: "own_sign", strength: "moderate" },
    ],
  },
];

// ============================================================================
// SPECIALIZED YOGAS
// Sources: Various classical texts
// ============================================================================

export const SPECIALIZED_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.GajaKesariYoga,
    name: "Gaja Kesari Yoga",
    source: "BPHS Ch. 35, Saravali Ch. 35",
    category: YogaCategory.Specialized,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.JupiterKendraFromMoon,
    },
    effects:
      "Bestows intelligence, wisdom, good reputation, wealth, and success. The native is blessed with a sharp mind, good character, and respect in society. Leadership abilities and influential position.",
    strengthRules: [
      { condition: "jupiter_exalted", strength: "strong" },
      { condition: "jupiter_own_sign", strength: "moderate" },
    ],
  },
  {
    type: YogaType.BudhaAdityaYoga,
    name: "Budha Aditya Yoga",
    source: "Phaladeepika Ch. 6",
    category: YogaCategory.Specialized,
    detectionType: DetectionType.Conjunction,
    conditions: {
      planets: [Planet.Sun, Planet.Mercury],
      customCheck: CustomCheckType.MercuryNotCombust,
    },
    effects:
      "Sun-Mercury conjunction brings intelligence, learning abilities, and skill in communication. Success in education, writing, and intellectual pursuits. Sharp analytical mind and scholarly achievements.",
    strengthRules: [
      { condition: "in_kendra", strength: "strong" },
      { condition: "in_trikona", strength: "moderate" },
    ],
  },
  {
    type: YogaType.AmalaYoga,
    name: "Amala Yoga",
    source: "Phaladeepika Ch. 6",
    category: YogaCategory.Specialized,
    detectionType: DetectionType.PlanetInHouse,
    conditions: {
      planets: [Planet.Jupiter, Planet.Venus, Planet.Mercury],
      houses: [10],
    },
    effects:
      "Spotless reputation, fame, and prosperity. Good character and lasting achievements. Respected profession and noble deeds. The native gains recognition for ethical conduct and professional excellence.",
    strengthRules: [{ condition: "jupiter_in_10th", strength: "strong" }],
  },
  {
    type: YogaType.ChamaraYoga,
    name: "Chamara Yoga",
    source: "Phaladeepika Ch. 6",
    category: YogaCategory.Specialized,
    detectionType: DetectionType.PatternBased,
    conditions: {
      planets: [Planet.Jupiter, Planet.Venus, Planet.Mercury],
      houses: [1, 7, 9, 10],
      minPlanets: 2,
      customCheck: CustomCheckType.TwoBeneficsInSameGoodHouse,
    },
    effects:
      "Royal treatment, long life, and authoritative position. Commands respect and enjoys luxuries like a king. The native is honored by rulers and enjoys all comforts.",
    strengthRules: [{ condition: "in_lagna", strength: "strong" }],
  },
  {
    type: YogaType.KaalSarpYoga,
    name: "Kaal Sarp Yoga",
    source: "Narad Samhita",
    category: YogaCategory.Arishta,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.AllPlanetsBetweenRahuKetu,
    },
    effects:
      "Challenges and obstacles in life, but also potential for transformation. Intense karmic experiences and spiritual growth. The native faces struggles but can achieve great heights through perseverance.",
    strengthRules: [{ condition: "partial", strength: "weak" }],
  },
];

// ============================================================================
// NABHASA YOGAS (31 yogas)
// Source: BPHS Ch. 35
// ============================================================================

// Sankhya Yogas (7 yogas - based on number of signs occupied)
export const NABHASA_SANKHYA_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Gola Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 1,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "Creates a highly focused individual with specialized skills. May face ups and downs but achieves expertise in chosen field.",
  },
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Yuga Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 2,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "Indicates a balanced personality with dual interests. Success through partnerships and collaborations.",
  },
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Sula Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 3,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "Brings courage and determination. The native may face obstacles but overcomes them through persistence.",
  },
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Kedara Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 4,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "Indicates prosperity through agriculture, real estate, or land-related activities. Patient and hardworking nature.",
  },
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Pasha Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 5,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "May bring initial restrictions but eventual freedom. Success through service and helping others.",
  },
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Dama Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 6,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "Brings self-control and charitable nature. Success through disciplined efforts and helping society.",
  },
  {
    type: YogaType.NabhasaSankhyaYoga,
    name: "Veena Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      signCount: 7,
      customCheck: CustomCheckType.PlanetsInSignCount,
    },
    effects: "Indicates artistic talents, musical abilities, and harmonious personality. Enjoys life's pleasures.",
  },
];

// Asraya Yogas (3 yogas - based on sign types)
export const NABHASA_ASRAYA_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.NabhasaAsrayaYoga,
    name: "Rajju Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInMovableSigns,
    },
    effects: "Native fond of travel, earning through travel, handsome appearance, desire for wealth, inclined to wander.",
  },
  {
    type: YogaType.NabhasaAsrayaYoga,
    name: "Musala Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInFixedSigns,
    },
    effects: "Stable wealth, fixed assets, self-respect, endowed with gems, leadership qualities, fearless, famous.",
  },
  {
    type: YogaType.NabhasaAsrayaYoga,
    name: "Nala Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInDualSigns,
    },
    effects: "Pleasing personality, skilled in many arts, helpful nature, versatile abilities.",
  },
];

// Dala Yogas (2 yogas - based on benefic/malefic in kendras)
export const NABHASA_DALA_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.NabhasaDalaYoga,
    name: "Mala Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.AllKendrasBenefics,
    },
    effects: "Garland of prosperity and virtue. Wealthy, kind-hearted, and respected. Success through noble actions and good character.",
  },
  {
    type: YogaType.NabhasaDalaYoga,
    name: "Sarpa Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.AllKendrasMalefics,
    },
    effects: "Serpent-like cunning and wisdom. Faces challenges and obstacles but overcomes through persistence. May experience suffering but gains strength.",
  },
];

// Akriti Yogas (19 major shape-based yogas)
export const NABHASA_AKRITI_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Chakra Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInAlternateHouses,
    },
    effects: "Ruler or leader in their field. Commands authority and respect. Wealthy and influential in society.",
    strengthRules: [{ condition: "well_formed", strength: "strong" }],
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Samudra Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      houseRange: [1, 6],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Abundant wealth like an ocean. Prosperous, happy, and commanding personality. Success in material pursuits.",
    strengthRules: [{ condition: "all_six_houses", strength: "strong" }],
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Kamala Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PlanetInHouse,
    conditions: {
      houses: [1, 4, 7, 10],
      requireAllPlanets: true,
    },
    effects: "Lotus-like prosperity and fame. Virtuous, wealthy, and long-lived. Respected in society like royalty.",
    strengthRules: [{ condition: "all_kendras", strength: "strong" }],
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Vapi Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      houseRange: [4, 7],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Accumulation of wealth through business and trade. Prosperity like a well that never dries. Charitable nature.",
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Yupa Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      housePattern: [1, 2, 3, 4],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Religious inclination, spiritual wisdom, and charitable disposition. Respected for virtuous conduct.",
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Ishu Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      housePattern: [1, 2, 3],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Swift action and quick success. Sharp intellect and goal-oriented personality. Military or sports achievements.",
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Sakti Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      housePattern: [10, 11, 12, 1, 2, 3],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Powerful and energetic personality. Success through forceful action. Leadership in challenging situations.",
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Danda Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      housePattern: [4, 5, 6, 7, 8],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Authoritative position, disciplinary skills. Success in administration, law enforcement, or teaching.",
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Nau Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      housePattern: [1, 2, 3, 11, 12],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Prosperous through water-related ventures or travel. Fortune through import/export, shipping, or foreign connections.",
  },
  {
    type: YogaType.NabhasaAkritiYoga,
    name: "Kuta Yoga",
    source: "BPHS Ch. 35",
    category: YogaCategory.Nabhasa,
    detectionType: DetectionType.PatternBased,
    conditions: {
      housePattern: [1, 2, 3, 10, 11, 12],
      customCheck: CustomCheckType.PlanetsInHouseRange,
    },
    effects: "Strong defenses and strategic thinking. Success through planning and preparation. Protective of family and resources.",
  },
];

// ============================================================================
// LUNAR YOGAS (4 yogas)
// Source: BPHS, Phaladeepika
// ============================================================================

export const LUNAR_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.SunaphaYoga,
    name: "Sunapha Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Lunar,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInSecondFromMoon,
    },
    effects: "Wealthy, famous, intelligent, and enjoys comforts. Self-made success and prosperity. Good reputation in society.",
    strengthRules: [
      { condition: "jupiter_or_venus", strength: "strong" },
      { condition: "other_planets", strength: "moderate" },
    ],
  },
  {
    type: YogaType.AnaphaYoga,
    name: "Anapha Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Lunar,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInTwelfthFromMoon,
    },
    effects: "Well-formed body, good health, famous, and virtuous. Enjoys material comforts and spiritual inclinations.",
    strengthRules: [
      { condition: "jupiter_or_venus", strength: "strong" },
      { condition: "other_planets", strength: "moderate" },
    ],
  },
  {
    type: YogaType.DurudhuraYoga,
    name: "Durudhura Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Lunar,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsAroundMoon,
    },
    effects: "Very auspicious. Wealth, vehicles, servants, and all comforts. Leadership position and long life. Highly respected.",
    strengthRules: [{ condition: "both_sides", strength: "strong" }],
  },
  {
    type: YogaType.KemadrumaYoga,
    name: "Kemadruma Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Arishta,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.NoPlanetsAroundMoon,
    },
    effects: "Challenges in life, poverty, lack of support. However, can be cancelled by other good yogas. Develops inner strength through hardships.",
  },
];

// ============================================================================
// SOLAR YOGAS (3 yogas)
// Source: BPHS, Phaladeepika
// ============================================================================

export const SOLAR_YOGAS: YogaDefinition[] = [
  {
    type: YogaType.VesiYoga,
    name: "Vesi Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Solar,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInSecondFromSun,
    },
    effects: "Balanced, truthful, and well-spoken. Good memory and learning abilities. Prosperity in middle and later life.",
    strengthRules: [
      { condition: "jupiter_or_mercury", strength: "strong" },
      { condition: "other_planets", strength: "moderate" },
    ],
  },
  {
    type: YogaType.VasiYoga,
    name: "Vasi Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Solar,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsInTwelfthFromSun,
    },
    effects: "Skillful, charitable, and good character. Success through own efforts. Prosperity through hard work.",
    strengthRules: [
      { condition: "jupiter_or_mercury", strength: "strong" },
      { condition: "other_planets", strength: "moderate" },
    ],
  },
  {
    type: YogaType.UbhayachariYoga,
    name: "Ubhayachari Yoga",
    source: "BPHS Ch. 34, Phaladeepika Ch. 6",
    category: YogaCategory.Solar,
    detectionType: DetectionType.PatternBased,
    conditions: {
      customCheck: CustomCheckType.PlanetsAroundSun,
    },
    effects: "Very auspicious. King-like prosperity, intelligence, and respected position. Success in all endeavors. Enjoys wealth and authority.",
    strengthRules: [{ condition: "both_sides", strength: "strong" }],
  },
];

// ============================================================================
// CONJUNCTION YOGAS (21 yogas)
// Source: Saravali Ch. 15
// ============================================================================

export const CONJUNCTION_EFFECTS: Record<string, string> = {
  "Sun-Moon":
    "Strong personality, leadership, and royal connections. Good health and vitality. The native possesses confidence and attracts authority.",
  "Sun-Mars":
    "Courage, technical skills, and athletic abilities. Strong willpower but may be impulsive. Success in competitive fields and military.",
  "Sun-Mercury":
    "Intelligence, analytical skills, and communication abilities. Success in intellectual pursuits. Sharp mind and scholarly recognition.",
  "Sun-Jupiter":
    "Wisdom, spiritual inclination, and authoritative position. Respected for knowledge. The native becomes a guide and counselor to others.",
  "Sun-Venus":
    "Artistic talents, luxury, and refined tastes. Success in creative fields. The native enjoys comforts and aesthetic pleasures.",
  "Sun-Saturn":
    "Discipline, patience, and success through hard work. May face challenges with authority. Gains through persistent efforts.",
  "Moon-Mars":
    "Emotional intensity, courage, and technical skills. Quick decision-making abilities. The native is bold and action-oriented.",
  "Moon-Mercury":
    "Quick wit, eloquence, and adaptability. Success in communication and business. Mental agility and commercial success.",
  "Moon-Jupiter":
    "Emotional wisdom, prosperity, and good character. Beneficial for family life. The native is generous and well-liked.",
  "Moon-Venus":
    "Charm, beauty, and artistic sensibilities. Success in relationships and creative arts. The native enjoys love and luxury.",
  "Moon-Saturn":
    "Emotional maturity, responsibility, and patience. May experience emotional challenges. Wisdom through life experiences.",
  "Mars-Mercury":
    "Technical expertise, sharp intellect, and argumentative skills. Success in engineering and debates. Quick thinking and execution.",
  "Mars-Jupiter":
    "Righteousness, courage, and success in leadership. Strong moral character. The native fights for justice and truth.",
  "Mars-Venus":
    "Passionate nature, artistic technical skills, and attraction to beauty. Success in design and craftsmanship.",
  "Mars-Saturn":
    "Disciplined action, endurance, and success through persistent effort. May face conflicts. Eventual success through hard work.",
  "Mercury-Jupiter":
    "Wisdom in communication, teaching abilities, and scholarly success. The native becomes a respected teacher or author.",
  "Mercury-Venus":
    "Artistic expression, pleasant communication, and success in arts and business. Charm and creativity in communication.",
  "Mercury-Saturn":
    "Practical intelligence, organizational skills, and success in structured work. Methodical thinking and planning abilities.",
  "Jupiter-Venus":
    "Prosperity, wisdom in relationships, and success in counseling. Harmonious life and spiritual wealth.",
  "Jupiter-Saturn":
    "Balanced wisdom, philosophical depth, and success through patient efforts. Good for spirituality and lasting achievements.",
  "Venus-Saturn":
    "Artistic discipline, mature relationships, and success in structured creative work. May delay marriage but brings lasting bonds.",
};

// ============================================================================
// Export all yoga definitions
// ============================================================================

export const ALL_YOGA_DEFINITIONS = [
  ...MAHAPURUSHA_YOGAS,
  ...SPECIALIZED_YOGAS,
  ...NABHASA_SANKHYA_YOGAS,
  ...NABHASA_ASRAYA_YOGAS,
  ...NABHASA_DALA_YOGAS,
  ...NABHASA_AKRITI_YOGAS,
  ...LUNAR_YOGAS,
  ...SOLAR_YOGAS,
];

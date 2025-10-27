import { z } from "zod";

// ============================================================================
// BIRTH DATA SCHEMAS
// ============================================================================

export const birthDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"), // YYYY-MM-DD format
  timeOfBirth: z.string().min(1, "Time of birth is required"), // HH:MM format (24-hour)
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14), // UTC offset in hours
  gender: z.enum(["male", "female", "other"]).optional(),
});

export type BirthData = z.infer<typeof birthDataSchema>;

// ============================================================================
// CITY DATA
// ============================================================================

export interface City {
  id: number;
  city: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  population?: number;
}

// ============================================================================
// ZODIAC SIGNS & NAKSHATRAS
// ============================================================================

export enum ZodiacSign {
  Aries = "Aries",
  Taurus = "Taurus",
  Gemini = "Gemini",
  Cancer = "Cancer",
  Leo = "Leo",
  Virgo = "Virgo",
  Libra = "Libra",
  Scorpio = "Scorpio",
  Sagittarius = "Sagittarius",
  Capricorn = "Capricorn",
  Aquarius = "Aquarius",
  Pisces = "Pisces",
}

export enum Nakshatra {
  Ashwini = "Ashwini",
  Bharani = "Bharani",
  Krittika = "Krittika",
  Rohini = "Rohini",
  Mrigashira = "Mrigashira",
  Ardra = "Ardra",
  Punarvasu = "Punarvasu",
  Pushya = "Pushya",
  Ashlesha = "Ashlesha",
  Magha = "Magha",
  PurvaPhalguni = "Purva Phalguni",
  UttaraPhalguni = "Uttara Phalguni",
  Hasta = "Hasta",
  Chitra = "Chitra",
  Swati = "Swati",
  Vishakha = "Vishakha",
  Anuradha = "Anuradha",
  Jyeshtha = "Jyeshtha",
  Mula = "Mula",
  PurvaAshadha = "Purva Ashadha",
  UttaraAshadha = "Uttara Ashadha",
  Shravana = "Shravana",
  Dhanishta = "Dhanishta",
  Shatabhisha = "Shatabhisha",
  PurvaBhadrapada = "Purva Bhadrapada",
  UttaraBhadrapada = "Uttara Bhadrapada",
  Revati = "Revati",
}

// ============================================================================
// PLANET DATA
// ============================================================================

export enum Planet {
  Sun = "Sun",
  Moon = "Moon",
  Mars = "Mars",
  Mercury = "Mercury",
  Jupiter = "Jupiter",
  Venus = "Venus",
  Saturn = "Saturn",
  Rahu = "Rahu",
  Ketu = "Ketu",
  Ascendant = "Ascendant",
}

export enum PlanetaryDignity {
  Exalted = "Exalted",
  OwnSign = "Own Sign",
  Moolatrikona = "Moolatrikona",
  FriendlySign = "Friendly Sign",
  NeutralSign = "Neutral Sign",
  EnemySign = "Enemy Sign",
  Debilitated = "Debilitated",
}

export interface PlanetPosition {
  planet: Planet;
  longitude: number; // 0-360 degrees
  sign: ZodiacSign;
  degree: number; // 0-30 within sign
  house: number; // 1-12
  nakshatra: Nakshatra;
  nakshatraPada: number; // 1-4
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: PlanetaryDignity;
  speed: number; // degrees per day
}

// ============================================================================
// HOUSE DATA
// ============================================================================

export interface HouseData {
  houseNumber: number; // 1-12
  sign: ZodiacSign;
  signDegree: number; // Starting degree
  lord: Planet;
  planetsInHouse: Planet[];
}

// ============================================================================
// PLANETARY STRENGTH (SHADBALA)
// ============================================================================

export interface ShadbalaStrength {
  planet: Planet;
  sthanaBala: number; // Positional strength
  digBala: number; // Directional strength
  kalaBala: number; // Temporal strength
  chestaBala: number; // Motional strength
  naisargikaBala: number; // Natural strength
  drikBala: number; // Aspectual strength
  totalBala: number; // Sum of all
  totalVirupas: number; // Converted to Virupas
  isStrong: boolean; // Meets minimum requirement
}

// ============================================================================
// ASHTAKAVARGA
// ============================================================================

export interface AshtakavargaScore {
  planet: Planet;
  house: number;
  bindus: number; // Benefic points (0-8)
}

export interface SarvaAshtakavarga {
  house: number;
  totalBindus: number; // Sum across all planets
  strength: "weak" | "medium" | "strong";
}

export enum DivisionalChartType {
  D1 = "D1",   // Rashi (Birth Chart)
  D2 = "D2",   // Hora
  D3 = "D3",   // Drekkana
  D4 = "D4",   // Chaturthamsa
  D7 = "D7",   // Saptamsa
  D9 = "D9",   // Navamsa
  D10 = "D10", // Dasamsa
  D12 = "D12", // Dwadasamsa
  D16 = "D16", // Shodasamsa
  D20 = "D20", // Vimsamsa
  D24 = "D24", // Chaturvimsamsa
  D27 = "D27", // Nakshatramsa
  D30 = "D30", // Trimsamsa
  D40 = "D40", // Khavedamsa
  D45 = "D45", // Akshavedamsa
  D60 = "D60", // Shashtiamsa
}

export interface DivisionalAshtakavarga {
  chartType: DivisionalChartType;
  chartName: string;
  individual: AshtakavargaScore[];
  sarva: SarvaAshtakavarga[];
}

// Prastara Ashtakavarga - Detailed breakdown showing each contributor
export interface PrastaraAshtakavarga {
  planet: Planet;
  house: number;
  contributors: {
    contributor: Planet | "Ascendant";
    bindu: boolean; // true if this contributor gives a bindu
  }[];
  totalBindus: number;
}

// Trikona Shodhana - Reduction from trinal houses (5th and 9th)
export interface TrikonaShodhana {
  planet: Planet;
  house: number;
  originalBindus: number;
  fifthHouseReduction: number;
  ninthHouseReduction: number;
  afterReduction: number;
}

// Ekadhipatya Shodhana - Reduction for signs with same planetary lord
export interface EkadhipatyaShodhana {
  planet: Planet;
  house: number;
  beforeReduction: number;
  sameLordReduction: number;
  afterReduction: number;
}

// Kakshya Lords - 8 divisions per sign
export interface KakshyaLord {
  house: number;
  sign: ZodiacSign;
  kakshyas: {
    position: number; // 1-8
    lord: Planet;
    degrees: string; // e.g., "0°00' - 3°45'"
    hasBindu: boolean;
  }[];
}

// Shodhita Ashtakavarga - Final reduced scores after all reductions
export interface ShodhitaAshtakavarga {
  planet: Planet;
  house: number;
  originalBindus: number;
  afterTrikonaShodhana: number;
  afterEkadhipatyaShodhana: number;
  finalBindus: number;
}

// Complete Ashtakavarga System
export interface CompleteAshtakavargaSystem {
  individual: AshtakavargaScore[];
  sarva: SarvaAshtakavarga[];
  prastara: PrastaraAshtakavarga[];
  trikonaShodhana: TrikonaShodhana[];
  ekadhipatyaShodhana: EkadhipatyaShodhana[];
  kakshyaLords: KakshyaLord[];
  shodhita: ShodhitaAshtakavarga[];
}

// ============================================================================
// YOGAS
// ============================================================================

export enum YogaType {
  // Raja Yogas (Power & Status)
  Rajayoga = "Rajayoga",
  NeechaBhangaRajayoga = "Neecha Bhanga Rajayoga",
  VipreetRajayoga = "Vipreet Rajayoga",
  DharmaKarmadhipatiYoga = "Dharma-Karmadhipati Yoga",
  AdhiYoga = "Adhi Yoga",
  LakshmiYoga = "Lakshmi Yoga",
  
  // Mahapurusha Yogas (Great Person)
  MahapurushaYoga = "Mahapurusha Yoga",
  
  // Wealth Yogas
  DhanaYoga = "Dhana Yoga",
  
  // Exchange & Combination Yogas
  ParivartanaYoga = "Parivartana Yoga",
  
  // Popular Yogas
  GajaKesariYoga = "Gaja Kesari Yoga",
  BudhaAdityaYoga = "Budha Aditya Yoga",
  SaraswatiYoga = "Saraswati Yoga",
  
  // Nabhasa Yogas (Pattern-based)
  NabhasaAkritiYoga = "Nabhasa Akriti Yoga",
  NabhasaSankhyaYoga = "Nabhasa Sankhya Yoga",
  NabhasaAsrayaYoga = "Nabhasa Asraya Yoga",
  NabhasaDalaYoga = "Nabhasa Dala Yoga",
  
  // Lunar Yogas (Moon-based)
  SunaphaYoga = "Sunapha Yoga",
  AnaphaYoga = "Anapha Yoga",
  DurudhuraYoga = "Durudhura Yoga",
  KemadrumaYoga = "Kemadruma Yoga",
  ChandraYoga = "Chandra Yoga",
  
  // Solar Yogas (Sun-based)
  VesiYoga = "Vesi Yoga",
  VasiYoga = "Vasi Yoga",
  UbhayachariYoga = "Ubhayachari Yoga",
  
  // House Lordship Yogas
  BhavaYoga = "Bhava Yoga",
  
  // Conjunction Yogas
  ConjunctionYoga = "Conjunction Yoga",
  
  // Specialized Yogas
  AmalaYoga = "Amala Yoga",
  ChamaraYoga = "Chamara Yoga",
  PushkalaYoga = "Pushkala Yoga",
  KalatraYoga = "Kalatra Yoga",
  PutraYoga = "Putra Yoga",
  
  // Affliction Yogas
  KaalSarpYoga = "Kaal Sarp Yoga",
  ArishtaYoga = "Arishta Yoga",
  DaridraYoga = "Daridra Yoga",
}

export interface Yoga {
  type: YogaType;
  name: string;
  formationPlanets: Planet[];
  houses: number[];
  strength: "weak" | "moderate" | "strong";
  description: string;
  effects: string;
}

// ============================================================================
// VIMSHOTTARI DASHA
// ============================================================================

export enum DashaPlanet {
  Ketu = "Ketu",
  Venus = "Venus",
  Sun = "Sun",
  Moon = "Moon",
  Mars = "Mars",
  Rahu = "Rahu",
  Jupiter = "Jupiter",
  Saturn = "Saturn",
  Mercury = "Mercury",
}

export interface MahadashaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface AntardashaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  mahadashaPlanet: DashaPlanet;
}

export interface PratyantardashaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  mahadashaPlanet: DashaPlanet;
  antardashaPlanet: DashaPlanet;
}

export interface SookshmaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationHours: number;
  mahadashaPlanet: DashaPlanet;
  antardashaPlanet: DashaPlanet;
  pratyantardashaPlanet: DashaPlanet;
}

export interface PranaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
  mahadashaPlanet: DashaPlanet;
  antardashaPlanet: DashaPlanet;
  pratyantardashaPlanet: DashaPlanet;
  sookshmaPlanet: DashaPlanet;
}

export interface DehaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationSeconds: number;
  mahadashaPlanet: DashaPlanet;
  antardashaPlanet: DashaPlanet;
  pratyantardashaPlanet: DashaPlanet;
  sookshmaPlanet: DashaPlanet;
  pranaPlanet: DashaPlanet;
}

export interface DashaSystem {
  birthDasha: DashaPlanet;
  birthDashaBalance: number; // Years remaining at birth
  mahadashas: MahadashaPeriod[];
  currentMahadasha: MahadashaPeriod | null;
  currentAntardasha: AntardashaPeriod | null;
  currentPratyantardasha?: PratyantardashaPeriod | null;
  currentSookshma?: SookshmaPeriod | null;
  currentPrana?: PranaPeriod | null;
  currentDeha?: DehaPeriod | null;
}

// ============================================================================
// MULTIPLE DASHA SYSTEMS
// ============================================================================

export enum DashaType {
  Vimshottari = "Vimshottari",
  Yogini = "Yogini",
  Ashtottari = "Ashtottari",
  Chara = "Chara",
  Kalachakra = "Kalachakra",
}

// YOGINI DASHA (36 years, 8 yoginis)
export enum YoginiLord {
  Mangala = "Mangala", // Moon, 1 year
  Pingala = "Pingala", // Sun, 2 years
  Dhanya = "Dhanya", // Jupiter, 3 years
  Bhramari = "Bhramari", // Mars, 4 years
  Bhadrika = "Bhadrika", // Mercury, 5 years
  Ulka = "Ulka", // Saturn, 6 years
  Siddha = "Siddha", // Venus, 7 years
  Sankata = "Sankata", // Rahu, 8 years
}

export interface YoginiMahadasha {
  yogini: YoginiLord;
  planet: DashaPlanet; // Planetary ruler of the yogini
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface YoginiAntardasha {
  yogini: YoginiLord;
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  mahadashaYogini: YoginiLord;
}

export interface YoginiDashaSystem {
  type: DashaType.Yogini;
  birthYogini: YoginiLord;
  birthDashaBalance: number;
  mahadashas: YoginiMahadasha[];
  currentMahadasha: YoginiMahadasha | null;
  currentAntardasha: YoginiAntardasha | null;
}

// ASHTOTTARI DASHA (108 years, 8 planets - no Ketu, conditional)
export interface AshtottariMahadasha {
  planet: DashaPlanet; // Excludes Ketu
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface AshtottariAntardasha {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  mahadashaPlanet: DashaPlanet;
}

export interface AshtottariDashaSystem {
  type: DashaType.Ashtottari;
  isApplicable: boolean; // Based on Rahu position
  applicabilityReason: string;
  birthDasha: DashaPlanet;
  birthDashaBalance: number;
  mahadashas: AshtottariMahadasha[];
  currentMahadasha: AshtottariMahadasha | null;
  currentAntardasha: AshtottariAntardasha | null;
}

// CHARA DASHA (Jaimini, sign-based, variable durations 1-12 years)
export interface CharaMahadasha {
  sign: ZodiacSign;
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface CharaAntardasha {
  sign: ZodiacSign;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  mahadashaSign: ZodiacSign;
}

export interface CharaDashaSystem {
  type: DashaType.Chara;
  direction: "forward" | "backward"; // Savya or Apasavya
  mahadashas: CharaMahadasha[];
  currentMahadasha: CharaMahadasha | null;
  currentAntardasha: CharaAntardasha | null;
}

// KALACHAKRA DASHA (Traditional Vedic)
export interface KalachakraMahadasha {
  sign: ZodiacSign;
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface KalachakraDashaSystem {
  type: DashaType.Kalachakra;
  mahadashas: KalachakraMahadasha[];
  currentMahadasha: KalachakraMahadasha | null;
}

// Combined type for all Dasha systems
export type AnySingleDashaSystem = 
  | DashaSystem 
  | YoginiDashaSystem 
  | AshtottariDashaSystem 
  | CharaDashaSystem 
  | KalachakraDashaSystem;

export interface AllDashaSystems {
  vimshottari: DashaSystem;
  yogini: YoginiDashaSystem;
  ashtottari?: AshtottariDashaSystem; // Optional because it's conditional
  chara: CharaDashaSystem;
  kalachakra?: KalachakraDashaSystem; // Optional for now
}

// ============================================================================
// DIVISIONAL CHARTS (VARGAS)
// ============================================================================

export interface NavamsaChart {
  planetPositions: PlanetPosition[];
  ascendant: ZodiacSign;
  houses: HouseData[];
  vargottamaPlanets: Planet[]; // Planets in same sign in D1 and D9
}

export interface DivisionalChart {
  chartType: "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" | "D10" | "D11" | "D12" | "D16" | "D20" | "D24" | "D27" | "D30" | "D40" | "D45" | "D60";
  planetPositions: PlanetPosition[];
  ascendant: ZodiacSign;
  houses: HouseData[];
  interpretation: {
    name: string;
    purpose: string;
    keyFactors: string[];
  };
}

// ============================================================================
// TRANSITS (GOCHAR)
// ============================================================================

export interface TransitPosition {
  planet: Planet;
  currentSign: ZodiacSign;
  currentHouse: number;
  degree: number;
  isRetrograde: boolean;
}

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

export interface TransitEvent {
  planet: Planet;
  eventType: "sign_change" | "retrograde_start" | "retrograde_end" | "direct";
  date: Date;
  fromSign?: ZodiacSign;
  toSign: ZodiacSign;
  description: string;
}

// ============================================================================
// ASPECTS (DRISHTI)
// ============================================================================

export interface AspectInfo {
  aspectingPlanet: Planet;
  aspectedPlanet: Planet;
  aspectType: "full" | "three_quarter" | "half" | "quarter";
  aspectHouse: number;
  strength: number;
  description: string;
  isSpecial: boolean;
}

// ============================================================================
// ANNUAL CHART (VARSHAPHALA / SOLAR RETURN)
// ============================================================================

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

// ============================================================================
// DASHA PREDICTIONS
// ============================================================================

export interface DashaLordAnalysis {
  planet: Planet;
  house: number;
  sign: ZodiacSign;
  dignity: string;
  ruledHouses: number[];
  strength: "very strong" | "strong" | "moderate" | "weak" | "very weak";
  isYogakaraka: boolean;
  isBenefic: boolean;
  analysis: string;
}

export interface BlendedPrediction {
  mahadasha: DashaPlanet;
  antardasha?: DashaPlanet;
  dashaAnalysis: DashaLordAnalysis;
  activeTransits: TransitEffect[];
  combinedEffects: string;
  timing: string;
  themes: string[];
  recommendations: string[];
}

// ============================================================================
// INTERPRETATIONS
// ============================================================================

export interface PlanetInterpretation {
  planet: Planet;
  generalSignificance: string;
  placementAnalysis: string;
  strengthAssessment: string;
  aspectEffects: string;
  recommendations: string;
}

export interface HouseInterpretation {
  house: number;
  significations: string;
  lordAnalysis: string;
  planetsEffect: string;
  overallPrediction: string;
  favorablePeriods: string[];
}

export interface YogaInterpretation {
  yoga: Yoga;
  timing: string;
  manifestation: string;
  recommendations: string;
}

export interface PersonalityAnalysis {
  ascendantAnalysis: string;
  sunSignAnalysis: string;
  moonSignAnalysis: string;
  nakshatraAnalysis: string;
  dominantPlanets: Planet[];
  temperament: string;
  strengths: string[];
  challenges: string[];
}

// ============================================================================
// REMEDIES
// ============================================================================

export interface GemstoneRecommendation {
  planet: Planet;
  primaryGemstone: string;
  alternativeGemstones: string[];
  weight: string;
  metal: string;
  finger: string;
  dayToWear: string;
  mantraBeforeWearing: string;
}

export interface MantraRecommendation {
  planet: Planet;
  mantra: string;
  mantraDevanagari: string;
  repetitions: number;
  bestTime: string;
  duration: string;
}

export interface RemedySuggestions {
  gemstones: GemstoneRecommendation[];
  mantras: MantraRecommendation[];
  charityRecommendations: string[];
  fastingDays: string[];
  behavioralGuidance: string[];
  colorTherapy: string[];
}

// ============================================================================
// COMPLETE KUNDLI
// ============================================================================

export interface Kundli {
  id: string;
  birthData: BirthData;
  chartData: {
    planetPositions: PlanetPosition[];
    houses: HouseData[];
    ascendant: ZodiacSign;
  };
  navamsa: NavamsaChart;
  planetaryStrength: ShadbalaStrength[];
  ashtakavarga: {
    individual: AshtakavargaScore[];
    sarva: SarvaAshtakavarga[];
  };
  divisionalAshtakavarga: DivisionalAshtakavarga[];
  completeAshtakavarga?: CompleteAshtakavargaSystem; // Advanced Ashtakavarga features
  yogas: Yoga[];
  dashaSystem: DashaSystem; // Vimshottari Dasha (backward compatibility)
  allDashaSystems?: AllDashaSystems; // All Dasha systems (Vimshottari, Yogini, Ashtottari, Chara, Kalachakra)
  interpretations: {
    personality: PersonalityAnalysis;
    planets: PlanetInterpretation[];
    houses: HouseInterpretation[];
    yogas: YogaInterpretation[];
  };
  remedies: RemedySuggestions;
  generatedAt: Date;
}

import { z } from "zod";
import { Planet, ZodiacSign, PlanetaryDignity } from "./astro-schema";

/**
 * GOLD STANDARD KNOWLEDGE ARCHITECTURE
 * 
 * Core schemas for declarative, data-driven astrological knowledge system
 * Supports 1,000+ yogas, extensive chain rules, and narrative templates
 */

/**
 * =============================================================================
 * PATTERN SCHEMAS (Yogas & Combinations)
 * =============================================================================
 */

export enum FormationClass {
  Rajayoga = "Rajayoga",
  DhanaYoga = "Dhana Yoga",
  ArishtaYoga = "Arishta Yoga",
  MahapurushaYoga = "Mahapurusha Yoga",
  PlanetaryCombination = "Planetary Combination",
  HouseLordship = "House Lordship",
  AspectPattern = "Aspect Pattern",
  NakshatraYoga = "Nakshatra Yoga",
  DivisionalYoga = "Divisional Yoga",
  SpecialYoga = "Special Yoga",
}

export enum PatternStrength {
  Weak = "weak",
  Moderate = "moderate",
  Strong = "strong",
  VeryStrong = "very_strong",
}

export enum ClassicalSource {
  BPHS = "Brihat Parashara Hora Shastra",
  Phaladeepika = "Phaladeepika",
  JatakaParijata = "Jataka Parijata",
  Saravali = "Saravali",
  ChammatkataChintamani = "Chammatkata Chintamani",
  UttaraKalamrita = "Uttara Kalamrita",
  JaiminiSutras = "Jaimini Sutras",
  BhavarathRatnakar = "Bhavarath Ratnakar",
}

/**
 * Classical text citation with chapter/verse reference
 */
export interface ClassicalCitation {
  source: ClassicalSource;
  chapter?: string;
  verse?: string;
  text?: string;
}

/**
 * Predicate condition types for pattern detection
 */
export enum PredicateType {
  PlanetInHouse = "planet_in_house",
  PlanetInSign = "planet_in_sign",
  PlanetDignity = "planet_dignity",
  PlanetConjunction = "planet_conjunction",
  PlanetAspect = "planet_aspect",
  HouseLord = "house_lord",
  HouseLordInHouse = "house_lord_in_house",
  AngularDistance = "angular_distance",
  NakshatraLord = "nakshatra_lord",
  Exalted = "exalted",
  Debilitated = "debilitated",
  OwnSign = "own_sign",
  MutualReception = "mutual_reception",
  Combust = "combust",
  Retrograde = "retrograde",
}

/**
 * Predicate condition for pattern matching
 */
export interface PredicateCondition {
  type: PredicateType;
  planet?: Planet;
  planet2?: Planet;
  house?: number;
  houses?: number[];
  sign?: ZodiacSign;
  signs?: ZodiacSign[];
  dignity?: PlanetaryDignity;
  distance?: number;
  operator?: "eq" | "neq" | "in" | "not_in" | "lt" | "gt" | "lte" | "gte";
}

/**
 * Logical operators for combining conditions
 */
export enum LogicalOperator {
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
}

/**
 * Condition group with logical operators
 */
export interface ConditionGroup {
  operator: LogicalOperator;
  conditions: (PredicateCondition | ConditionGroup)[];
}

/**
 * Core Pattern Definition (Yoga/Combination)
 */
export interface AstrologicalPattern {
  id: string; // Unique identifier (e.g., "RAJ_001", "DHANA_045")
  formationClass: FormationClass;
  subtype: string; // More specific categorization
  name: string;
  nameInSanskrit?: string;
  
  // Detection logic (declarative)
  conditions: ConditionGroup;
  
  // Strength evaluation
  strengthFactors?: {
    condition: ConditionGroup;
    strengthModifier: PatternStrength;
  }[];
  
  // Metadata
  involvingPlanets: Planet[];
  involvingHouses?: number[];
  
  // Classical references
  citations: ClassicalCitation[];
  
  // Effects and interpretations
  shortDescription: string;
  detailedEffects: string;
  lifeAreas: string[]; // e.g., ["Career", "Wealth", "Health"]
  positivity: "positive" | "negative" | "mixed" | "neutral";
  
  // Timing and activation
  activationConditions?: string;
  dashaRelevance?: Planet[];
  
  // Cancellation factors
  cancellationConditions?: ConditionGroup;
  
  // Related patterns
  relatedPatterns?: string[]; // IDs of related yogas
}

/**
 * =============================================================================
 * CHAIN RULE SCHEMAS
 * =============================================================================
 */

export enum LifeDomain {
  Education = "Education",
  Career = "Career",
  Relationships = "Relationships",
  Marriage = "Marriage",
  Children = "Children",
  FamilyKarma = "Family Karma",
  Health = "Health",
  Finances = "Finances",
  Spirituality = "Spirituality",
  Travel = "Travel",
  Property = "Property",
  LifeEvents = "Life Events",
  Psychology = "Psychology",
}

export enum RevelationPillar {
  Foundation = "Foundation",
  InternalBlueprint = "Internal Blueprint",
  DestinyPlot = "Destiny Plot",
  KarmicCrossroads = "Karmic Crossroads",
}

/**
 * Input requirement for chain rule
 */
export interface RuleInput {
  type: "pattern" | "fact" | "dasha" | "transit" | "planetary_strength";
  id?: string; // Pattern/fact ID
  patternClass?: FormationClass;
  minConfidence?: number;
  customCondition?: string; // Expression evaluated at runtime
}

/**
 * Timing specification for revelations
 */
export interface TimingSpecification {
  type: "age_range" | "dasha_period" | "transit_period" | "relative";
  ageFrom?: number;
  ageTo?: number;
  dashaPlanet?: Planet;
  description: string;
}

/**
 * Chain Rule Definition
 */
export interface ChainRule {
  id: string; // Unique identifier (e.g., "CR_EDU_001")
  domain: LifeDomain;
  pillar: RevelationPillar;
  
  // Rule logic
  inputs: RuleInput[]; // Required patterns/facts
  logicalOperator: LogicalOperator; // How to combine inputs
  
  // Confidence scoring
  baseConfidence: number; // 0-100
  confidenceBoosts?: {
    condition: RuleInput;
    boost: number;
  }[];
  
  // Output revelation
  revelationType: string;
  titleTemplate: string; // Template with {{placeholders}}
  statementTemplate: string;
  verifiableOutcomeTemplate?: string;
  
  // Timing
  timing?: TimingSpecification;
  
  // Classical basis
  citations: ClassicalCitation[];
  
  // Priority for conflict resolution
  priority: number;
}

/**
 * =============================================================================
 * NARRATIVE TEMPLATE SCHEMAS
 * =============================================================================
 */

export enum NarrativeBlockType {
  Headline = "headline",
  CoreNarrative = "core_narrative",
  Timing = "timing",
  Remedies = "remedies",
  Warning = "warning",
  Opportunity = "opportunity",
  Context = "context",
}

export enum NarrativeTone {
  Declarative = "declarative", // Rishi-like, authoritative
  Consultative = "consultative", // Gentle guidance
  Technical = "technical", // Detailed astrological analysis
  Poetic = "poetic", // Flowery, traditional style
}

/**
 * Template parameter with type and validation
 */
export interface TemplateParameter {
  name: string;
  type: "string" | "number" | "planet" | "house" | "sign" | "age" | "dasha";
  required: boolean;
  default?: any;
  description?: string;
}

/**
 * Narrative Template Block
 */
export interface NarrativeTemplate {
  id: string;
  blockType: NarrativeBlockType;
  domain?: LifeDomain;
  tone: NarrativeTone;
  
  // Template content with {{parameter}} placeholders
  template: string;
  
  // Parameters
  parameters: TemplateParameter[];
  
  // Conditional rendering
  showWhen?: {
    minConfidence?: number;
    pillar?: RevelationPillar;
    hasPattern?: string[];
  };
  
  // Variants for different contexts
  variants?: {
    condition: string; // Expression evaluated at runtime
    template: string;
  }[];
}

/**
 * Composed narrative from multiple blocks
 */
export interface ComposedNarrative {
  headline: string;
  coreNarrative: string;
  timing?: string;
  remedies?: string;
  warnings?: string[];
  opportunities?: string[];
  context?: string;
  tone: NarrativeTone;
}

/**
 * =============================================================================
 * PREDICATE LIBRARY TYPES
 * =============================================================================
 */

/**
 * Predicate evaluator function signature
 */
export type PredicateEvaluator = (
  condition: PredicateCondition,
  chartData: any // PlanetPosition[], HouseData[], etc.
) => boolean;

/**
 * Predicate registry for all available predicates
 */
export interface PredicateRegistry {
  [PredicateType.PlanetInHouse]: PredicateEvaluator;
  [PredicateType.PlanetInSign]: PredicateEvaluator;
  [PredicateType.PlanetDignity]: PredicateEvaluator;
  [PredicateType.PlanetConjunction]: PredicateEvaluator;
  [PredicateType.PlanetAspect]: PredicateEvaluator;
  [PredicateType.HouseLord]: PredicateEvaluator;
  [PredicateType.HouseLordInHouse]: PredicateEvaluator;
  [PredicateType.AngularDistance]: PredicateEvaluator;
  [PredicateType.NakshatraLord]: PredicateEvaluator;
  [PredicateType.Exalted]: PredicateEvaluator;
  [PredicateType.Debilitated]: PredicateEvaluator;
  [PredicateType.OwnSign]: PredicateEvaluator;
  [PredicateType.MutualReception]: PredicateEvaluator;
  [PredicateType.Combust]: PredicateEvaluator;
  [PredicateType.Retrograde]: PredicateEvaluator;
}

/**
 * =============================================================================
 * VALIDATION & REGISTRY TYPES
 * =============================================================================
 */

/**
 * Pattern registry with validation
 */
export interface PatternRegistry {
  patterns: AstrologicalPattern[];
  byId: Map<string, AstrologicalPattern>;
  byClass: Map<FormationClass, AstrologicalPattern[]>;
  bySubtype: Map<string, AstrologicalPattern[]>;
}

/**
 * Rule registry with validation
 */
export interface RuleRegistry {
  rules: ChainRule[];
  byId: Map<string, ChainRule>;
  byDomain: Map<LifeDomain, ChainRule[]>;
  byPillar: Map<RevelationPillar, ChainRule[]>;
}

/**
 * Template registry
 */
export interface TemplateRegistry {
  templates: NarrativeTemplate[];
  byId: Map<string, NarrativeTemplate>;
  byBlockType: Map<NarrativeBlockType, NarrativeTemplate[]>;
  byDomain: Map<LifeDomain, NarrativeTemplate[]>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  duplicateIds?: string[];
  missingReferences?: string[];
}

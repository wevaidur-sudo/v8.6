/**
 * Yoga System - Main Export
 * Clean 3-layer modular architecture:
 * 1. Helpers (utility functions)
 * 2. Data (yoga definitions)
 * 3. Engine (detection logic)
 */

import type { PlanetPosition, HouseData, Yoga } from "@shared/astro-schema";
import { detectYogasFromDefinitions } from "./engine";
import { 
  MAHAPURUSHA_YOGAS, 
  SPECIALIZED_YOGAS,
  NABHASA_SANKHYA_YOGAS,
  NABHASA_ASRAYA_YOGAS,
  NABHASA_DALA_YOGAS,
  NABHASA_AKRITI_YOGAS,
  LUNAR_YOGAS,
  SOLAR_YOGAS,
} from "./data";
import { detectYogas as detectYogasLegacy } from "../yoga-detection";

// Layer 1: Helpers - Utility functions
export * from "./helpers";

// Layer 2: Data - Yoga definitions
export * from "./data";

// Layer 3: Engine - Detection logic
export * from "./engine";

// ============================================================================
// Main Detection Function - Hybrid Approach
// ============================================================================

/**
 * Detect all yogas using hybrid approach:
 * 1. New data-driven system for migrated yogas
 * 2. Legacy function-based system for remaining yogas
 * 
 * This allows gradual migration from function-based to data-driven detection
 * while maintaining backward compatibility
 */
export function detectYogas(
  planetPositions: PlanetPosition[],
  houses: HouseData[]
): Yoga[] {
  const yogas: Yoga[] = [];

  // Phase 1: Detect yogas using new data-driven system
  const allYogaDefinitions = [
    ...MAHAPURUSHA_YOGAS,
    ...SPECIALIZED_YOGAS,
    ...NABHASA_SANKHYA_YOGAS,
    ...NABHASA_ASRAYA_YOGAS,
    ...NABHASA_DALA_YOGAS,
    ...NABHASA_AKRITI_YOGAS,
    ...LUNAR_YOGAS,
    ...SOLAR_YOGAS,
  ];
  
  const dataDrivernYogas = detectYogasFromDefinitions(
    allYogaDefinitions,
    planetPositions,
    houses
  );
  yogas.push(...dataDrivernYogas);

  // Phase 2: Detect remaining yogas using legacy system
  // Filter out yogas already detected by new system to avoid duplicates
  const legacyYogas = detectYogasLegacy(planetPositions, houses);
  const newSystemYogaNames = new Set(dataDrivernYogas.map(y => y.name));
  
  const uniqueLegacyYogas = legacyYogas.filter(
    yoga => !newSystemYogaNames.has(yoga.name)
  );
  yogas.push(...uniqueLegacyYogas);

  return yogas;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use the new data-driven system instead
 */
export { detectYogas as detectYogasLegacy } from "../yoga-detection";

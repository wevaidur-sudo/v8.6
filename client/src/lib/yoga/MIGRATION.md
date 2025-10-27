# Yoga Detection System Migration Guide

## Overview

The yoga detection system is being migrated from a **function-based approach** to a **data-driven approach** for better maintainability, type safety, and extensibility.

## Architecture

### Current State: Hybrid System

The system currently uses both approaches:

1. **Data-Driven System** (New - Preferred)
   - Location: `client/src/lib/yoga/`
   - Yogas defined as structured data in `data.ts`
   - Detection logic in `engine.ts`
   - Utilities in `helpers.ts`

2. **Function-Based System** (Legacy - Being Phased Out)
   - Location: `client/src/lib/yoga-detection.ts`
   - 2267 lines of hard-coded detection logic
   - 18 detection functions

### Key Improvements

#### 1. Type Safety
- **Before**: `customCheck: string` (any string allowed)
- **After**: `customCheck: CustomCheckType` (enum with specific values)

```typescript
// Old way (unsafe)
customCheck: "jupiter_kendra_from_moon"  // Typos not caught!

// New way (type-safe)
customCheck: CustomCheckType.JupiterKendraFromMoon  // Compile-time validation
```

#### 2. Maintainability
- **Before**: Logic scattered across 18 functions
- **After**: Centralized data definitions, reusable detection engine

#### 3. Extensibility
- **Before**: Add new yoga = write new function + update main detector
- **After**: Add new yoga = add data definition (engine handles detection)

## Migration Status

### ✅ Completed

1. **Mahapurusha Yogas (5 yogas)**
   - Ruchaka Yoga (Mars)
   - Bhadra Yoga (Mercury)
   - Hamsa Yoga (Jupiter)
   - Malavya Yoga (Venus)
   - Shasha Yoga (Saturn)

2. **Specialized Yogas (5 yogas)**
   - Gaja Kesari Yoga
   - Budha Aditya Yoga
   - Amala Yoga
   - Chamara Yoga
   - Kaal Sarp Yoga

### 🔄 In Progress

The following yogas still use the legacy system but will be migrated:

1. **Nabhasa Yogas** (31 yogas from BPHS Ch. 35)
2. **Lunar Yogas** (Chandra yogas)
3. **Solar Yogas** (Surya yogas)
4. **Raja Yogas** (BPHS + Additional)
5. **Dhana Yogas** (Wealth combinations)
6. **Conjunction Yogas** (Planet pair effects)
7. **Bhava Yogas** (House-based)
8. **Parivartana Yogas** (Exchange yogas)
9. **Arishta Yogas** (Affliction yogas)
10. **Specialized Yogas** (Remaining)

## How to Migrate a Yoga

### Step 1: Define the Yoga in `data.ts`

```typescript
export const YOUR_YOGA_CATEGORY: YogaDefinition[] = [
  {
    type: YogaType.YourYogaType,
    name: "Yoga Name",
    source: "BPHS Ch. XX",  // Classical source reference
    category: YogaCategory.YourCategory,
    detectionType: DetectionType.YourDetectionType,
    conditions: {
      // Define conditions here
      specificPlanet: Planet.Mars,
      houses: [1, 4, 7, 10],
      dignities: [PlanetaryDignity.Exalted],
      customCheck: CustomCheckType.YourCustomCheck,  // If needed
    },
    effects: "Description of yoga effects...",
    strengthRules: [
      { condition: "exalted", strength: "strong" },
      { condition: "own_sign", strength: "moderate" },
    ],
  },
];
```

### Step 2: Add Custom Check (If Needed)

If your yoga requires complex logic, add to `CustomCheckType` enum:

```typescript
export enum CustomCheckType {
  // ... existing values
  YourNewCheck = "your_new_check",
}
```

Then implement the check function in `engine.ts`:

```typescript
export function checkYourCondition(
  planetPositions: PlanetPosition[]
): boolean {
  // Implement logic
  return true;
}
```

And add to the switch statement in `detectYogaFromDefinition`.

### Step 3: Add to Main Definitions Array

In `yoga/index.ts`, add your new category:

```typescript
const allYogaDefinitions = [
  ...MAHAPURUSHA_YOGAS,
  ...SPECIALIZED_YOGAS,
  ...YOUR_YOGA_CATEGORY,  // Add here
];
```

### Step 4: Test

Run the test suite:

```bash
npx tsx client/src/lib/yoga/yoga-engine.test.ts
```

Add specific tests for your yoga in the test file.

## Detection Types

The system supports these detection patterns:

1. **PlanetInKendra**: Planet in angular house (1,4,7,10) with dignity
2. **PlanetInHouse**: Planet in specific house(s)
3. **Conjunction**: Planets in same house
4. **HouseLordPlacement**: House lord placement patterns
5. **MutualExchange**: Parivartana yogas
6. **PatternBased**: Complex patterns requiring custom checks
7. **Proximity**: Planets within degrees
8. **Hemming**: Planets hemmed between others
9. **Debilitation**: Debilitation cancellation patterns

## Benefits of Migration

1. **Reduced Code**: ~2267 lines → ~500 lines for equivalent functionality
2. **Type Safety**: Compile-time validation of yoga definitions
3. **Testability**: Easy to unit test with mock data
4. **Documentation**: Source references embedded in data
5. **Consistency**: Same detection logic for all yogas
6. **Extensibility**: Add new detection types without changing engine

## Timeline

- **Phase 1** (✅ Complete): Infrastructure + Mahapurusha + Specialized
- **Phase 2** (Current): Nabhasa + Raja + Dhana yogas
- **Phase 3** (Next): Remaining categories
- **Phase 4** (Final): Remove legacy system

## Backward Compatibility

The system maintains full backward compatibility:

```typescript
// Both work identically
import { detectYogas } from "@/lib/yoga";  // Hybrid (new + legacy)
import { detectYogasLegacy } from "@/lib/yoga";  // Legacy only
```

The hybrid approach ensures no functionality is lost during migration.

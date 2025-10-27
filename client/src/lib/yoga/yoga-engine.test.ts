/**
 * Yoga Detection Engine Tests
 * Comprehensive test suite for yoga detection system
 * Run with: npx tsx client/src/lib/yoga/yoga-engine.test.ts
 */

import {
  getPlanetPosition,
  getHouseLord,
  isKendra,
  isTrikona,
  isDusthana,
  isPlanetStrong,
  areConjunct,
  getPlanetsInHouse,
  isMoonBenefic,
  getBeneficPlanets,
  getMaleficPlanets,
  getHouseDifference,
  getOrdinalSuffix,
  KENDRAS,
  TRIKONAS,
  DUSTHANAS,
} from "./helpers";

import {
  checkJupiterKendraFromMoon,
  checkMercuryNotCombust,
  checkTwoBeneficsInSameGoodHouse,
  checkAllPlanetsBetweenRahuKetu,
  detectYogaFromDefinition,
} from "./engine";

import { MAHAPURUSHA_YOGAS, SPECIALIZED_YOGAS, CustomCheckType } from "./data";

import {
  Planet,
  ZodiacSign,
  PlanetaryDignity,
  type PlanetPosition,
  type HouseData,
} from "@shared/astro-schema";

// ============================================================================
// Test Utilities
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  testCount++;
  if (actual === expected) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ ${message}`);
    console.error(`    Expected: ${expected}, Got: ${actual}`);
  }
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

// ============================================================================
// Mock Data
// ============================================================================

const mockPlanetPositions: PlanetPosition[] = [
  {
    planet: Planet.Sun,
    longitude: 45.5,
    house: 2,
    sign: ZodiacSign.Taurus,
    degree: 15.5,
    dignity: PlanetaryDignity.Neutral,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Moon,
    longitude: 120.0,
    house: 5,
    sign: ZodiacSign.Leo,
    degree: 0.0,
    dignity: PlanetaryDignity.Neutral,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Mars,
    longitude: 280.0,
    house: 10,
    sign: ZodiacSign.Capricorn,
    degree: 10.0,
    dignity: PlanetaryDignity.Exalted,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Mercury,
    longitude: 60.0,
    house: 2,
    sign: ZodiacSign.Gemini,
    degree: 0.0,
    dignity: PlanetaryDignity.OwnSign,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Jupiter,
    longitude: 100.0,
    house: 8,
    sign: ZodiacSign.Cancer,
    degree: 10.0,
    dignity: PlanetaryDignity.Exalted,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Venus,
    longitude: 350.0,
    house: 1,
    sign: ZodiacSign.Pisces,
    degree: 20.0,
    dignity: PlanetaryDignity.Exalted,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Saturn,
    longitude: 200.0,
    house: 7,
    sign: ZodiacSign.Libra,
    degree: 20.0,
    dignity: PlanetaryDignity.Exalted,
    isRetrograde: false,
    isCombust: false,
  },
  {
    planet: Planet.Rahu,
    longitude: 150.0,
    house: 6,
    sign: ZodiacSign.Virgo,
    degree: 0.0,
    dignity: PlanetaryDignity.Neutral,
    isRetrograde: true,
    isCombust: false,
  },
  {
    planet: Planet.Ketu,
    longitude: 330.0,
    house: 12,
    sign: ZodiacSign.Pisces,
    degree: 0.0,
    dignity: PlanetaryDignity.Neutral,
    isRetrograde: true,
    isCombust: false,
  },
];

const mockHouses: HouseData[] = [
  { houseNumber: 1, sign: ZodiacSign.Pisces, lord: Planet.Jupiter },
  { houseNumber: 2, sign: ZodiacSign.Aries, lord: Planet.Mars },
  { houseNumber: 3, sign: ZodiacSign.Taurus, lord: Planet.Venus },
  { houseNumber: 4, sign: ZodiacSign.Gemini, lord: Planet.Mercury },
  { houseNumber: 5, sign: ZodiacSign.Cancer, lord: Planet.Moon },
  { houseNumber: 6, sign: ZodiacSign.Leo, lord: Planet.Sun },
  { houseNumber: 7, sign: ZodiacSign.Virgo, lord: Planet.Mercury },
  { houseNumber: 8, sign: ZodiacSign.Libra, lord: Planet.Venus },
  { houseNumber: 9, sign: ZodiacSign.Scorpio, lord: Planet.Mars },
  { houseNumber: 10, sign: ZodiacSign.Sagittarius, lord: Planet.Jupiter },
  { houseNumber: 11, sign: ZodiacSign.Capricorn, lord: Planet.Saturn },
  { houseNumber: 12, sign: ZodiacSign.Aquarius, lord: Planet.Saturn },
];

// ============================================================================
// Helper Function Tests
// ============================================================================

describe("Helper Functions", () => {
  describe("  Constants", () => {
    assertEquals(KENDRAS.length, 4, "KENDRAS has 4 houses");
    assertEquals(TRIKONAS.length, 3, "TRIKONAS has 3 houses");
    assertEquals(DUSTHANAS.length, 3, "DUSTHANAS has 3 houses");
  });

  describe("  getOrdinalSuffix", () => {
    assertEquals(getOrdinalSuffix(1), "st", "1st");
    assertEquals(getOrdinalSuffix(2), "nd", "2nd");
    assertEquals(getOrdinalSuffix(3), "rd", "3rd");
    assertEquals(getOrdinalSuffix(4), "th", "4th");
    assertEquals(getOrdinalSuffix(11), "th", "11th");
    assertEquals(getOrdinalSuffix(21), "st", "21st");
  });

  describe("  getHouseDifference", () => {
    assertEquals(getHouseDifference(1, 4), 4, "House 1 to 4 is 4th house");
    assertEquals(getHouseDifference(10, 2), 5, "House 10 to 2 is 5th house");
    assertEquals(getHouseDifference(5, 5), 1, "Same house is 1st house");
  });

  describe("  isKendra", () => {
    assert(isKendra(1), "House 1 is Kendra");
    assert(isKendra(4), "House 4 is Kendra");
    assert(isKendra(7), "House 7 is Kendra");
    assert(isKendra(10), "House 10 is Kendra");
    assert(!isKendra(2), "House 2 is not Kendra");
  });

  describe("  isTrikona", () => {
    assert(isTrikona(1), "House 1 is Trikona");
    assert(isTrikona(5), "House 5 is Trikona");
    assert(isTrikona(9), "House 9 is Trikona");
    assert(!isTrikona(2), "House 2 is not Trikona");
  });

  describe("  isDusthana", () => {
    assert(isDusthana(6), "House 6 is Dusthana");
    assert(isDusthana(8), "House 8 is Dusthana");
    assert(isDusthana(12), "House 12 is Dusthana");
    assert(!isDusthana(1), "House 1 is not Dusthana");
  });

  describe("  getPlanetPosition", () => {
    const mars = getPlanetPosition(mockPlanetPositions, Planet.Mars);
    assert(mars !== undefined, "Mars position found");
    assertEquals(mars?.house, 10, "Mars in 10th house");
  });

  describe("  getHouseLord", () => {
    const lord = getHouseLord(mockHouses, 1);
    assertEquals(lord, Planet.Jupiter, "1st house lord is Jupiter");
  });

  describe("  isPlanetStrong", () => {
    const mars = getPlanetPosition(mockPlanetPositions, Planet.Mars);
    assert(mars && isPlanetStrong(mars), "Exalted Mars is strong");
  });

  describe("  areConjunct", () => {
    const sun = getPlanetPosition(mockPlanetPositions, Planet.Sun)!;
    const mercury = getPlanetPosition(mockPlanetPositions, Planet.Mercury)!;
    const mars = getPlanetPosition(mockPlanetPositions, Planet.Mars)!;
    assert(areConjunct(sun, mercury), "Sun and Mercury are conjunct (both in house 2)");
    assert(!areConjunct(sun, mars), "Sun and Mars are not conjunct");
  });

  describe("  getPlanetsInHouse", () => {
    const planetsInHouse2 = getPlanetsInHouse(mockPlanetPositions, 2);
    assertEquals(planetsInHouse2.length, 2, "2 planets in house 2");
  });

  describe("  isMoonBenefic", () => {
    const benefic = isMoonBenefic(mockPlanetPositions);
    assert(benefic !== null, "Moon benefic status determined");
  });

  describe("  getBeneficPlanets", () => {
    const benefics = getBeneficPlanets(mockPlanetPositions);
    assert(benefics.length >= 3, "At least 3 benefic planets");
  });

  describe("  getMaleficPlanets", () => {
    const malefics = getMaleficPlanets(mockPlanetPositions);
    assert(malefics.length >= 3, "At least 3 malefic planets");
  });
});

// ============================================================================
// Custom Check Function Tests
// ============================================================================

describe("Custom Check Functions", () => {
  describe("  checkJupiterKendraFromMoon", () => {
    const result = checkJupiterKendraFromMoon(mockPlanetPositions);
    assert(result === true, "Jupiter is in Kendra from Moon (Moon in house 5, Jupiter in house 8 = 4th from Moon)");
  });

  describe("  checkMercuryNotCombust", () => {
    const result = checkMercuryNotCombust(mockPlanetPositions);
    assert(result === true, "Mercury is not combust (>14 degrees from Sun)");
  });

  describe("  checkTwoBeneficsInSameGoodHouse", () => {
    const result = checkTwoBeneficsInSameGoodHouse(mockPlanetPositions, [1, 4, 7, 10]);
    assert(typeof result === "boolean", "Returns boolean");
  });

  describe("  checkAllPlanetsBetweenRahuKetu", () => {
    const result = checkAllPlanetsBetweenRahuKetu(mockPlanetPositions);
    assert(typeof result === "boolean", "Returns boolean");
  });
});

// ============================================================================
// Yoga Detection Tests
// ============================================================================

describe("Yoga Detection from Definitions", () => {
  describe("  Mahapurusha Yogas", () => {
    // Test Ruchaka Yoga (Mars in Kendra + Exalted/Own Sign)
    const ruchakaYoga = MAHAPURUSHA_YOGAS[0];
    assertEquals(ruchakaYoga.name, "Ruchaka Yoga", "First Mahapurusha yoga is Ruchaka");
    assertEquals(ruchakaYoga.conditions.specificPlanet, Planet.Mars, "Ruchaka yoga requires Mars");
    assert(
      ruchakaYoga.conditions.customCheck === undefined,
      "Ruchaka yoga doesn't use customCheck (uses typed conditions)"
    );

    // Detect Ruchaka Yoga with mock data
    const detectedYoga = detectYogaFromDefinition(
      ruchakaYoga,
      mockPlanetPositions,
      mockHouses
    );
    assert(detectedYoga !== null, "Ruchaka Yoga detected (Mars exalted in 10th house)");
    if (detectedYoga) {
      assertEquals(detectedYoga.name, "Ruchaka Yoga", "Detected yoga name is correct");
      assertEquals(detectedYoga.strength, "strong", "Exalted Mars gives strong yoga");
    }
  });

  describe("  Specialized Yogas with CustomCheckType", () => {
    // Test Gaja Kesari Yoga
    const gajaKesariYoga = SPECIALIZED_YOGAS.find((y) => y.name === "Gaja Kesari Yoga");
    assert(gajaKesariYoga !== undefined, "Gaja Kesari Yoga definition exists");
    if (gajaKesariYoga) {
      assertEquals(
        gajaKesariYoga.conditions.customCheck,
        CustomCheckType.JupiterKendraFromMoon,
        "Uses typed CustomCheckType enum"
      );

      const detectedYoga = detectYogaFromDefinition(
        gajaKesariYoga,
        mockPlanetPositions,
        mockHouses
      );
      assert(detectedYoga !== null, "Gaja Kesari Yoga detected");
    }

    // Test Budha Aditya Yoga
    const budhaAdityaYoga = SPECIALIZED_YOGAS.find((y) => y.name === "Budha Aditya Yoga");
    assert(budhaAdityaYoga !== undefined, "Budha Aditya Yoga definition exists");
    if (budhaAdityaYoga) {
      assertEquals(
        budhaAdityaYoga.conditions.customCheck,
        CustomCheckType.MercuryNotCombust,
        "Uses typed CustomCheckType enum for combustion check"
      );
    }

    // Test Kaal Sarp Yoga
    const kaalSarpYoga = SPECIALIZED_YOGAS.find((y) => y.name === "Kaal Sarp Yoga");
    assert(kaalSarpYoga !== undefined, "Kaal Sarp Yoga definition exists");
    if (kaalSarpYoga) {
      assertEquals(
        kaalSarpYoga.conditions.customCheck,
        CustomCheckType.AllPlanetsBetweenRahuKetu,
        "Uses typed CustomCheckType enum"
      );
    }
  });

  describe("  Type Safety Tests", () => {
    // Verify all custom checks use the enum
    const yogasWithCustomCheck = SPECIALIZED_YOGAS.filter(
      (y) => y.conditions.customCheck !== undefined
    );
    assert(yogasWithCustomCheck.length > 0, "Some yogas use custom checks");

    for (const yoga of yogasWithCustomCheck) {
      assert(
        Object.values(CustomCheckType).includes(yoga.conditions.customCheck!),
        `${yoga.name} uses valid CustomCheckType enum value`
      );
    }
  });
});

// ============================================================================
// Run Tests
// ============================================================================

console.log("\n" + "=".repeat(60));
console.log("Yoga Detection Engine Test Suite");
console.log("=".repeat(60));

// Run all tests
describe("Helper Functions", () => {});
describe("Custom Check Functions", () => {});
describe("Yoga Detection from Definitions", () => {});

// Summary
console.log("\n" + "=".repeat(60));
console.log("Test Summary");
console.log("=".repeat(60));
console.log(`Total Tests: ${testCount}`);
console.log(`✓ Passed: ${passCount}`);
console.log(`✗ Failed: ${failCount}`);
console.log("=".repeat(60));

// Exit with error code if any tests failed
if (failCount > 0) {
  process.exit(1);
}

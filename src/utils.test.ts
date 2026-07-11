import { describe, it, expect } from "vitest";
import {
  calculatePhysicalMetrics,
  getSmartDeviceState,
  validateMfaCode,
  validateEmail,
  sanitizeLocation,
  parseHouseholdSize,
  evaluateSeverity
} from "./utils";

describe("calculatePhysicalMetrics", () => {
  it("should calculate correct metrics for low intensity", () => {
    const metrics = calculatePhysicalMetrics(10);
    expect(metrics.rain).toBe(6);
    expect(metrics.water).toBe(0.12);
    expect(metrics.grid).toBe(97);
    expect(metrics.wind).toBe(5);
  });

  it("should calculate correct metrics for maximum intensity", () => {
    const metrics = calculatePhysicalMetrics(100);
    expect(metrics.rain).toBe(60);
    expect(metrics.water).toBe(1.2);
    expect(metrics.grid).toBe(65);
    expect(metrics.wind).toBe(45);
  });
});

describe("getSmartDeviceState", () => {
  it("should shut off water main (dev-1) when water depth is above 0.5m", () => {
    const lowWaterMetrics = calculatePhysicalMetrics(30); // water = 0.36
    const highWaterMetrics = calculatePhysicalMetrics(80); // water = 0.96

    expect(getSmartDeviceState("dev-1", lowWaterMetrics, 30)).toBe("SAFE / OPEN");
    expect(getSmartDeviceState("dev-1", highWaterMetrics, 80)).toBe("CLOSED (PROTECTIVE)");
  });

  it("should adjust sump pump (dev-2) based on monsoon intensity", () => {
    const lowMetrics = calculatePhysicalMetrics(20);
    const midMetrics = calculatePhysicalMetrics(50);
    const highMetrics = calculatePhysicalMetrics(90);

    expect(getSmartDeviceState("dev-2", lowMetrics, 20)).toBe("STANDBY");
    expect(getSmartDeviceState("dev-2", midMetrics, 50)).toBe("RUNNING (STANDBY ACTIVE)");
    expect(getSmartDeviceState("dev-2", highMetrics, 90)).toBe("RUNNING (HIGH FORCE)");
  });

  it("should close storm blinds (dev-3) when wind speed exceeds 25 knots", () => {
    const lowWindMetrics = calculatePhysicalMetrics(20); // wind = 9
    const highWindMetrics = calculatePhysicalMetrics(80); // wind = 36

    expect(getSmartDeviceState("dev-3", lowWindMetrics, 20)).toBe("UP");
    expect(getSmartDeviceState("dev-3", highWindMetrics, 80)).toBe("CLOSED (REINFORCED)");
  });

  it("should activate generator (dev-4) when power grid stability drops below 70%", () => {
    const normalGridMetrics = calculatePhysicalMetrics(20); // grid = 93
    const emergencyGridMetrics = calculatePhysicalMetrics(90); // grid = 69

    expect(getSmartDeviceState("dev-4", normalGridMetrics, 20)).toBe("CHARGED (100%)");
    expect(getSmartDeviceState("dev-4", emergencyGridMetrics, 90)).toBe("ACTIVE (SUPPLYING POWER)");
  });
});

describe("validateMfaCode", () => {
  it("should return true for valid 6-digit codes", () => {
    expect(validateMfaCode("123456")).toBe(true);
    expect(validateMfaCode("  009988 ")).toBe(true);
  });

  it("should return false for non-numeric or incorrect length codes", () => {
    expect(validateMfaCode("")).toBe(false);
    expect(validateMfaCode("123a56")).toBe(false);
    expect(validateMfaCode("12345")).toBe(false);
    expect(validateMfaCode("1234567")).toBe(false);
  });
});

describe("validateEmail", () => {
  it("should return true for valid emails", () => {
    expect(validateEmail("umeshs2012@gmail.com")).toBe(true);
    expect(validateEmail("test@domain.co.in")).toBe(true);
  });

  it("should return false for invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("invalid_email")).toBe(false);
    expect(validateEmail("test@")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
  });
});

describe("sanitizeLocation", () => {
  it("should strip out hazardous tags and whitespaces", () => {
    expect(sanitizeLocation("<script>Mumbai</script>")).toBe("scriptMumbai/script");
    expect(sanitizeLocation(" Chennai ")).toBe("Chennai");
  });

  it("should return empty string for falsy input", () => {
    expect(sanitizeLocation("")).toBe("");
  });
});

describe("parseHouseholdSize", () => {
  it("should return safe ranges", () => {
    expect(parseHouseholdSize("5")).toBe(5);
    expect(parseHouseholdSize("0")).toBe(1);
    expect(parseHouseholdSize("-2")).toBe(1);
    expect(parseHouseholdSize("25")).toBe(20);
    expect(parseHouseholdSize("abc")).toBe(1);
  });
});

describe("evaluateSeverity", () => {
  it("should evaluate correctly based on parameters", () => {
    expect(evaluateSeverity(5, 0.1, 5)).toBe("Low");
    expect(evaluateSeverity(15, 0.3, 10)).toBe("Medium");
    expect(evaluateSeverity(35, 0.5, 20)).toBe("High");
    expect(evaluateSeverity(10, 0.1, 42)).toBe("Extreme");
  });
});

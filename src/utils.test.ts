import { describe, it, expect } from "vitest";
import { calculatePhysicalMetrics, getSmartDeviceState } from "./utils";

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

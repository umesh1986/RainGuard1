export interface PhysicalMetrics {
  rain: number;
  water: number;
  grid: number;
  wind: number;
}

/**
 * Calculates physical weather metrics based on simulated monsoon intensity (0-100)
 */
export function calculatePhysicalMetrics(monsoonIntensity: number): PhysicalMetrics {
  const rain = Math.round(monsoonIntensity * 0.6); // 0 to 60 mm/hr
  const water = parseFloat((monsoonIntensity * 0.012).toFixed(2)); // 0 to 1.2 meters
  const grid = Math.max(0, Math.round(100 - (monsoonIntensity * 0.35))); // 100% to 65% stability
  const wind = Math.round(monsoonIntensity * 0.45); // 0 to 45 knots
  return { rain, water, grid, wind };
}

/**
 * Determines the target state of a smart IoT device based on physical metrics and intensity
 */
export function getSmartDeviceState(
  deviceId: string,
  metrics: PhysicalMetrics,
  monsoonIntensity: number
): string {
  if (deviceId === "dev-1") {
    return metrics.water > 0.5 ? "CLOSED (PROTECTIVE)" : "SAFE / OPEN";
  } else if (deviceId === "dev-2") {
    if (monsoonIntensity > 75) {
      return "RUNNING (HIGH FORCE)";
    } else if (monsoonIntensity > 40) {
      return "RUNNING (STANDBY ACTIVE)";
    } else {
      return "STANDBY";
    }
  } else if (deviceId === "dev-3") {
    return metrics.wind > 25 ? "CLOSED (REINFORCED)" : "UP";
  } else if (deviceId === "dev-4") {
    return metrics.grid < 70 ? "ACTIVE (SUPPLYING POWER)" : "CHARGED (100%)";
  }
  return "";
}

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

/**
 * Validates whether a 6-digit MFA code is numeric and of length 6.
 */
export function validateMfaCode(code: string): boolean {
  if (!code) return false;
  const trimmed = code.trim();
  return trimmed.length === 6 && /^\d+$/.test(trimmed);
}

/**
 * Validates standard email addresses.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Sanitizes location input to ensure safe display or passing to external services.
 */
export function sanitizeLocation(location: string): string {
  if (!location) return "";
  return location.replace(/[<>]/g, "").trim();
}

/**
 * Parses and returns a safe household size integer between 1 and 20.
 */
export function parseHouseholdSize(size: any): number {
  const parsed = parseInt(size, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  if (parsed > 20) return 20;
  return parsed;
}

/**
 * Rates the severity level of monsoon parameters (Rainfall mm/hr, Water Level meters, Wind knots)
 * returns "Low", "Medium", "High", or "Extreme"
 */
export function evaluateSeverity(rain: number, water: number, wind: number): "Low" | "Medium" | "High" | "Extreme" {
  if (rain >= 50 || water >= 1.0 || wind >= 40) return "Extreme";
  if (rain >= 30 || water >= 0.6 || wind >= 25) return "High";
  if (rain >= 10 || water >= 0.2 || wind >= 12) return "Medium";
  return "Low";
}

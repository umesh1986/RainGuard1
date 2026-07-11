export interface PreparednessPlan {
  summary: string;
  safetyRecommendations: string[];
  travelAdvisory: string;
  checklist: ChecklistItem[];
  smartHomeRecommendations: SmartHomeRecommendation[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: string;
  priority: string; // "High" | "Medium" | "Low"
  description: string;
  checked?: boolean;
  custom?: boolean;
}

export interface SmartHomeRecommendation {
  device: string;
  recommendedState: string;
  triggerCondition: string;
  reason: string;
}

export interface SmartDevice {
  id: string;
  name: string;
  type: string;
  status: "ONLINE" | "OFFLINE";
  state: string;
  autoPilotRule: string;
}

export interface RouteAnalysis {
  safetyRating: string; // "Safe" | "Warning" | "High Risk" | "Severe Danger"
  floodProbability: number;
  hotspots: string[];
  precautions: string[];
  alternativeRouteName: string;
  alternativeRouteAdvice: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface WeatherAlert {
  id: string;
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  time: string;
}

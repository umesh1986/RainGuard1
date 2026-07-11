import React, { useState, useEffect, useRef } from "react";
import {
  CloudRain,
  ShieldAlert,
  CheckSquare,
  Square,
  Home,
  Navigation,
  MessageSquare,
  Settings,
  Lock,
  Unlock,
  Wifi,
  User,
  Moon,
  Sun,
  Zap,
  Droplets,
  Wind,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Key,
  HelpCircle,
  Send,
  Eye,
  Check,
  AlertCircle,
  Phone,
  Copy,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  PreparednessPlan,
  ChecklistItem,
  SmartHomeRecommendation,
  SmartDevice,
  RouteAnalysis,
  ChatMessage,
  WeatherAlert
} from "./types";
import { calculatePhysicalMetrics, getSmartDeviceState } from "./utils";

// Default cities for weather simulation
interface SimulatedCity {
  name: string;
  baseIntensity: number;
  baseWaterLevel: number;
  basePowerGrid: number;
  alerts: Omit<WeatherAlert, "id">[];
}

const SIMULATED_CITIES: Record<string, SimulatedCity> = {
  "Mumbai, India": {
    name: "Mumbai, India",
    baseIntensity: 85,
    baseWaterLevel: 0.45,
    basePowerGrid: 92,
    alerts: [
      { severity: "danger", title: "Heavy Rain & High Tide Warning", message: "Severe waterlogging expected in low-lying areas. Avoid commuting.", time: "10 mins ago" },
      { severity: "warning", title: "Local Train Delays", message: "Western & Central lines running with 15-20 min delays due to water on tracks.", time: "45 mins ago" }
    ]
  },
  "Bangalore, India": {
    name: "Bangalore, India",
    baseIntensity: 60,
    baseWaterLevel: 0.2,
    basePowerGrid: 88,
    alerts: [
      { severity: "warning", title: "Waterlogging at Silk Board & Outer Ring Road", message: "Severe traffic delays expected. Tech parks advised to offer work from home.", time: "15 mins ago" }
    ]
  },
  "Delhi, India": {
    name: "Delhi, India",
    baseIntensity: 50,
    baseWaterLevel: 0.15,
    basePowerGrid: 94,
    alerts: [
      { severity: "warning", title: "Yamuna River Water Level Alert", message: "Water level near danger mark. Low-lying floodplains being evacuated.", time: "1 hour ago" }
    ]
  },
  "Chennai, India": {
    name: "Chennai, India",
    baseIntensity: 40,
    baseWaterLevel: 0.1,
    basePowerGrid: 97,
    alerts: [
      { severity: "info", title: "Drizzle & Strong Coastal Winds", message: "Strong sea winds up to 30 knots. Fishermen advised not to venture out.", time: "3 hours ago" }
    ]
  },
  "Pune, India": {
    name: "Pune, India",
    baseIntensity: 55,
    baseWaterLevel: 0.18,
    basePowerGrid: 91,
    alerts: [
      { severity: "warning", title: "Mutha River Discharge Alert", message: "Khadakwasla dam discharging water. Residents near riverbanks stay on alert.", time: "30 mins ago" }
    ]
  }
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Mumbai, India": { lat: 19.0760, lng: 72.8777 },
  "Bangalore, India": { lat: 12.9716, lng: 77.5946 },
  "Delhi, India": { lat: 28.7041, lng: 77.1025 },
  "Chennai, India": { lat: 13.0827, lng: 80.2707 },
  "Pune, India": { lat: 18.5204, lng: 73.8567 }
};

interface EmergencyContact {
  label: string;
  number: string;
  description: string;
}

const EMERGENCY_NUMBERS: Record<string, EmergencyContact[]> = {
  "Mumbai, India": [
    { label: "Disaster Management Cell", number: "1916", description: "BMC Flood & Rain Helpline" },
    { label: "National Emergency Number", number: "112", description: "All-in-one emergency hotline" },
    { label: "NDRF Control Room", number: "011-23438017", description: "National Disaster Response" },
    { label: "Mumbai Police", number: "100", description: "Local law enforcement" },
    { label: "Ambulance Services", number: "108", description: "Free medical emergencies" },
    { label: "Fire Brigade", number: "101", description: "Fire and rescue support" }
  ],
  "Bangalore, India": [
    { label: "BBMP Control Room (Disaster)", number: "080-22221188", description: "BBMP Central Flood Helpline" },
    { label: "National Emergency Number", number: "112", description: "All-in-one emergency hotline" },
    { label: "NDRF Control Room", number: "011-23438017", description: "National Disaster Response" },
    { label: "Bangalore Police", number: "100", description: "Local law enforcement" },
    { label: "Ambulance Services", number: "108", description: "Free medical emergencies" },
    { label: "BESCOM Electricity Helpline", number: "1912", description: "Power cuts and electric hazards" }
  ],
  "Delhi, India": [
    { label: "Delhi Disaster Management", number: "1077", description: "DDMA Disaster Helpline" },
    { label: "National Emergency Number", number: "112", description: "All-in-one emergency hotline" },
    { label: "NDRF Control Room", number: "011-23438017", description: "National Disaster Response" },
    { label: "Delhi Police", number: "100", description: "Local law enforcement" },
    { label: "Ambulance Services", number: "102", description: "Free medical emergencies" },
    { label: "Flood Control Control Room", number: "011-22421656", description: "Yamuna River Water Level updates" }
  ],
  "Chennai, India": [
    { label: "Disaster Management Cell", number: "1913", description: "Chennai Corp Flood Helpline" },
    { label: "National Emergency Number", number: "112", description: "All-in-one emergency hotline" },
    { label: "NDRF Control Room", number: "011-23438017", description: "National Disaster Response" },
    { label: "Chennai Police", number: "100", description: "Local law enforcement" },
    { label: "Ambulance / Health", number: "108", description: "Free medical emergencies" },
    { label: "Fire & Rescue", number: "101", description: "Fire and rescue support" }
  ],
  "Pune, India": [
    { label: "Pune Disaster Management", number: "020-25501269", description: "PMC Disaster Helpline" },
    { label: "National Emergency Number", number: "112", description: "All-in-one emergency hotline" },
    { label: "NDRF Control Room", number: "011-23438017", description: "National Disaster Response" },
    { label: "Pune Police", number: "100", description: "Local law enforcement" },
    { label: "Ambulance Services", number: "108", description: "Free medical emergencies" },
    { label: "MSEDCL Electricity Helpline", number: "1912", description: "Power cuts and electric hazards" }
  ]
};

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "chk-1", task: "Assemble 3-Day Emergency Survival Pack", category: "Emergency Kit", priority: "High", description: "3 liters of water per person/day, non-perishable nutrient bars, flashlights, extra batteries, and a battery-powered weather radio.", checked: false },
  { id: "chk-2", task: "Secure First Aid Kit & Emergency Meds", category: "Health & Sanitation", priority: "High", description: "Store essential prescriptions, clean bandages, antiseptic wipes, chlorine purification tablets, and mosquito repellents.", checked: false },
  { id: "chk-3", task: "Seal and Elevate Valuables & Identity Papers", category: "Home Protection", priority: "High", description: "Place passports, land deeds, insurance policies, and digital backups inside heavy-duty waterproof zip pouches on high shelves.", checked: false },
  { id: "chk-4", task: "Verify Sump Pump & Battery Backup", category: "Home Protection", priority: "Medium", description: "Inspect cellar sump pump, clean filter screen, and check lead-acid emergency battery charge status.", checked: false },
  { id: "chk-5", task: "Establish Out-Of-Town Family Emergency Contact", category: "Evacuation Ready", priority: "Medium", description: "Designate a relative outside your storm zone as a coordination point if local telecom networks experience outages.", checked: false },
  { id: "chk-6", task: "Charge High-Capacity Power Banks", category: "Emergency Kit", priority: "Medium", description: "Fully charge all portable USB power banks to maintain mobile phone communications during grid blockouts.", checked: false },
  { id: "chk-7", task: "Clear Rooftop Drainage Gutters", category: "Home Protection", priority: "Low", description: "Remove dry leaves, branches, or mud blockages to prevent structural rain leaks during severe downpours.", checked: false }
];

export default function App() {
  // Theme state ('dark' or 'light')
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "checklist" | "smarthome" | "route" | "chat">("dashboard");

  // Location and profile states
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai, India");
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number; isReal: boolean }>(() => {
    return { lat: 19.0760, lng: 72.8777, isReal: false };
  });
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [familySize, setFamilySize] = useState<number>(3);
  const [hasChildren, setHasChildren] = useState<boolean>(true);
  const [hasElderly, setHasElderly] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(true);
  const [hasMobilityIssues, setHasMobilityIssues] = useState<boolean>(false);
  const [housingType, setHousingType] = useState<string>("low-lying area");
  const [smartHomeEnabled, setSmartHomeEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("English");

  // Preparedness plan generated by AI
  const [aiPlan, setAiPlan] = useState<PreparednessPlan | null>(() => {
    const saved = localStorage.getItem("aiPlan");
    return saved ? JSON.parse(saved) : null;
  });

  // Checklist items
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem("checklist");
    return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST_ITEMS;
  });

  // Custom task inputs
  const [newChecklistTask, setNewChecklistTask] = useState("");
  const [newChecklistCategory, setNewChecklistCategory] = useState("Emergency Kit");
  const [newChecklistPriority, setNewChecklistPriority] = useState("Medium");

  // MFA & Profile States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [emailInput, setEmailInput] = useState("umeshs2012@gmail.com");
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(() => {
    return localStorage.getItem("mfaEnabled") === "true";
  });
  const [mfaVerified, setMfaVerified] = useState<boolean>(() => {
    return localStorage.getItem("mfaVerified") === "true";
  });
  const [mfaSecret, setMfaSecret] = useState<string | null>(() => {
    return localStorage.getItem("mfaSecret") || null;
  });
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(() => {
    return localStorage.getItem("mfaQrCode") || null;
  });
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem("mfaBackupCodes");
    return saved ? JSON.parse(saved) : [];
  });
  const [mfaCodeInput, setMfaCodeInput] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Weather intensity & alerts simulation
  const [monsoonIntensity, setMonsoonIntensity] = useState<number>(75);
  const [simulatedRainfall, setSimulatedRainfall] = useState(42); // mm/hr
  const [simulatedWaterLevel, setSimulatedWaterLevel] = useState(0.35); // meters
  const [simulatedPowerGrid, setSimulatedPowerGrid] = useState(94); // %
  const [simulatedWindSpeed, setSimulatedWindSpeed] = useState(28); // knots
  const [alertSound, setAlertSound] = useState(true);
  const [notifications, setNotifications] = useState<WeatherAlert[]>(() => {
    const defaultCityData = SIMULATED_CITIES["Mumbai, India"];
    return defaultCityData.alerts.map((a, i) => ({ ...a, id: `alert-${Date.now()}-${i}` } as WeatherAlert));
  });

  const [liveAiReport, setLiveAiReport] = useState<string>("");
  const [isFetchingLiveWeather, setIsFetchingLiveWeather] = useState(false);

  const fetchLiveWeatherData = async (cityName: string) => {
    setIsFetchingLiveWeather(true);
    try {
      const response = await fetch("/api/live-weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: cityName }),
      });
      if (response.ok) {
        const data = await response.json();
        setMonsoonIntensity(data.intensity);
        setSimulatedRainfall(data.rainfall);
        setSimulatedWaterLevel(data.waterLevel);
        setSimulatedPowerGrid(data.powerGrid);
        setSimulatedWindSpeed(data.windSpeed);
        setNotifications(data.alerts.map((a: any, i: number) => ({ ...a, id: `live-alert-${Date.now()}-${i}` } as WeatherAlert)));
        setLiveAiReport(data.aiReport);
      }
    } catch (err) {
      console.error("Error fetching live weather data:", err);
    } finally {
      setIsFetchingLiveWeather(false);
    }
  };

  useEffect(() => {
    fetchLiveWeatherData(selectedCity);
  }, [selectedCity]);

  // Smart Home Device states
  const [smartDevices, setSmartDevices] = useState<SmartDevice[]>([
    { id: "dev-1", name: "Main Water Shutoff Valve", type: "Valve", status: "ONLINE", state: "SAFE / OPEN", autoPilotRule: "Auto-closes if cellar moisture sensor > 10% or city sewage main backs up" },
    { id: "dev-2", name: "Heavy Duty Sump Pump", type: "Pump", status: "ONLINE", state: "STANDBY", autoPilotRule: "Triggers HIGH RUN if monsoon intensity exceeds 60%" },
    { id: "dev-3", name: "Reinforced Storm Blinds", type: "Blinds", status: "ONLINE", state: "UP", autoPilotRule: "Engages closed if localized wind speed exceeds 30 knots" },
    { id: "dev-4", name: "Emergency Battery Generator", type: "Generator", status: "ONLINE", state: "CHARGED (100%)", autoPilotRule: "Kicks on within 500ms of municipal grid voltage drop" }
  ]);
  const [autoPilotMode, setAutoPilotMode] = useState(true);

  // Travel Routing states
  const [routeStart, setRouteStart] = useState("");
  const [routeEnd, setRouteEnd] = useState("");
  const [routeTransport, setRouteTransport] = useState<string>("car");
  const [routeAnalysis, setRouteAnalysis] = useState<RouteAnalysis | null>(null);
  const [isAnalyzingRoute, setIsAnalyzingRoute] = useState(false);

  // Multilingual Conversational AI Chat states
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: "c-1", sender: "bot", text: "Hello! I am MonsoonReady AI, your storm safety and survival coordinator. Ask me about emergency gear, shelter locations, travel safety, or translated advisories.", timestamp: "Just now" }
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatLanguage, setChatLanguage] = useState("English");

  // General loading state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Emergency contact copy state
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const handleCopyNumber = (num: string) => {
    try {
      navigator.clipboard.writeText(num);
      setCopiedNumber(num);
      setTimeout(() => {
        setCopiedNumber(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const htmlElement = document.documentElement;
    if (theme === "dark") {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem("mfaEnabled", String(mfaEnabled));
    localStorage.setItem("mfaVerified", String(mfaVerified));
    localStorage.setItem("isLoggedIn", String(isLoggedIn));
    if (mfaSecret) localStorage.setItem("mfaSecret", mfaSecret);
    if (mfaQrCode) localStorage.setItem("mfaQrCode", mfaQrCode);
    if (mfaBackupCodes.length) localStorage.setItem("mfaBackupCodes", JSON.stringify(mfaBackupCodes));
  }, [mfaEnabled, mfaVerified, isLoggedIn, mfaSecret, mfaQrCode, mfaBackupCodes]);

  // Synchronize monsoon intensity simulation and automate smart home devices
  useEffect(() => {
    if (isFetchingLiveWeather) return; // Don't overwrite live online values while fetching!

    const metrics = calculatePhysicalMetrics(monsoonIntensity);

    setSimulatedRainfall(metrics.rain);
    setSimulatedWaterLevel(metrics.water);
    setSimulatedPowerGrid(metrics.grid);
    setSimulatedWindSpeed(metrics.wind);
  }, [monsoonIntensity, isFetchingLiveWeather]);

  // Autopilot effects can depend on the actual variables instead!
  useEffect(() => {
    if (autoPilotMode) {
      setSmartDevices(prev => prev.map(dev => {
        const metrics = {
          rain: simulatedRainfall,
          water: simulatedWaterLevel,
          grid: simulatedPowerGrid,
          wind: simulatedWindSpeed
        };
        const newState = getSmartDeviceState(dev.id, metrics, monsoonIntensity);
        return { ...dev, state: newState };
      }));
    }
  }, [simulatedRainfall, simulatedWaterLevel, simulatedPowerGrid, simulatedWindSpeed, monsoonIntensity, autoPilotMode]);

  // Push warning alert if simulated rainfall reaches extreme thresholds
  useEffect(() => {
    if (simulatedRainfall > 40) {
      const exists = notifications.some(n => n.title.includes("Extreme Rainfall Detected"));
      if (!exists) {
        const newAlert: WeatherAlert = {
          id: `crit-alert-${Date.now()}`,
          severity: "danger",
          title: "Extreme Rainfall Detected",
          message: `Simulated precipitation has exceeded critical thresholds (${simulatedRainfall}mm/hr). Low-lying cellar zones are at flash flood risk. Sump pumps engaged automatically.`,
          time: "Just now"
        };
        setNotifications(prev => [newAlert, ...prev]);
        triggerAlertChime();
      }
    }
  }, [simulatedRainfall]);

  // Handle simulated City changes
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const coords = CITY_COORDINATES[cityName];
    if (coords) {
      setGpsCoordinates({ ...coords, isReal: false });
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isReal: true
        });
        setIsDetectingGPS(false);
      },
      (error) => {
        console.error("Error detecting GPS coordinates:", error);
        setIsDetectingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleResetGPS = () => {
    const coords = CITY_COORDINATES[selectedCity];
    if (coords) {
      setGpsCoordinates({ ...coords, isReal: false });
    }
  };

  // Sound generator using Web Audio API to alert on severe hazards
  const triggerAlertChime = () => {
    if (!alertSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Web Audio API not supported yet or gesture required.", e);
    }
  };

  // Submit form to GenAI plan generator
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPlan(true);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: selectedCity,
          familySize,
          hasChildren,
          hasElderly,
          hasPets,
          hasMobilityIssues,
          housingType,
          smartHomeEnabled,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiPlan(data);
        localStorage.setItem("aiPlan", JSON.stringify(data));

        // Incorporate generated checklist items into our user checklist
        if (data.checklist && Array.isArray(data.checklist)) {
          setChecklist(prev => {
            // keep any user-added custom items, but replace defaults with AI curated ones
            const customItems = prev.filter(item => item.custom);
            const aiCuredItems = data.checklist.map((item: any) => ({
              ...item,
              checked: false,
              custom: false
            }));
            return [...aiCuredItems, ...customItems];
          });
        }
        triggerAlertChime();
      } else {
        console.error("Failed to generate AI plan");
      }
    } catch (err) {
      console.error("Error during plan generation API request:", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Analyze Route via AI API
  const handleAnalyzeRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeStart.trim() || !routeEnd.trim()) return;
    setIsAnalyzingRoute(true);

    try {
      const response = await fetch("/api/analyze-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLocation: routeStart,
          endLocation: routeEnd,
          transportMode: routeTransport,
          currentCondition: `Rainfall ${simulatedRainfall}mm/hr, Winds ${simulatedWindSpeed}kts, Sump pump status: Active`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRouteAnalysis(data);
        triggerAlertChime();
      }
    } catch (err) {
      console.error("Error analyzing route:", err);
    } finally {
      setIsAnalyzingRoute(false);
    }
  };

  // Chat conversational AI
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-user`,
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput("");
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          history: chatHistory.map(h => ({ role: h.sender === "user" ? "user" : "model", text: h.text })),
          language: chatLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: `chat-${Date.now()}-bot`,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Checklist manipulations
  const handleToggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleAddCustomChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTask.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-chk-${Date.now()}`,
      task: newChecklistTask,
      category: newChecklistCategory,
      priority: newChecklistPriority,
      description: "Custom user-defined security and protection measure.",
      checked: false,
      custom: true
    };

    setChecklist(prev => [...prev, newItem]);
    setNewChecklistTask("");
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // MFA simulation logic
  const handleMfaSetup = async () => {
    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput })
      });

      if (response.ok) {
        const data = await response.json();
        setMfaSecret(data.secret);
        setMfaQrCode(data.qrCodeUrl);
        setMfaBackupCodes(data.backupCodes);
        setShowMfaModal(true);
      }
    } catch (err) {
      console.error("Error setting up MFA:", err);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError("");

    try {
      const response = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: mfaCodeInput, secret: mfaSecret })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMfaEnabled(true);
        setMfaVerified(true);
        setIsLoggedIn(true);
        setShowMfaModal(false);
        setMfaCodeInput("");
        triggerAlertChime();
      } else {
        setMfaError(data.message || "Invalid 6-digit authentication code.");
      }
    } catch (err) {
      setMfaError("MFA Verification network failure. Try again.");
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setMfaVerified(false);
    setMfaEnabled(false);
    setMfaSecret(null);
    setMfaQrCode(null);
    setMfaBackupCodes([]);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("mfaEnabled");
    localStorage.removeItem("mfaVerified");
    localStorage.removeItem("mfaSecret");
    localStorage.removeItem("mfaQrCode");
    localStorage.removeItem("mfaBackupCodes");
  };

  const triggerMockMfaLogin = () => {
    if (mfaEnabled) {
      setShowLoginModal(true);
    } else {
      setIsLoggedIn(true);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCodeInput.length === 6) {
      setIsLoggedIn(true);
      setMfaVerified(true);
      setShowLoginModal(false);
      setMfaCodeInput("");
      setMfaError("");
    } else {
      setMfaError("Please enter your 6-digit dynamic authentication code.");
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === "dark" ? "bg-[#05070A] text-slate-200" : "bg-[#f4f7f9] text-gray-800"}`}>
      
      {/* Critical Alert Bar */}
      {theme === "dark" ? (
        <div className="bg-red-950/40 border-b border-red-500/30 px-6 py-2 flex items-center justify-between text-xs font-bold tracking-widest text-red-400 uppercase">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Live Advisory: Flash Flood Warning in {selectedCity} area (Next 2 hours)</span>
          </div>
          <div className="flex gap-4">
            <span>Offline Mode: Sync 4m ago</span>
            <span className="text-red-500">● Severe</span>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-between text-xs font-bold tracking-widest text-red-600 uppercase">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Live Advisory: Flash Flood Warning in {selectedCity} area (Next 2 hours)</span>
          </div>
          <div className="flex gap-4">
            <span>Offline Mode: Sync 4m ago</span>
            <span className="text-red-600">● Severe</span>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className={`sticky top-0 z-40 border-b px-4 lg:px-8 py-3 flex items-center justify-between transition-colors ${theme === "dark" ? "bg-[#090C12]/80 border-white/5 backdrop-blur-xl" : "bg-white/90 border-gray-200/80 backdrop-blur"}`} id="app-header">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg text-white transition-all ${theme === "dark" ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-blue-600 glow-blue"}`}>
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight flex items-center space-x-2">
              <span>MonsoonReady</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium">GenAI Active</span>
            </h1>
          </div>
        </div>

        {/* Live System State Indicators */}
        <div className="hidden md:flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Live Sensors</span>
          </div>

          <div className="flex items-center space-x-1.5 font-mono">
            <Wifi className="h-4.5 w-4.5 text-blue-400" />
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Offline Cache Synced</span>
          </div>

          {isLoggedIn ? (
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-mono font-medium ${mfaVerified ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
              {mfaVerified ? <Lock className="h-3.5 w-3.5 mr-0.5" /> : <Unlock className="h-3.5 w-3.5 mr-0.5" />}
              <span>{mfaVerified ? "MFA SECURE" : "MFA NOT SETUP"}</span>
            </div>
          ) : null}
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className={`p-2 rounded-lg border transition-colors ${theme === "dark" ? "border-gray-800 bg-[#1f2937] hover:bg-gray-800 text-amber-300" : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-indigo-600"}`}
            title={theme === "dark" ? "Misty-Day Interface Mode" : "Night Mode Interface"}
            id="theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setAlertSound(prev => !prev)}
            className={`p-2 rounded-lg border transition-colors ${theme === "dark" ? "border-gray-800 bg-[#1f2937] hover:bg-gray-800 text-gray-300" : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"}`}
            title="Toggle Alert Beeps"
            id="sound-toggle"
          >
            {alertSound ? <Volume2 className="h-4.5 w-4.5 text-blue-400" /> : <VolumeX className="h-4.5 w-4.5 text-gray-400" />}
          </button>

          {/* Login/MFA Profile */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span className="hidden lg:inline text-xs font-mono text-gray-400 truncate max-w-[140px]">{emailInput}</span>
              <button
                onClick={handleSignOut}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${theme === "dark" ? "border-red-900/30 bg-red-950/10 hover:bg-red-950/20 text-red-400" : "border-red-200 bg-red-50 hover:bg-red-100 text-red-600"}`}
                id="sign-out-btn"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsLoggedIn(true); // login simple fallback
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              id="login-btn"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-container">
        
        {/* SIDE BAR / QUICK CONTROLS (3 cols) */}
        <aside className="lg:col-span-3 space-y-6" id="dashboard-sidebar">
          
          {/* Quick Location Assessment */}
          <div className={`p-5 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5 relative overflow-hidden" : "bg-white border-gray-200 shadow-sm"}`} id="region-selector-card">
            {theme === "dark" && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.06),transparent_75%)] pointer-events-none"></div>
            )}
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-blue-500 flex items-center space-x-2 relative z-10">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span>Location Context</span>
            </h2>
            <div className="space-y-3 relative z-10">
              <label className="block text-xs text-gray-400 font-medium font-mono">Current Region:</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`w-full p-2.5 text-sm rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                id="city-selector"
              >
                {Object.keys(SIMULATED_CITIES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* EXACT GPS LOCATION */}
              <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-150 shadow-sm"}`} id="gps-location-container">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-400 font-mono font-medium flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    <span>Exact GPS Coordinates</span>
                  </span>
                  <button
                    onClick={handleDetectGPS}
                    disabled={isDetectingGPS}
                    className={`text-[9px] px-2 py-0.5 rounded transition-all flex items-center space-x-1 cursor-pointer ${
                      isDetectingGPS 
                        ? "bg-blue-500/10 text-blue-400" 
                        : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold"
                    }`}
                    title="Retrieve live browser GPS position"
                    id="detect-gps-btn"
                  >
                    <Navigation className={`h-2.5 w-2.5 ${isDetectingGPS ? "animate-spin" : ""}`} />
                    <span>{isDetectingGPS ? "Detecting..." : "Detect Live"}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500">Latitude</span>
                    <span className={`font-bold ${gpsCoordinates.isReal ? "text-emerald-500" : theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {gpsCoordinates.lat.toFixed(6)}° N
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-500">Longitude</span>
                    <span className={`font-bold ${gpsCoordinates.isReal ? "text-emerald-500" : theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {gpsCoordinates.lng.toFixed(6)}° E
                    </span>
                  </div>
                </div>

                {gpsCoordinates.isReal && (
                  <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-700/30 flex justify-between items-center text-[8px]">
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Live Device Location</span>
                    </span>
                    <button 
                      onClick={handleResetGPS}
                      className="text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      Reset to City Default
                    </button>
                  </div>
                )}
              </div>

              <div className={`mt-4 pt-4 border-t space-y-3 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Intensity Score:</span>
                  <span className="font-bold font-mono text-blue-400">{monsoonIntensity}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Simulated Rain:</span>
                  <span className="font-bold font-mono text-blue-400">{simulatedRainfall} mm/hr</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Est. Flood Level:</span>
                  <span className={`font-bold font-mono ${simulatedWaterLevel > 0.4 ? "text-red-400 animate-pulse" : "text-blue-400"}`}>{simulatedWaterLevel} m</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Wind Gusts:</span>
                  <span className="font-bold font-mono text-blue-400">{simulatedWindSpeed} kts</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATED MONSOON CONTROLS */}
          <div className={`p-5 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5 relative overflow-hidden" : "bg-white border-gray-200 shadow-sm"}`} id="simulation-slider-card">
            {theme === "dark" && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.06),transparent_75%)] pointer-events-none"></div>
            )}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-amber-500 flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Weather Simulator</span>
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono uppercase">Interactive</span>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 relative z-10">
              Slide to trigger severe weather conditions. Watch simulated smart-home systems automatically react in real-time.
            </p>

            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <label className="text-gray-400" htmlFor="intensity-range-slider">Monsoon Level</label>
                  <span className="text-amber-400 font-bold">{monsoonIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={monsoonIntensity}
                  onChange={(e) => {
                    setMonsoonIntensity(Number(e.target.value));
                    // auto trigger sounds occasionally
                    if (Number(e.target.value) % 15 === 0) triggerAlertChime();
                  }}
                  className="w-full h-1.5 rounded-lg bg-gray-700 appearance-none cursor-pointer accent-amber-500"
                  id="intensity-range-slider"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>0% Clear Drizzle</span>
                <span>50% Heavy Storm</span>
                <span>100% Super Typhoon</span>
              </div>
            </div>
          </div>

          {/* SECURE DISASTER PROFILE / MFA SETTING */}
          <div className={`p-5 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#0E121A] border-white/5 relative overflow-hidden" : "bg-white border-gray-200 shadow-sm"}`} id="disaster-profile-card">
            {theme === "dark" && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.06),transparent_75%)] pointer-events-none"></div>
            )}
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-emerald-500 flex items-center space-x-2 relative z-10">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <span>Profile Security</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4 relative z-10">
              Secure your safety plans and family medical checklists against grid takeovers or physical access during displacement.
            </p>

            {isLoggedIn ? (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Two-Factor Authentication:</span>
                  <span className={`text-xs font-bold ${mfaEnabled ? "text-emerald-400" : "text-amber-400"}`}>
                    {mfaEnabled ? "ENABLED" : "NOT SETUP"}
                  </span>
                </div>

                {mfaEnabled ? (
                  <div className={`p-3 rounded-xl border space-y-1.5 ${theme === "dark" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-50/50 border-emerald-200"}`}>
                    <div className="flex items-center text-[11px] text-emerald-400 font-mono font-medium">
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      <span>Security Verified</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Your evacuation plans, home checklists, and smart home configs are locked under dynamic MFA authentication.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleMfaSetup}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="setup-mfa-btn"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Setup MFA Profile Shield</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-2 relative z-10">
                <p className="text-xs text-amber-400/80 mb-3">Sign in to initialize secure multi-factor authentication for severe weather emergencies.</p>
                <button
                  onClick={() => setIsLoggedIn(true)}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  id="sign-in-prompt-btn"
                >
                  Sign In to Begin
                </button>
              </div>
            )}
          </div>

          {/* LOCALIZED GOVERNMENT EMERGENCY CONTACTS */}
          <div className={`p-5 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5 relative overflow-hidden" : "bg-white border-gray-200 shadow-sm"}`} id="emergency-contacts-card">
            {theme === "dark" && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.04),transparent_75%)] pointer-events-none"></div>
            )}
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider mb-3 text-red-500 flex items-center space-x-2 relative z-10">
              <Phone className="h-4 w-4 text-red-400 animate-pulse" />
              <span>Emergency Hotlines</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4 relative z-10">
              Official government rescue, medical, and disaster services active in <span className="font-bold text-red-400">{selectedCity}</span>:
            </p>

            <div className="space-y-2.5 relative z-10 max-h-[300px] overflow-y-auto pr-1">
              {EMERGENCY_NUMBERS[selectedCity]?.map((contact, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    theme === "dark" 
                      ? "bg-white/5 border-white/10 hover:border-red-500/30" 
                      : "bg-gray-50 border-gray-150 hover:bg-gray-100/70"
                  }`}
                  id={`emergency-contact-${idx}`}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <h4 className={`text-xs font-bold truncate ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      {contact.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {contact.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyNumber(contact.number)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border ${
                      copiedNumber === contact.number
                        ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                        : theme === "dark"
                        ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                        : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700"
                    }`}
                    title="Click to copy number"
                    id={`emergency-contact-btn-${idx}`}
                  >
                    {copiedNumber === contact.number ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{contact.number}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-3.5 border-t text-[10px] text-center text-gray-400 flex items-center justify-center space-x-1.5 ${theme === "dark" ? "border-white/5" : "border-gray-100"}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>Keep these numbers offline / screenshotted.</span>
            </div>
          </div>

        </aside>

        {/* DASHBOARD ACTIONS & MODULES (9 cols) */}
        <main className="lg:col-span-9 space-y-6" id="dashboard-main-content">
          
          {/* NAVIGATION BAR TABS */}
          <div className={`flex border-b pb-1 overflow-x-auto space-x-2 lg:space-x-4 ${theme === "dark" ? "border-white/5" : "border-gray-200"}`} id="view-tabs">
            {[
              { id: "dashboard", label: "Overview & Generator", icon: Home },
              { id: "checklist", label: "Survival Checklists", icon: CheckSquare },
              { id: "smarthome", label: "Smart Home Shield", icon: Zap },
              { id: "route", label: "Weather Router", icon: Navigation },
              { id: "chat", label: "MonsoonReady AI", icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tab-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? theme === "dark"
                        ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        : "bg-blue-600 text-white shadow-md glow-blue"
                      : theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                  id={`tab-btn-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & PLAN GENERATOR */}
          {activeTab === "dashboard" && (
            <motion.div
              role="tabpanel"
              id="tab-panel-dashboard"
              aria-labelledby="tab-btn-dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* ALERTS FEED */}
              <div className={`p-5 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`} id="alerts-log-container">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="h-5 w-5 text-red-400 animate-pulse" />
                    <h3 className="font-display font-semibold text-sm tracking-wide">Live Low-Latency Alerts Feed</h3>
                  </div>
                  <span className="text-[10px] bg-red-500/10 border border-red-500/25 px-2.5 py-0.5 rounded-full text-red-400 font-mono font-medium flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping"></span>
                    <span>ACTIVE MONSOON ALERT</span>
                  </span>
                </div>

                <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                  {notifications.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-all ${
                        alert.severity === "danger"
                          ? theme === "dark"
                            ? "bg-red-500/5 border-red-500/10 text-red-200"
                            : "bg-red-550 border-red-200 text-red-800"
                          : alert.severity === "warning"
                          ? theme === "dark"
                            ? "bg-amber-500/5 border-amber-500/10 text-amber-200"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                          : theme === "dark"
                          ? "bg-blue-500/5 border-blue-500/10 text-blue-200"
                          : "bg-blue-50 border-blue-200 text-blue-800"
                      }`}
                    >
                      <AlertTriangle className={`h-4.5 w-4.5 mt-0.5 flex-shrink-0 ${alert.severity === "danger" ? "text-red-400 pulse-warning" : alert.severity === "warning" ? "text-amber-400" : "text-blue-400"}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold tracking-wide">{alert.title}</h4>
                          <span className="text-[10px] font-mono opacity-80">{alert.time}</span>
                        </div>
                        <p className="text-[11px] mt-1 opacity-90 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No critical severe weather warnings active for this region.</p>
                  )}
                </div>
              </div>

              {/* REAL-TIME GROUNDED AI CITY ANALYSIS */}
              <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5 relative overflow-hidden" : "bg-white border-gray-200 shadow-sm"}`} id="grounded-ai-weather-report">
                {theme === "dark" && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.04),transparent_65%)] pointer-events-none"></div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 gap-2 border-dashed border-gray-700/30">
                  <div className="flex items-center space-x-2">
                    <CloudRain className="h-5 w-5 text-emerald-400 animate-pulse" />
                    <div>
                      <h3 className="font-display font-semibold text-sm tracking-wide">Real-time Grounded Weather & Flood Advisory</h3>
                      <p className="text-[10px] text-gray-400 font-mono">Live analysis for <span className="text-emerald-400 font-bold">{selectedCity}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">Grounded with Google Search</span>
                  </div>
                </div>

                {isFetchingLiveWeather ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <RefreshCw className="h-7 w-7 text-emerald-400 animate-spin" />
                    <p className="text-xs font-mono text-gray-400 animate-pulse">Running live weather search and analysis...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-invert max-w-none">
                      {liveAiReport ? (
                        <div className="space-y-2">
                          {formatMarkdown(liveAiReport)}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No real-time report loaded yet. Please select a city to begin.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-700/25">
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-emerald-400">Rain rate:</span>
                        <span>{simulatedRainfall} mm/hr</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-emerald-400">Outages:</span>
                        <span>{100 - simulatedPowerGrid}% grid disruption</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-emerald-400">Water log depth:</span>
                        <span>{simulatedWaterLevel} meters</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PERSONALIZED GENERATOR FORM */}
              <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`} id="plan-form-card">
                <div className={`border-b pb-4 mb-5 ${theme === "dark" ? "border-white/5" : "border-gray-150"}`}>
                  <h3 className="font-display font-semibold text-lg tracking-tight flex items-center space-x-2">
                    <CloudRain className="h-5 w-5 text-blue-500" />
                    <span>Personalized GenAI Preparedness Planner</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Input your household parameters. Gemini will instantly compile a tailor-made monsoon preparedness guide, custom home safety steps, smart appliance presets, and specific checklists.
                  </p>
                </div>

                <form onSubmit={handleGeneratePlan} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-mono font-medium" htmlFor="form-city-selector">Select Region & Target Climate:</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className={`w-full p-3 text-sm rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="form-city-selector"
                      >
                        {Object.keys(SIMULATED_CITIES).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-mono font-medium" htmlFor="form-housing-selector">Housing Infrastructure / Elevation:</label>
                      <select
                        value={housingType}
                        onChange={(e) => setHousingType(e.target.value)}
                        className={`w-full p-3 text-sm rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="form-housing-selector"
                      >
                        <option value="low-lying area">Ground Floor / Low-Lying Area (Severe Water Risk)</option>
                        <option value="independent house">Independent House (Roof / Wind Vulnerable)</option>
                        <option value="apartment">Apartment Building Mid-level</option>
                        <option value="basement">Basement Flat (Extreme Backflow Risk)</option>
                        <option value="high-rise">High-Rise Penthouse (High Wind Swell Risk)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-mono font-medium" htmlFor="form-family-input">Household Size (Members):</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={familySize}
                        onChange={(e) => setFamilySize(Number(e.target.value))}
                        className={`w-full p-3 text-sm rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="form-family-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-mono font-medium" htmlFor="form-language-selector">Preferred Support Language:</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={`w-full p-3 text-sm rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="form-language-selector"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="Tagalog">Tagalog (Filipino)</option>
                        <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
                      </select>
                    </div>

                  </div>

                  {/* Demographic & Vulnerability checkmarks */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs text-gray-400 font-mono font-medium block">Vulnerability Indicators (Check all that apply):</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <button
                        type="button"
                        aria-pressed={hasChildren}
                        onClick={() => setHasChildren(prev => !prev)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                          hasChildren
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.15)]"
                            : theme === "dark"
                            ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        id="indicator-children"
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${hasChildren ? "bg-blue-500 border-blue-500 text-white" : "border-gray-500"}`}>
                          {hasChildren && <Check className="h-3 w-3" />}
                        </span>
                        <span>Children</span>
                      </button>

                      <button
                        type="button"
                        aria-pressed={hasElderly}
                        onClick={() => setHasElderly(prev => !prev)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                          hasElderly
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.15)]"
                            : theme === "dark"
                            ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        id="indicator-elderly"
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${hasElderly ? "bg-blue-50 border-blue-50 text-white" : "border-gray-500"}`}>
                          {hasElderly && <Check className="h-3 w-3" />}
                        </span>
                        <span>Elderly Members</span>
                      </button>

                      <button
                        type="button"
                        aria-pressed={hasPets}
                        onClick={() => setHasPets(prev => !prev)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                          hasPets
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.15)]"
                            : theme === "dark"
                            ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        id="indicator-pets"
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${hasPets ? "bg-blue-50 border-blue-50 text-white" : "border-gray-500"}`}>
                          {hasPets && <Check className="h-3 w-3" />}
                        </span>
                        <span>Pets</span>
                      </button>

                      <button
                        type="button"
                        aria-pressed={hasMobilityIssues}
                        onClick={() => setHasMobilityIssues(prev => !prev)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                          hasMobilityIssues
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.15)]"
                            : theme === "dark"
                            ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        id="indicator-mobility"
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${hasMobilityIssues ? "bg-blue-50 border-blue-50 text-white" : "border-gray-500"}`}>
                          {hasMobilityIssues && <Check className="h-3 w-3" />}
                        </span>
                        <span>Mobility Aids</span>
                      </button>

                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      aria-pressed={smartHomeEnabled}
                      onClick={() => setSmartHomeEnabled(prev => !prev)}
                      className={`flex items-center space-x-2 p-1 px-3.5 py-2.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                        smartHomeEnabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : theme === "dark"
                          ? "bg-white/5 border-white/10 text-slate-400"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                      id="form-smarthome-toggle"
                    >
                      <Zap className={`h-4.5 w-4.5 ${smartHomeEnabled ? "text-emerald-400" : "text-gray-400"}`} />
                      <span>Link Smart Home IoT Sensors</span>
                    </button>
                    <span className="text-[11px] text-gray-400 hidden sm:inline">Check this to auto-integrate warning shutoffs and generators with GenAI guidelines.</span>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isGeneratingPlan}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2.5 shadow-lg cursor-pointer transition-all ${
                      isGeneratingPlan
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                        : "bg-blue-600 hover:bg-blue-700 text-white glow-blue"
                    }`}
                    id="generate-plan-submit"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>Generating Optimized Preparedness Plan via Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <CloudRain className="h-4.5 w-4.5" />
                        <span>Generate Personalized GenAI Preparedness Shield</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* GENERATED PLAN RESULTS */}
              {aiPlan && (
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="space-y-6"
                   id="ai-plan-result"
                >
                  <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                    <div className={`flex items-center justify-between border-b pb-4 mb-4 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-emerald-400" />
                        <h4 className="font-display font-semibold text-base">Curated Preparedness Overview ({selectedCity})</h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Localized in {language}</span>
                    </div>

                    <p className="text-xs leading-relaxed text-gray-300 mb-6">{aiPlan.summary}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Safety Rules */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">Targeted Safety Recommendations</h5>
                        <ul className="space-y-2.5">
                          {aiPlan.safetyRecommendations?.map((rec, i) => (
                            <li key={i} className="text-xs leading-relaxed text-gray-300 flex items-start space-x-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Travel & General */}
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl space-y-2 border ${theme === "dark" ? "bg-amber-500/5 border-amber-500/10" : "bg-amber-50 border-amber-200"}`}>
                          <h5 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center space-x-1">
                            <Navigation className="h-4 w-4" />
                            <span>Localized Monsoon Travel Advisory</span>
                          </h5>
                          <p className="text-xs text-gray-300 leading-relaxed">{aiPlan.travelAdvisory}</p>
                        </div>

                        {/* Quick switch to checklists tab notification */}
                        <div className={`p-4 rounded-xl text-center border ${theme === "dark" ? "bg-blue-500/5 border-blue-500/10" : "bg-blue-50 border-blue-200"}`}>
                          <p className="text-[11px] text-gray-400 mb-2">Checklists and smart recommendations have been loaded into their dedicated screens.</p>
                          <button
                            onClick={() => setActiveTab("checklist")}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Go To Interactive Survival Checklist
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE CHECKLISTS */}
          {activeTab === "checklist" && (
            <motion.div
              role="tabpanel"
              id="tab-panel-checklist"
              aria-labelledby="tab-btn-checklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                <div className={`border-b pb-4 mb-5 flex items-center justify-between ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                  <div>
                    <h3 className="font-display font-semibold text-lg tracking-tight">Interactive Emergency Survival Checklist</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Check off items as you secure them. This list auto-persists in your offline device cache to remain functional during complete cell signal loss.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-blue-400 font-bold">
                      {checklist.filter(c => c.checked).length} / {checklist.length} Completed
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full rounded-full h-2 mb-6 overflow-hidden ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}>
                  <div
                    className="bg-blue-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${checklist.length ? (checklist.filter(c => c.checked).length / checklist.length) * 100 : 0}%` }}
                  ></div>
                </div>

                {/* Checklist List */}
                <div className="space-y-3.5 mb-8">
                  {checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheck(item.id)}
                      className={`p-4 rounded-xl border flex items-start space-x-3.5 cursor-pointer transition-all ${
                        item.checked
                          ? theme === "dark"
                            ? "bg-white/5 border-white/5 opacity-50"
                            : "bg-gray-50 border-gray-250 opacity-60"
                          : theme === "dark"
                          ? "bg-[#131822] border-white/5 hover:border-blue-500/30"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <button
                        className="mt-0.5 text-blue-500"
                        aria-label={item.checked ? "Uncheck task" : "Check task"}
                      >
                        {item.checked ? (
                          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 border-2 rounded ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}></div>
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <h4 className={`text-xs font-bold tracking-wide ${item.checked ? "line-through text-gray-500" : theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>{item.task}</h4>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                            item.priority === "High"
                              ? "bg-red-500/10 text-red-400"
                              : item.priority === "Medium"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {item.priority} Priority
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-600"}`}>{item.category}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChecklistItem(item.id);
                        }}
                        className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Delete Checklist Item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}

                  {checklist.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-6">Your emergency checklist is currently empty. Generate an AI Preparedness Plan or add custom tasks below!</p>
                  )}
                </div>

                {/* ADD CUSTOM TASK FORM */}
                <div className={`border-t pt-6 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                  <label className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-3" htmlFor="custom-task-input">Add Custom Safety Action Item</label>
                  <form onSubmit={handleAddCustomChecklistItem} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        required
                        placeholder="e.g., Relocate electric scooter charger to first floor shelf"
                        value={newChecklistTask}
                        onChange={(e) => setNewChecklistTask(e.target.value)}
                        className={`w-full p-2.5 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="custom-task-input"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <select
                        value={newChecklistCategory}
                        onChange={(e) => setNewChecklistCategory(e.target.value)}
                        className={`w-full p-2.5 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="custom-task-category"
                      >
                        <option value="Emergency Kit">Emergency Kit</option>
                        <option value="Home Protection">Home Protection</option>
                        <option value="Health & Sanitation">Health & Sanitation</option>
                        <option value="Evacuation Ready">Evacuation Ready</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <select
                        value={newChecklistPriority}
                        onChange={(e) => setNewChecklistPriority(e.target.value)}
                        className={`w-full p-2.5 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        id="custom-task-priority"
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <button
                        type="submit"
                        className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center p-2 cursor-pointer transition-colors"
                        title="Add Item"
                        id="add-custom-item-btn"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: SMART HOME INTEGRATION */}
          {activeTab === "smarthome" && (
            <motion.div
              role="tabpanel"
              id="tab-panel-smarthome"
              aria-labelledby="tab-btn-smarthome"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                <div className={`border-b pb-4 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                  <div>
                    <h3 className="font-display font-semibold text-lg tracking-tight">Smart Home Mitigation Dashboard</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Simulate high-risk smart home scenarios. Auto-pilot leverages real-time environmental sensors to pre-emptively seal valves, shut shutters, and power pumps.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setAutoPilotMode(prev => !prev)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                        autoPilotMode
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : theme === "dark"
                          ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                          : "bg-gray-200 border-gray-300 text-gray-700"
                      }`}
                      id="autopilot-toggle-btn"
                    >
                      {autoPilotMode ? "IoT Auto-Pilot: ON" : "IoT Auto-Pilot: OFF"}
                    </button>
                  </div>
                </div>

                {/* Simulated Device Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {smartDevices.map(device => (
                    <div
                      key={device.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                        theme === "dark" ? "bg-[#131822] border-white/5 hover:border-blue-500/20 transition-all" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{device.name}</h4>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${theme === "dark" ? "bg-white/5 text-gray-400" : "bg-gray-200/60 text-gray-600"}`}>{device.type}</span>
                        </div>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          device.state.includes("CLOSED") || device.state.includes("RUNNING") || device.state.includes("ACTIVE")
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {device.state}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-mono font-semibold block">Automation Safety Rule:</span>
                        <p className="text-[10px] text-gray-400 italic leading-relaxed">{device.autoPilotRule}</p>
                      </div>

                      <div className={`flex justify-between items-center pt-2 text-[10px] font-mono border-t ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                        <div className="flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-gray-400">Status: {device.status}</span>
                        </div>
                        
                        {/* Mock trigger toggle */}
                        <button
                          onClick={() => {
                            setSmartDevices(prev => prev.map(d => {
                              if (d.id === device.id) {
                                const statesMap: Record<string, string> = {
                                  "Main Water Shutoff Valve": d.state === "SAFE / OPEN" ? "CLOSED (MANUAL OVERRIDE)" : "SAFE / OPEN",
                                  "Heavy Duty Sump Pump": d.state === "STANDBY" ? "RUNNING (MANUAL)" : "STANDBY",
                                  "Reinforced Storm Blinds": d.state === "UP" ? "CLOSED (MANUAL)" : "UP",
                                  "Emergency Battery Generator": d.state.includes("CHARGED") ? "ACTIVE (MANUAL OVERRIDE)" : "CHARGED (100%)"
                                };
                                return { ...d, state: statesMap[d.name] || d.state };
                              }
                              return d;
                            }));
                            triggerAlertChime();
                          }}
                          className={`px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 cursor-pointer`}
                        >
                          Manual Toggle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Alert Notification Center */}
                {smartHomeEnabled && aiPlan && aiPlan.smartHomeRecommendations && (
                  <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/15 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                      <Zap className="h-4 w-4" />
                      <span>Gemini-Calculated Automation Protocols</span>
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      {aiPlan.smartHomeRecommendations.map((rec, i) => (
                        <div key={i} className={`text-xs leading-relaxed text-gray-300 p-2 border-b last:border-0 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                          <div className="font-bold flex justify-between">
                            <span>Device: {rec.device}</span>
                            <span className="text-blue-400 font-mono">Set to {rec.recommendedState}</span>
                          </div>
                          <div className="text-gray-400 font-mono text-[10px] mt-0.5">Trigger: {rec.triggerCondition}</div>
                          <div className="text-gray-400 italic mt-0.5">Reason: {rec.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 4: WEATHER ROUTING */}
          {activeTab === "route" && (
            <motion.div
              role="tabpanel"
              id="tab-panel-route"
              aria-labelledby="tab-btn-route"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                <div className={`border-b pb-4 mb-5 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                  <h3 className="font-display font-semibold text-lg tracking-tight">Weather-Aware Route Advisory & Hazard Mapper</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Check safe routing before heading outdoors. GenAI will analyze flooding hotspots, underpass bottlenecks, and wind hazards along your travel path to suggest optimal, dry shortcuts.
                  </p>
                </div>

                <form onSubmit={handleAnalyzeRoute} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 block font-medium" htmlFor="route-start-input">Starting Location:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Bandra West Terminal"
                      value={routeStart}
                      onChange={(e) => setRouteStart(e.target.value)}
                      className={`w-full p-3 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                      id="route-start-input"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 block font-medium" htmlFor="route-end-input">Destination:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Chhatrapati Shivaji Airport"
                      value={routeEnd}
                      onChange={(e) => setRouteEnd(e.target.value)}
                      className={`w-full p-3 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                      id="route-end-input"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 block font-medium" htmlFor="route-transport-select">Transportation Mode:</label>
                    <select
                      value={routeTransport}
                      onChange={(e) => setRouteTransport(e.target.value)}
                      className={`w-full p-3 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                      id="route-transport-select"
                    >
                      <option value="car">Four-Wheeler / Car (Underpass Vulnerable)</option>
                      <option value="bike">Two-Wheeler / Motorcycle (High Wind Warning)</option>
                      <option value="walk">On-Foot / Pedestrian (Manhole Choke Risk)</option>
                      <option value="train">Local Train Network (Rail Silt Warning)</option>
                    </select>
                  </div>

                  <div className="md:col-span-1 pt-5">
                    <button
                      type="submit"
                      disabled={isAnalyzingRoute}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer shadow transition-colors"
                      id="route-submit-btn"
                    >
                      {isAnalyzingRoute ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <span>Check</span>}
                    </button>
                  </div>
                </form>

                {/* Route Analysis Results */}
                {isAnalyzingRoute && (
                  <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                    <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin text-blue-500" />
                    <p>Gemini AI is scanning local hydrological reports, topography elevation grids, and active drainage blockages along route...</p>
                  </div>
                )}

                {!isAnalyzingRoute && routeAnalysis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                    id="route-results-container"
                  >
                    <div className={`p-5 rounded-xl border ${
                      routeAnalysis.safetyRating === "Severe Danger" || routeAnalysis.safetyRating === "High Risk"
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-amber-500/5 border-amber-500/20"
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`h-5 w-5 ${routeAnalysis.floodProbability > 60 ? "text-red-400 pulse-warning" : "text-amber-400"}`} />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Route Safety Evaluation</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono ${
                          routeAnalysis.safetyRating === "Severe Danger" || routeAnalysis.safetyRating === "High Risk"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>
                          {routeAnalysis.safetyRating}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block font-semibold mb-1">Estimated Road Waterlogging Probability:</span>
                            <div className="flex items-center space-x-3">
                              <div className={`flex-1 rounded-full h-2.5 overflow-hidden ${theme === "dark" ? "bg-white/5" : "bg-gray-200"}`}>
                                <div className={`h-full rounded-full transition-all duration-500 ${
                                  routeAnalysis.floodProbability > 70 ? "bg-red-500" : "bg-amber-500"
                                }`} style={{ width: `${routeAnalysis.floodProbability}%` }}></div>
                              </div>
                              <span className={`text-xs font-bold font-mono ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>{routeAnalysis.floodProbability}%</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-gray-400 block font-semibold">Active Flood Hotspots Detected:</span>
                            <ul className="space-y-1">
                              {routeAnalysis.hotspots.map((spot, i) => (
                                <li key={i} className={`text-[11px] flex items-start space-x-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                  <span className="h-1 w-1 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                  <span>{spot}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-blue-500/5 border-blue-500/10" : "bg-blue-50 border-blue-200"}`}>
                            <span className="text-[10px] font-mono text-blue-400 block font-bold mb-1">Recommended Alternative Path:</span>
                            <h5 className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{routeAnalysis.alternativeRouteName}</h5>
                            <p className="text-[11px] text-gray-400 mt-1 italic">{routeAnalysis.alternativeRouteAdvice}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-gray-400 block font-semibold">Safe Commuting Precautions:</span>
                            <ul className="space-y-1">
                              {routeAnalysis.precautions.map((pre, i) => (
                                <li key={i} className="text-[11px] text-gray-300 flex items-start space-x-2">
                                  <span className="h-1 w-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                  <span>{pre}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 5: MULTILINGUAL CHAT */}
          {activeTab === "chat" && (
            <motion.div
              role="tabpanel"
              id="tab-panel-chat"
              aria-labelledby="tab-btn-chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border transition-all ${theme === "dark" ? "bg-[#090C12] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                <div className={`border-b pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                  <div>
                    <h3 className="font-display font-semibold text-lg tracking-tight">Severe Weather Conversational Assistant</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Translate safety guidelines, formulate custom survival menus, or ask complex hygiene questions. Gemini handles multi-lingual translation on-the-fly.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-gray-400">Language:</span>
                    <select
                      value={chatLanguage}
                      onChange={(e) => setChatLanguage(e.target.value)}
                      className={`p-2 text-xs rounded-lg border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                      id="chat-language-select"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="Tagalog">Tagalog (Filipino)</option>
                      <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
                    </select>
                  </div>
                </div>

                {/* Chat window viewport */}
                <div className={`h-[350px] p-4 rounded-xl border overflow-y-auto mb-4 flex flex-col space-y-4 ${
                  theme === "dark" ? "bg-[#05070A] border-white/5" : "bg-gray-50 border-gray-200"
                }`} id="chat-viewport">
                  {chatHistory.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none shadow"
                          : theme === "dark"
                          ? "bg-[#131822] text-gray-200 rounded-bl-none border border-white/5"
                          : "bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isSendingChat && (
                    <div className="self-start flex flex-col items-start max-w-[80%]">
                      <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                        theme === "dark" ? "bg-[#131822] border border-white/5" : "bg-white border border-gray-200"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick query tags */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2">Recommended Safety Inquiries:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { text: "What's in an emergency survival pack?", label: "Survival Pack" },
                      { text: "How do I secure an apartment balcony from winds?", label: "High Winds Action" },
                      { text: "Translate monsoon safety steps to Spanish", label: "Spanish Guide" },
                      { text: "How should smart home devices behave in floods?", label: "IoT Automation" }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChatInput(btn.text)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          theme === "dark"
                            ? "border-white/5 hover:border-blue-500/30 bg-white/5 text-gray-300 hover:text-white"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600"
                        }`}
                        id={`chat-tag-btn-${i}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat text input */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Ask MonsoonReady AI... (e.g., how to treat storm runoff?)`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className={`flex-1 p-3 text-xs rounded-xl border transition-all outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                    id="chat-text-input"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChat}
                    className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                    id="chat-send-btn"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* FOOTER */}
      <footer className={`border-t py-6 text-center text-xs transition-all ${theme === "dark" ? "border-gray-900 bg-[#090d16] text-gray-500" : "border-gray-200 bg-white text-gray-400"}`} id="app-footer">
        <p className="font-display font-medium">MonsoonReady Platform • Safe Communities Program</p>
        <p className="text-[10px] font-mono mt-1 opacity-70">Secured with Multi-Factor Cryptographic Profiles • All guidelines backed by Gemini LLM Grounding</p>
      </footer>

      {/* MODAL 1: MFA SETUP SHIELD */}
      <AnimatePresence>
        {showMfaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="mfa-setup-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-2xl border ${
                theme === "dark" ? "bg-[#090C12] border-white/5 text-gray-100" : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <div className={`flex justify-between items-start border-b pb-3 mb-4 ${theme === "dark" ? "border-white/5" : "border-gray-200/60"}`}>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Key className="h-5 w-5" />
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider">Setup Cryptographic MFA Shield</h3>
                </div>
                <button
                  onClick={() => setShowMfaModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-sm font-bold p-1 cursor-pointer"
                  id="close-mfa-modal-btn"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Scan the QR code below using your Google Authenticator or Duo app to bind your safety profile. If cell service degrades completely during severe storms, your offline key persists securely.
              </p>

              {/* Mock QR Code Image Display */}
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-gray-200 mb-4">
                {mfaQrCode ? (
                  <img src={mfaQrCode} alt="TOTP MFA QR Code" className="h-[140px] w-[140px]" />
                ) : (
                  <div className="h-[140px] w-[140px] bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center font-mono">
                    Generating Code...
                  </div>
                )}
                <span className="text-[10px] text-gray-500 font-mono mt-2 uppercase">Secret Key: {mfaSecret}</span>
              </div>

              {/* Verification form */}
              <form onSubmit={handleVerifyMfa} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block font-medium" htmlFor="mfa-code-input">Verify 6-Digit Code:</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g., 123456"
                    value={mfaCodeInput}
                    onChange={(e) => setMfaCodeInput(e.target.value)}
                    className={`w-full p-3 text-center tracking-[0.5em] font-mono font-bold text-lg rounded-xl border transition-all outline-none ${
                      theme === "dark" ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                    id="mfa-code-input"
                  />
                  {mfaError && <p className="text-[10px] text-red-400 mt-1 font-semibold">{mfaError}</p>}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-gray-400 block font-semibold">Write Down Backup Emergency Keys:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {mfaBackupCodes.map((code, i) => (
                      <span key={i} className={`text-[10px] font-mono text-center py-1.5 rounded border ${theme === "dark" ? "bg-[#131822] border-white/5 text-gray-300" : "bg-gray-100 border-gray-250 text-gray-600"}`}>{code}</span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                  id="confirm-mfa-verify-btn"
                >
                  Verify Code & Lock Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// -------------------------------------------------------------
// Markdown and text formatting utility functions (React 19 compliant)
// -------------------------------------------------------------
function formatMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  const lines = text.split("\n");
  return lines.map((line, index) => {
    let cleanLine = line.trim();
    
    // Header 3
    if (cleanLine.startsWith("###")) {
      return (
        <h3 key={index} className="text-sm font-bold text-emerald-400 mt-4 mb-2 first:mt-0 font-display">
          {cleanLine.replace("###", "").trim()}
        </h3>
      );
    }
    
    // Header 2
    if (cleanLine.startsWith("##")) {
      return (
        <h2 key={index} className="text-base font-bold text-white mt-4 mb-2 first:mt-0 font-display">
          {cleanLine.replace("##", "").trim()}
        </h2>
      );
    }

    // Bullet points
    if (cleanLine.startsWith("-") || cleanLine.startsWith("•") || cleanLine.startsWith("*")) {
      const bulletContent = cleanLine.substring(1).trim();
      return (
        <li key={index} className="text-xs text-gray-300 ml-4 list-disc mt-1 leading-relaxed">
          {renderBoldText(bulletContent)}
        </li>
      );
    }

    // Empty lines
    if (cleanLine === "") {
      return <div key={index} className="h-2"></div>;
    }

    // Normal paragraph
    return (
      <p key={index} className="text-xs text-gray-300 leading-relaxed mt-1">
        {renderBoldText(cleanLine)}
      </p>
    );
  });
}

function renderBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

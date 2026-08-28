export type Severity = "nominal" | "warn" | "critical";

export type SubsystemId =
  | "engine"
  | "oil"
  | "cooling"
  | "fuel"
  | "ignition"
  | "prop"
  | "sensor"
  | "datalink"
  | "electrical"
  | "structure"
  | "gear";

export type TerrainType =
  | "airstrip"
  | "farmland"
  | "road"
  | "desert"
  | "forest"
  | "urban"
  | "mountain";

export type EmergencyScenarioId =
  | "overheat"
  | "fuel_leak"
  | "stuck_throttle"
  | "power_loss"
  | "oil_loss"
  | "high_vibration"
  | "cooling_failure"
  | "sensor_drift"
  | "compound";

export type TerrainInfo = {
  id: TerrainType;
  label: string;
  score: number;
  risk: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  description: string;
};

export const TERRAIN_DATA: Record<TerrainType, TerrainInfo> = {
  airstrip: { id: "airstrip", label: "Paved Airstrip / Runway", score: 100, risk: "LOW", description: "Best available landing option. Hard surface, crash fire tender on standby." },
  farmland: { id: "farmland", label: "Open Agricultural Farmland", score: 85, risk: "LOW", description: "Suitable emergency landing terrain. Soft soil, minimal obstruction." },
  road: { id: "road", label: "National Highway / Service Road", score: 60, risk: "MODERATE", description: "Use only if better options unavailable. Traffic & power line hazard." },
  desert: { id: "desert", label: "Flat Desert Terrain", score: 55, risk: "MODERATE", description: "Emergency option. High sand ingestion & gear roll-over risk." },
  forest: { id: "forest", label: "Dense Forest / Canopy", score: 30, risk: "HIGH", description: "Avoid if possible. Tree canopy impact & airframe destruction risk." },
  urban: { id: "urban", label: "Urban Built-Up Zone", score: 20, risk: "EXTREME", description: "Hazardous. Collateral damage risk to civilian infrastructure." },
  mountain: { id: "mountain", label: "Mountainous / Canyon Terrain", score: 10, risk: "EXTREME", description: "Extremely high risk. Severe downdrafts & terrain collision hazard." },
};

export type Subsystem = {
  id: SubsystemId;
  label: string;
  short: string;
  pos: [number, number, number];
  fault: {
    severity: Severity;
    problem: string;
    diagnosis: string;
    cause: string;
    solution: string[];
    tars: string;
    rulMin: number;
  };
};

export type LogEntry = {
  time: string;
  msg: string;
  type?: "info" | "warn" | "critical" | "tars";
};

/** Official MALE UAV TEI-PD170 Aero Engine Safe Limits & Permutations */
export const ENGINE_OPERATING_LIMITS = {
  rpm: { nominal: [2200, 5000], warn: [5000, 5500], critical: 5800 },
  cht: { nominal: [160, 205], warn: [205, 225], critical: 230 }, // °C
  oilPressure: { nominal: [35, 55], warn: [20, 35], critical: 18 }, // PSI
  oilTemp: { nominal: [75, 105], warn: [105, 115], critical: 120 }, // °C
  fuelLevel: { nominal: [20, 100], warn: [10, 20], critical: 10 }, // %
  vibration: { nominal: [0.1, 0.6], warn: [0.6, 1.2], critical: 1.5 }, // g RMS
  altitude: { nominal: [0, 25000], warn: [25000, 30000], critical: 30000 }, // FT
};

export const SUBSYSTEMS: Subsystem[] = [
  {
    id: "engine",
    label: "Aero Piston Engine · 4-CYL Boxer",
    short: "ENGINE",
    pos: [0, 0.1, -1.45],
    fault: {
      severity: "critical",
      problem: "CHT Exceedance (>230 °C) — Cylinder 3 thermal runaway.",
      diagnosis: "Thermodynamic twin: High RPM + CHT exceedance + cooling deficit.",
      cause: "Baffle airflow restriction with lean mixture.",
      solution: [
        "Reduce RPM to 3400 — derate thermal flux",
        "Descend 2000 FT into cooler air mass",
        "Enrich fuel mixture 8 %",
        "Open cowl flap actuator full 100 %",
      ],
      tars: "TARS Recommendation: Precautionary landing on nearest Farmland/Airstrip.",
      rulMin: 16,
    },
  },
  {
    id: "oil",
    label: "Lubrication · Sump & Main Gallery",
    short: "OIL",
    pos: [0, -0.3, -1.2],
    fault: {
      severity: "critical",
      problem: "Oil Pressure Collapse (<18 PSI) — Bearing failure imminent.",
      diagnosis: "Oil pump seal leak; scavenge return down 34 %.",
      cause: "Sump seal breach.",
      solution: [
        "Engage SANJEEVANI preservation profile (RPM 2500)",
        "Prepare immediate glide landing on recommended terrain",
        "Do NOT increase throttle — bearing film compromised",
      ],
      tars: "TARS Recommendation: Immediate forced landing profile.",
      rulMin: 9,
    },
  },
  {
    id: "cooling",
    label: "Cooling · Cowl Flap & Baffles",
    short: "COOLING",
    pos: [0, 0.4, -0.9],
    fault: {
      severity: "warn",
      problem: "Cowl-flap actuator response lag — cooling deficit.",
      diagnosis: "Actuator linkage friction feedback delay.",
      cause: "Debris obstruction at cowl exit.",
      solution: [
        "Command cowl flap manual open",
        "Maintain CHT under 205 °C",
        "Increase airspeed 10 KT for ram cooling",
      ],
      tars: "TARS Recommendation: Monitor cooling margin.",
      rulMin: 140,
    },
  },
  {
    id: "fuel",
    label: "Fuel System · Wing Tanks & Feed",
    short: "FUEL",
    pos: [-2.2, 0.1, 0.4],
    fault: {
      severity: "warn",
      problem: "Fuel Leak Detected — continuous depletion rate 1.4 %/min.",
      diagnosis: "Boost pump delta-P anomaly; endurance reserve down 18 min.",
      cause: "Wing tank feed line restriction.",
      solution: [
        "Fly best-glide endurance speed",
        "Rebalance lateral fuel weight",
        "Proceed direct to recommended landing site",
      ],
      tars: "TARS Recommendation: Divert to nearest Airstrip/Farmland within 14 NM.",
      rulMin: 24,
    },
  },
  {
    id: "prop",
    label: "Pusher Propeller & Gearbox",
    short: "PROP",
    pos: [0, 0.1, -2.4],
    fault: {
      severity: "critical",
      problem: "Propeller Imbalance (>1.5 g RMS) — Structural resonance.",
      diagnosis: "High vibration + high RPM hub bearing wear signature.",
      cause: "Tip erosion / FOD mass asymmetry.",
      solution: [
        "Reduce RPM below 3200 to exit harmonic resonance",
        "Avoid sharp maneuvers & sudden throttle changes",
        "Declare precautionary RTB",
      ],
      tars: "TARS Recommendation: Derate RPM ceiling to 3200, landing advisory.",
      rulMin: 22,
    },
  },
  {
    id: "sensor",
    label: "SPASHT AI Sensor Integrity",
    short: "SENSOR",
    pos: [0, -0.48, 1.95],
    fault: {
      severity: "warn",
      problem: "Sensor Drift Anomaly — Artificial CHT spike detected.",
      diagnosis: "SPASHT AI residual analysis: Engine physics nominal, sensor channel #3 signal drift detected.",
      cause: "Thermocouple calibration drift.",
      solution: [
        "Switch to redundant secondary CHT sensor channel",
        "Verify engine thermal state against EGT and oil temp",
        "Continue mission — engine is physically healthy",
      ],
      tars: "TARS Status: SPASHT AI sensor drift confirmed. False alarm prevented.",
      rulMin: 420,
    },
  },
];

export const SUB_BY_ID = Object.fromEntries(SUBSYSTEMS.map((s) => [s.id, s])) as Record<
  SubsystemId,
  Subsystem
>;

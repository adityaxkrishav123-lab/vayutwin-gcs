import React from "react";
import { TERRAIN_DATA, type Subsystem, type Severity, type TerrainType } from "../../types/telemetry";
import { ShieldCheck, ChevronRight } from "lucide-react";

export type SanjeevaniAdvisoryProps = {
  selectedSubsystem: Subsystem | null;
  severity: Severity;
  engineThermal: boolean;
  tarsArmed: boolean;
  currentTerrain: TerrainType;
  windSpeed: number;
  windDirection: number;
  fuelLevel: number;
  activeScenario: string | null;
};

export function SanjeevaniAdvisoryCard({
  selectedSubsystem,
  severity,
  engineThermal,
  tarsArmed,
  currentTerrain,
  windSpeed,
  windDirection,
  fuelLevel,
  activeScenario,
}: SanjeevaniAdvisoryProps) {
  const terrainObj = TERRAIN_DATA[currentTerrain];

  // Contextual Dynamic Anomaly Generation
  let problem = "All 11 subsystems nominal. Thermodynamic twin in equilibrium.";
  let solutions = [
    "Maintain cruise RPM and mixture setting",
    "Continue 20 Hz telemetry sync to GCS",
    "Next scheduled borescope inspection at +42 engine hours",
  ];

  if (activeScenario === "overheat" || engineThermal) {
    problem = "Engine Overheating — CHT exceedance on CYL 3.";
    solutions = [
      `Reduce RPM to 3400 — derate heat flux immediately`,
      `Open cowl flap actuator 100 % for cooling mass-flow`,
      `Heading adjustment for headwind cooling (${windSpeed} KT @ ${windDirection}°)`,
      `Prepare precautionary landing on ${terrainObj.label}`,
    ];
  } else if (activeScenario === "fuel_leak") {
    problem = `Fuel Leak Detected — Fuel level at ${fuelLevel.toFixed(0)} %, continuous depletion.`;
    solutions = [
      `Fly best-glide speed (68 KT) to maximize endurance`,
      `Cross-feed tanks and rebalance lateral fuel weight`,
      `Immediate divert to ${terrainObj.label} (Score: ${terrainObj.score})`,
    ];
  } else if (activeScenario === "sensor_drift") {
    problem = "Sensor Drift Anomaly — SPASHT AI detects thermocouple jump.";
    solutions = [
      "SPASHT AI residual check: Engine physics 100 % healthy!",
      "Switch operator display to redundant CHT Sensor #2 channel",
      "No engine shutdown or landing required — false alarm prevented",
    ];
  } else if (activeScenario === "compound") {
    problem = `COMPOUND EMERGENCY: Fuel Leak + Crosswind (${windSpeed} KT) + ${terrainObj.label} Ahead!`;
    solutions = [
      "CRITICAL: Set glide speed 65 KT immediately",
      `Align approach heading into wind (${windDirection}°)`,
      `Execute emergency forced landing on ${terrainObj.label} (Score: ${terrainObj.score})`,
    ];
  } else if (selectedSubsystem) {
    problem = selectedSubsystem.fault.problem;
    solutions = selectedSubsystem.fault.solution;
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 backdrop-blur-md font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
            SANJEEVANI AI RECOVERY ADVISORY
          </span>
        </div>
        <span
          className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            severity === "critical" || activeScenario === "compound"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : severity === "warn"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
          }`}
        >
          {severity === "nominal" && !activeScenario ? "SYSTEM OK" : `ACTION REQUIRED (${severity.toUpperCase()})`}
        </span>
      </div>

      {/* Primary Anomaly & Environmental Context */}
      <div className="mt-2.5 rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
        <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
          Contextual Mission Anomaly
        </div>
        <p className="font-mono text-xs text-slate-200">{problem}</p>
        <div className="text-[10px] text-cyan-400 pt-1 flex justify-between">
          <span>Terrain: {terrainObj.label.split(" ")[0]}</span>
          <span>Wind: {windSpeed} KT @ {windDirection}°</span>
        </div>
      </div>

      {/* Operator Step-by-Step Recovery Actions */}
      <div className="mt-2.5 flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
        <div className="text-[10px] font-bold uppercase text-cyan-400 mb-1">
          Recommended Sequence
        </div>
        {solutions.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 rounded bg-slate-900/50 p-2 border border-slate-800/80 text-slate-300 transition-colors hover:border-slate-700"
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-cyan-400 mt-0.5" />
            <span className="leading-relaxed">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

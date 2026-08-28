import React from "react";
import { TERRAIN_DATA, type TerrainType, type EmergencyScenarioId } from "../../types/telemetry";
import {
  Play,
  RotateCcw,
  Gauge,
  Sliders,
  Zap,
  Globe,
  Wind,
  AlertOctagon,
  X,
} from "lucide-react";

export type EcuSimulatorDockProps = {
  missionActive: boolean;
  onToggleMission: () => void;
  onResetRefill: () => void;

  engineOn: boolean;
  onToggleEngine: () => void;

  targetRPM: number;
  onRPMChange: (val: number) => void;

  airspeed: number;
  onAirspeedChange: (val: number) => void;

  cylTemps: [number, number, number, number];
  onCylTempChange: (cylIdx: number, val: number) => void;

  oilPressure: number;
  onOilPressureChange: (val: number) => void;

  fuelLevel: number;
  onFuelChange: (val: number) => void;

  vibration: number;
  onVibrationChange: (val: number) => void;

  altitude: number;
  onAltitudeChange: (val: number) => void;

  windSpeed: number;
  onWindSpeedChange: (val: number) => void;

  windDirection: number;
  onWindDirChange: (val: number) => void;

  terrain: TerrainType;
  onTerrainChange: (val: TerrainType) => void;

  activeScenario: EmergencyScenarioId | null;
  onSelectScenario: (scenId: EmergencyScenarioId) => void;

  onClose?: () => void;
};

export function EcuSimulatorDock({
  missionActive,
  onToggleMission,
  onResetRefill,
  engineOn,
  onToggleEngine,
  targetRPM,
  onRPMChange,
  airspeed,
  onAirspeedChange,
  cylTemps,
  onCylTempChange,
  oilPressure,
  onOilPressureChange,
  fuelLevel,
  onFuelChange,
  vibration,
  onVibrationChange,
  altitude,
  onAltitudeChange,
  windSpeed,
  onWindSpeedChange,
  windDirection,
  onWindDirChange,
  terrain,
  onTerrainChange,
  activeScenario,
  onSelectScenario,
  onClose,
}: EcuSimulatorDockProps) {
  return (
    <div className="flex h-full w-full flex-col border-l border-slate-800 bg-slate-950/95 p-4 text-slate-200 backdrop-blur-xl font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <span className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-400">
            Mission Scenario Simulator
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto space-y-4 pr-1">
        {/* SECTION 1: MISSION CONTROLS */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            1. Master Mission Controls
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleMission}
              className={`flex items-center justify-center gap-2 rounded px-3 py-2 font-bold uppercase transition-all ${
                missionActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                  : "bg-cyan-600 text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              {missionActive ? "Mission Active" : "Start Mission"}
            </button>
            <button
              onClick={onResetRefill}
              className="flex items-center justify-center gap-2 rounded border border-cyan-500/40 bg-cyan-950/40 px-3 py-2 font-bold uppercase text-cyan-300 hover:bg-cyan-900/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset & Refill
            </button>
          </div>
        </div>

        {/* SECTION 2: FLIGHT CONTROLS */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-cyan-400" /> 2. Flight & Engine Controls
            </span>
            <button
              onClick={onToggleEngine}
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                engineOn ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
              }`}
            >
              FADEC: {engineOn ? "ONLINE" : "CUTOFF"}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Target RPM:</span>
              <span className="font-bold text-cyan-400">{targetRPM} RPM</span>
            </div>
            <input
              type="range"
              min={2000}
              max={6200}
              step={50}
              value={targetRPM}
              onChange={(e) => onRPMChange(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-800 accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Airspeed:</span>
              <span className="font-bold text-sky-400">{airspeed} KT</span>
            </div>
            <input
              type="range"
              min={40}
              max={160}
              value={airspeed}
              onChange={(e) => onAirspeedChange(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-800 accent-sky-400"
            />
          </div>
        </div>

        {/* SECTION 3: ENVIRONMENT & SURROUNDINGS */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-3">
          <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-emerald-400" /> 3. Environment & Terrain
          </div>

          {/* Terrain Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Active Terrain Type:</label>
            <select
              value={terrain}
              onChange={(e) => onTerrainChange(e.target.value as TerrainType)}
              className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-cyan-300 font-mono"
            >
              {Object.values(TERRAIN_DATA).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} (Score: {t.score})
                </option>
              ))}
            </select>
          </div>

          {/* Wind Speed & Direction */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                <span>Wind Speed:</span>
                <span className="font-bold text-amber-400">{windSpeed} KT</span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                value={windSpeed}
                onChange={(e) => onWindSpeedChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-800 accent-amber-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                <span>Wind Dir:</span>
                <span className="font-bold text-amber-400">{windDirection}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={10}
                value={windDirection}
                onChange={(e) => onWindDirChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-800 accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: 8 PRESET EMERGENCY SCENARIOS */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-rose-400">
            <Zap className="h-4 w-4" /> 4. Preset Emergency Scenarios
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "overheat", label: "1. Engine Overheat" },
              { id: "fuel_leak", label: "2. Fuel Leak" },
              { id: "stuck_throttle", label: "3. Stuck Throttle" },
              { id: "power_loss", label: "4. Power Loss" },
              { id: "oil_loss", label: "5. Oil Loss" },
              { id: "high_vibration", label: "6. High Vibration" },
              { id: "cooling_failure", label: "7. Cooling Failure" },
              { id: "sensor_drift", label: "8. Sensor Drift AI" },
            ].map((scen) => {
              const active = activeScenario === scen.id;
              return (
                <button
                  key={scen.id}
                  onClick={() => onSelectScenario(scen.id as EmergencyScenarioId)}
                  className={`rounded border px-2 py-1.5 text-left text-[10px] font-bold uppercase transition-all ${
                    active
                      ? "border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse"
                      : "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {scen.label} {active ? "⚡" : ""}
                </button>
              );
            })}
          </div>

          {/* COMPOUND EMERGENCY MODE BUTTON */}
          <button
            onClick={() => onSelectScenario("compound")}
            className={`w-full flex items-center justify-center gap-2 rounded border px-3 py-2 text-xs font-bold uppercase transition-all shadow-lg ${
              activeScenario === "compound"
                ? "border-rose-500 bg-rose-600 text-white animate-pulse"
                : "border-rose-500/50 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60"
            }`}
          >
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            💥 COMPOUND EMERGENCY MODE
          </button>
        </div>
      </div>
    </div>
  );
}

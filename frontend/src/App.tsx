import React, { useEffect, useMemo, useRef, useState } from "react";
import { UavViewport3D } from "./components/3d/UavViewport3D";
import { ComponentDiagnosticDrawer } from "./components/gcs/ComponentDiagnosticDrawer";
import { SanjeevaniAdvisoryCard } from "./components/gcs/SanjeevaniAdvisoryCard";
import { SpashtLandingDecisionCard } from "./components/gcs/SpashtLandingDecisionCard";
import { MissionLogsCard } from "./components/gcs/MissionLogsCard";
import { TelemetryCharts } from "./components/gcs/TelemetryCharts";
import { CapacityCards } from "./components/gcs/CapacityCards";
import { EcuSimulatorDock } from "./components/simulator/EcuSimulatorDock";
import {
  SUBSYSTEMS,
  SUB_BY_ID,
  ENGINE_OPERATING_LIMITS,
  type Severity,
  type SubsystemId,
  type LogEntry,
  type TerrainType,
  type EmergencyScenarioId,
} from "./types/telemetry";
import { Shield, Sliders } from "lucide-react";

const stamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
const SEV_RANK: Record<Severity, number> = { nominal: 0, warn: 1, critical: 2 };

export default function App() {
  // Mission & Engine Telemetry State
  const [missionActive, setMissionActive] = useState(true);
  const [engineOn, setEngineOn] = useState(true);
  const [targetRPM, setTargetRPM] = useState(4800);
  const [liveRPM, setLiveRPM] = useState(4800);
  const [airspeed, setAirspeed] = useState(95); // KT
  
  // Per-Cylinder Temperatures (CYL 1, 2, 3, 4 °C)
  const [cylTemps, setCylTemps] = useState<[number, number, number, number]>([178, 180, 184, 176]);
  
  // Fluid & Environmental States
  const [oilPressure, setOilPressure] = useState(42.5); // PSI
  const [fuelLevel, setFuelLevel] = useState(85); // %
  const [altitude, setAltitude] = useState(18000); // FT
  const [vibration, setVibration] = useState(1.4); // g RMS
  
  // Environment & Terrain Parameters
  const [windSpeed, setWindSpeed] = useState(18); // KT
  const [windDirection, setWindDirection] = useState(240); // Deg
  const [terrain, setTerrain] = useState<TerrainType>("farmland");

  // Preset Emergency Scenario Control
  const [activeScenario, setActiveScenario] = useState<EmergencyScenarioId | null>(null);
  
  // GCS TARS Suite State (Software Safety Feature)
  const [tarsArmed, setTarsArmed] = useState(true);
  const [tarsAutoDisarmed, setTarsAutoDisarmed] = useState(false);
  const [faults, setFaults] = useState<SubsystemId[]>([]);
  const [focus, setFocus] = useState<SubsystemId | null>(null);
  const [viewMode, setViewMode] = useState<"airframe" | "engine">("airframe");
  const [showSimulator, setShowSimulator] = useState(false);

  // Mission Logs Stream (Single log stream for all events, SPASHT AI & TARS actions)
  const [missionLogs, setMissionLogs] = useState<LogEntry[]>([]);

  const pushLog = (msg: string, type: "info" | "warn" | "critical" | "tars" = "info") =>
    setMissionLogs((p) => [{ time: stamp(), msg, type }, ...p].slice(0, 100));

  useEffect(() => {
    setMissionLogs([
      { time: stamp(), msg: "VayuTwin GCS Online. SPASHT AI & TARS Automated Safety Suite active.", type: "info" },
      { time: stamp(), msg: "Standard Telemetry Contract initialized. Stream locked at 20 Hz (200ms).", type: "info" },
      { time: stamp(), msg: "TARS Automated Safety Suite ARMED across all telemetry feeds.", type: "tars" },
    ]);
  }, []);

  // Scenario Handling & TARS Behavior
  const handleSelectScenario = (scenId: EmergencyScenarioId) => {
    if (activeScenario === scenId) {
      setActiveScenario(null);
      setTarsAutoDisarmed(false);
      pushLog(`[SIMULATOR] Emergency scenario cleared. Nominal telemetry profile restored.`, "info");
      return;
    }

    setActiveScenario(scenId);

    if (scenId === "overheat") {
      setCylTemps([210, 215, 242, 208]);
      pushLog(`[SCENARIO 1] Engine Overheat! CHT 3 climbing past 242 °C.`, "critical");
    } else if (scenId === "fuel_leak") {
      setFuelLevel(48);
      pushLog(`[SCENARIO 2] Fuel Leak! Wing tank depletion rate 1.4 %/min.`, "critical");
    } else if (scenId === "stuck_throttle") {
      setTargetRPM(5800);
      setLiveRPM(5800);
      pushLog(`[SCENARIO 3] Stuck Throttle! Engine locked at max 5800 RPM.`, "critical");
    } else if (scenId === "power_loss") {
      setTargetRPM(2200);
      setAirspeed(52);
      pushLog(`[SCENARIO 4] Power Loss! RPM dropped to 2200, stall risk.`, "critical");
    } else if (scenId === "oil_loss") {
      setOilPressure(11.2);
      pushLog(`[SCENARIO 5] Oil Pressure Loss! Pressure collapsed to 11.2 PSI.`, "critical");
    } else if (scenId === "high_vibration") {
      setVibration(6.4);
      pushLog(`[SCENARIO 6] High Vibration! Hub 1P vibration at 6.4 g RMS.`, "critical");
    } else if (scenId === "cooling_failure") {
      setFaults(["cooling"]);
      pushLog(`[SCENARIO 7] Cooling Failure! Cowl flap stuck.`, "critical");
    } else if (scenId === "sensor_drift") {
      setFocus("sensor");
      setTarsAutoDisarmed(true);
      pushLog(`[SPASHT AI] Sensor Drift Anomaly detected! Sensor reading unreliable.`, "warn");
      pushLog(`[TARS AUTO-DISARM] Unreliable reading detected — TARS disarmed, manual control required!`, "tars");
    } else if (scenId === "compound") {
      setFuelLevel(28);
      setWindSpeed(38);
      setTerrain("mountain");
      setAltitude(26000);
      setCylTemps([215, 218, 245, 210]);
      pushLog(`[COMPOUND EMERGENCY] Fuel Leak + 38 KT Wind + Mountain Terrain + High Altitude!`, "critical");
    }
  };

  const maxCht = Math.max(...cylTemps);

  const CHT_LIMIT = ENGINE_OPERATING_LIMITS.cht;
  const CHT_SEVERITY: Severity =
    maxCht >= CHT_LIMIT.critical
      ? "critical"
      : maxCht >= CHT_LIMIT.warn[0]
      ? "warn"
      : "nominal";

  const OIL_LIMIT = ENGINE_OPERATING_LIMITS.oilPressure;
  const OIL_SEVERITY: Severity =
    oilPressure <= OIL_LIMIT.critical
      ? "critical"
      : oilPressure <= OIL_LIMIT.warn[1]
      ? "warn"
      : "nominal";

  const VIB_LIMIT = ENGINE_OPERATING_LIMITS.vibration;
  const VIB_SEVERITY: Severity =
    vibration >= VIB_LIMIT.critical
      ? "critical"
      : vibration >= VIB_LIMIT.warn[0]
      ? "warn"
      : "nominal";

  const states = useMemo(() => {
    const m = {} as Record<SubsystemId, Severity>;
    for (const s of SUBSYSTEMS) m[s.id] = "nominal";
    for (const id of faults) m[id] = SUB_BY_ID[id]?.fault.severity ?? "nominal";

    if (SEV_RANK[CHT_SEVERITY] > SEV_RANK[m.engine]) m.engine = CHT_SEVERITY;
    if (SEV_RANK[OIL_SEVERITY] > SEV_RANK[m.oil]) m.oil = OIL_SEVERITY;
    if (SEV_RANK[VIB_SEVERITY] > SEV_RANK[m.prop]) m.prop = VIB_SEVERITY;

    if (fuelLevel < 10 && m.fuel === "nominal") m.fuel = "critical";
    else if (fuelLevel < 20 && m.fuel === "nominal") m.fuel = "warn";

    if (activeScenario === "sensor_drift") m.sensor = "warn";

    return m;
  }, [faults, CHT_SEVERITY, OIL_SEVERITY, VIB_SEVERITY, fuelLevel, activeScenario]);

  const activeIds = SUBSYSTEMS.filter((s) => states[s.id] !== "nominal").map((s) => s.id);
  const severity: Severity = activeIds.reduce<Severity>(
    (acc, id) => (SEV_RANK[states[id]] > SEV_RANK[acc] ? states[id] : acc),
    "nominal"
  );

  const selectedSubsystem = focus ? SUB_BY_ID[focus] : null;
  const engineThermal = CHT_SEVERITY !== "nominal" || activeScenario === "overheat" || activeScenario === "compound";

  // Real-Time Simulation Loop
  useEffect(() => {
    if (!missionActive || !engineOn) return;

    const interval = setInterval(() => {
      setLiveRPM((prev) => {
        const diff = targetRPM - prev;
        return Math.abs(diff) < 10 ? targetRPM : prev + Math.sign(diff) * 15;
      });

      const leakRate = activeScenario === "fuel_leak" || activeScenario === "compound" ? 0.08 : 0.008;
      setFuelLevel((prev) => Math.max(0, prev - (liveRPM / 5000) * leakRate));

      if (activeScenario === "overheat") {
        setCylTemps((prev) => [prev[0], prev[1], Math.min(265, prev[2] + 0.8), prev[3]]);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [missionActive, engineOn, targetRPM, liveRPM, activeScenario]);

  // Alert Transitions & TARS Safety Suite Logs
  const prevStates = useRef<Record<SubsystemId, Severity> | null>(null);
  useEffect(() => {
    const prev = prevStates.current;
    prevStates.current = states;
    if (!prev) return;

    for (const s of SUBSYSTEMS) {
      const before = prev[s.id];
      const now = states[s.id];
      if (before === now) continue;

      if (now === "nominal") {
        pushLog(`${s.short} restored inside nominal envelope.`, "info");
        continue;
      }

      setFocus(s.id);
      const isCrit = now === "critical";
      pushLog(
        `${isCrit ? "CRITICAL ALERT" : "WARNING"} · ${s.short}: ${s.fault.problem}`,
        isCrit ? "critical" : "warn"
      );

      // TARS Suite Rules (Software Safety & Log Suite)
      if (s.id === "sensor" || activeScenario === "sensor_drift") {
        setTarsAutoDisarmed(true);
        pushLog(`[TARS AUTO-DISARM] Unreliable reading detected — TARS disarmed, manual control required!`, "tars");
      } else if (tarsArmed && !tarsAutoDisarmed) {
        pushLog(`[TARS RECOVERY ADVISORY] Temporary recovery profile formulated to save RUL: ${s.fault.tars}`, "tars");
      } else {
        pushLog(`[TARS DISARMED] TARS is disarmed — manual operator intervention active.`, "tars");
      }
    }
  }, [states, tarsArmed, tarsAutoDisarmed, activeScenario]);

  // Live Telemetry Waveforms
  const [chartData, setChartData] = useState<{ t: string; rpm: number; cht: number; oil: number; vib: number }[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      t: `-${20 - i}s`,
      rpm: 4800,
      cht: 184,
      oil: 42.5,
      vib: 1.4,
    }))
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setChartData((prev) =>
        [
          ...prev,
          {
            t: stamp().slice(3),
            rpm: liveRPM + Math.round(Math.random() * 20 - 10),
            cht: maxCht + Math.round(Math.random() * 2 - 1),
            oil: Number((oilPressure + Math.random() * 0.4 - 0.2).toFixed(1)),
            vib: Number((vibration + Math.random() * 0.2 - 0.1).toFixed(2)),
          },
        ].slice(-30)
      );
    }, 1000);
    return () => clearInterval(tick);
  }, [liveRPM, maxCht, oilPressure, vibration]);

  const handleResetRefill = () => {
    setFaults([]);
    setActiveScenario(null);
    setTarsAutoDisarmed(false);
    setCylTemps([178, 180, 184, 176]);
    setOilPressure(42.5);
    setFuelLevel(100);
    setVibration(1.4);
    setAltitude(18000);
    setAirspeed(95);
    setTargetRPM(4800);
    setLiveRPM(4800);
    setFocus(null);
    setEngineOn(true);
    setMissionActive(true);
    pushLog("MISSION RESET & REFILL: Scenarios cleared, fuel and lubricants restored.", "info");
  };

  const healthIndex = Math.max(
    5,
    Math.round(
      100 -
        Math.max(0, maxCht - 200) * 0.8 -
        Math.max(0, 35 - oilPressure) * 1.5 -
        Math.max(0, vibration - 0.6) * 15 -
        activeIds.length * 6
    )
  );

  const rul = selectedSubsystem ? selectedSubsystem.fault.rulMin : 580;

  return (
    <main className="flex h-screen flex-col bg-[#070c14] font-mono text-slate-100 overflow-hidden">
      {/* TOP COMMAND HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="font-sans text-base font-bold tracking-widest text-white">
              VAYUTWIN <span className="text-cyan-400 font-mono text-xs">GCS SIH DEMO</span>
            </h1>
          </div>
          <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            VT-ALPHA · UAV-2026-001
          </span>
        </div>

        {/* Header Telemetry Stats */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-slate-400">CYL 3 CHT</span>
            <span className={`font-bold ${maxCht >= 225 ? "text-rose-400 animate-pulse" : maxCht >= 205 ? "text-amber-400" : "text-emerald-400"}`}>
              {cylTemps[2]} °C
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-slate-400">Health Index</span>
            <span className={`font-bold ${healthIndex > 75 ? "text-emerald-400" : healthIndex > 50 ? "text-amber-400" : "text-rose-400"}`}>
              {healthIndex} %
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-slate-400">Fuel Level</span>
            <span className={`font-bold ${fuelLevel < 15 ? "text-rose-400" : "text-cyan-400"}`}>
              {fuelLevel.toFixed(0)} % ({Math.round(fuelLevel * 0.9)} L)
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-slate-400">Est. RUL</span>
            <span className="font-bold text-cyan-300">{rul} min</span>
          </div>

          {/* TARS Status Button */}
          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={() => {
                setTarsArmed((p) => !p);
                setTarsAutoDisarmed(false);
              }}
              className={`rounded border px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                tarsAutoDisarmed
                  ? "border-amber-500/60 bg-amber-500/20 text-amber-300 animate-pulse"
                  : tarsArmed
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : "border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
              }`}
            >
              TARS: {tarsAutoDisarmed ? "AUTO-DISARMED ⚠" : tarsArmed ? "ARMED" : "DISARMED"}
            </button>

            <button
              onClick={() => setShowSimulator((p) => !p)}
              className={`flex items-center gap-1.5 rounded border px-3 py-1 text-[11px] font-bold uppercase transition-all shadow-lg ${
                showSimulator
                  ? "border-cyan-400 bg-cyan-400 text-slate-950"
                  : "border-cyan-500/40 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" /> SIMULATOR DOCK
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="relative flex flex-1 overflow-hidden p-3 gap-3">
        {/* LEFT COLUMN: 45% HERO 3D DIGITAL TWIN + TELEMETRY CHART */}
        <section className="flex w-[45%] flex-col gap-3 h-full">
          <div className="relative flex-1 min-h-[360px] rounded-lg border border-slate-800 bg-slate-950">
            <UavViewport3D
              states={states}
              cylTemps={cylTemps}
              rpm={liveRPM}
              vibration={vibration}
              activeScenario={activeScenario}
              focus={focus}
              viewMode={viewMode}
              onSelectComponent={setFocus}
              onToggleViewMode={() => setViewMode((p) => (p === "airframe" ? "engine" : "airframe"))}
              onClearFocus={() => setFocus(null)}
            />

            {selectedSubsystem && (
              <ComponentDiagnosticDrawer
                subsystem={selectedSubsystem}
                severity={states[selectedSubsystem.id]}
                cylTemps={cylTemps}
                oilPressure={oilPressure}
                fuelLevel={fuelLevel}
                vibration={vibration}
                onClose={() => setFocus(null)}
              />
            )}
          </div>

          <div className="h-44 shrink-0">
            <TelemetryCharts data={chartData} liveRPM={liveRPM} chtCyl3={cylTemps[2]} />
          </div>
        </section>

        {/* RIGHT COLUMN: 55% MULTI-PANEL GRID */}
        <section className="flex flex-1 flex-col gap-3 h-full overflow-hidden">
          <div className="grid grid-cols-3 gap-3 h-[58%]">
            <SanjeevaniAdvisoryCard
              selectedSubsystem={selectedSubsystem}
              severity={severity}
              engineThermal={engineThermal}
              tarsArmed={tarsArmed && !tarsAutoDisarmed}
              currentTerrain={terrain}
              windSpeed={windSpeed}
              windDirection={windDirection}
              fuelLevel={fuelLevel}
              activeScenario={activeScenario}
            />

            <SpashtLandingDecisionCard
              currentTerrain={terrain}
              altitude={altitude}
              fuelLevel={fuelLevel}
              windSpeed={windSpeed}
              windDirection={windDirection}
            />

            <MissionLogsCard logs={missionLogs} onClear={() => setMissionLogs([])} />
          </div>

          <div className="flex-1 min-h-0">
            <CapacityCards
              fuelLevel={fuelLevel}
              liveRPM={liveRPM}
              oilPressure={oilPressure}
              altitude={altitude}
            />
          </div>
        </section>

        {/* DEDICATED MISSION SCENARIO SIMULATOR DOCK */}
        {showSimulator && (
          <div className="absolute right-3 top-3 bottom-3 z-50 w-96 shadow-2xl animate-in slide-in-from-right-6">
            <EcuSimulatorDock
              missionActive={missionActive}
              onToggleMission={() => setMissionActive((p) => !p)}
              onResetRefill={handleResetRefill}
              engineOn={engineOn}
              onToggleEngine={() => setEngineOn((p) => !p)}
              targetRPM={targetRPM}
              onRPMChange={setTargetRPM}
              airspeed={airspeed}
              onAirspeedChange={setAirspeed}
              cylTemps={cylTemps}
              onCylTempChange={(idx, val) => {
                setCylTemps((prev) => {
                  const next = [...prev] as [number, number, number, number];
                  next[idx] = val;
                  return next;
                });
              }}
              oilPressure={oilPressure}
              onOilPressureChange={setOilPressure}
              fuelLevel={fuelLevel}
              onFuelChange={setFuelLevel}
              vibration={vibration}
              onVibrationChange={setVibration}
              altitude={altitude}
              onAltitudeChange={setAltitude}
              windSpeed={windSpeed}
              onWindSpeedChange={setWindSpeed}
              windDirection={windDirection}
              onWindDirChange={setWindDirection}
              terrain={terrain}
              onTerrainChange={setTerrain}
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
              onClose={() => setShowSimulator(false)}
            />
          </div>
        )}
      </div>
    </main>
  );
}

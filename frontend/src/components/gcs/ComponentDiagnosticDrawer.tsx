import React from "react";
import { type Subsystem, type Severity } from "../../types/telemetry";
import { AlertTriangle, CheckCircle2, ShieldAlert, X, Cpu, Gauge } from "lucide-react";

export type DiagnosticDrawerProps = {
  subsystem: Subsystem;
  severity: Severity;
  cylTemps: [number, number, number, number];
  oilPressure: number;
  fuelLevel: number;
  vibration: number;
  onClose: () => void;
};

const SEV_TEXT: Record<Severity, string> = {
  nominal: "text-emerald-400",
  warn: "text-amber-400",
  critical: "text-rose-500",
};

const SEV_BG: Record<Severity, string> = {
  nominal: "bg-emerald-500/10 border-emerald-500/30",
  warn: "bg-amber-500/10 border-amber-500/40",
  critical: "bg-rose-500/15 border-rose-500/50",
};

export function ComponentDiagnosticDrawer({
  subsystem,
  severity,
  cylTemps,
  oilPressure,
  fuelLevel,
  vibration,
  onClose,
}: DiagnosticDrawerProps) {
  const isEngine = subsystem.id === "engine";
  const isOil = subsystem.id === "oil";
  const isFuel = subsystem.id === "fuel";
  const isProp = subsystem.id === "prop";

  return (
    <div className="absolute right-4 top-4 z-40 w-80 rounded-lg border border-slate-800 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            {subsystem.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Severity Badge */}
      <div className={`mt-3 flex items-center justify-between rounded border px-3 py-1.5 ${SEV_BG[severity]}`}>
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-300">
          Component Health
        </span>
        <span className={`font-mono text-xs font-bold uppercase ${SEV_TEXT[severity]}`}>
          {severity}
        </span>
      </div>

      {/* Per-Cylinder / Component Telemetry Breakdown */}
      <div className="mt-3 space-y-2.5 font-mono text-xs">
        {isEngine && (
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase text-slate-400 flex items-center justify-between">
              <span>Cylinder Head Temps (CHT)</span>
              <span className="text-cyan-400">4-CYL BOXER</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {cylTemps.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between rounded bg-slate-900/80 px-2 py-1 border ${
                    t >= 230
                      ? "border-rose-500/60 text-rose-400 animate-pulse"
                      : t >= 205
                      ? "border-amber-500/50 text-amber-300"
                      : "border-slate-800 text-emerald-400"
                  }`}
                >
                  <span>CYL {idx + 1}:</span>
                  <span className="font-bold">{t} °C</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOil && (
          <div className="flex justify-between rounded bg-slate-900/80 px-3 py-2 border border-slate-800">
            <span className="text-slate-400">Oil Line Pressure:</span>
            <span className={`font-bold ${oilPressure < 20 ? "text-rose-400" : "text-blue-400"}`}>
              {oilPressure.toFixed(1)} PSI
            </span>
          </div>
        )}

        {isFuel && (
          <div className="flex justify-between rounded bg-slate-900/80 px-3 py-2 border border-slate-800">
            <span className="text-slate-400">Wing Tank Level:</span>
            <span className={`font-bold ${fuelLevel < 20 ? "text-rose-400" : "text-emerald-400"}`}>
              {fuelLevel.toFixed(1)} % ({Math.round(fuelLevel * 0.9)} L)
            </span>
          </div>
        )}

        {isProp && (
          <div className="flex justify-between rounded bg-slate-900/80 px-3 py-2 border border-slate-800">
            <span className="text-slate-400">1P Hub Vibration:</span>
            <span className={`font-bold ${vibration > 4 ? "text-rose-400" : "text-emerald-400"}`}>
              {vibration.toFixed(1)} g RMS
            </span>
          </div>
        )}

        {/* Diagnosis & Prognosis */}
        <div className="rounded bg-slate-900/70 p-2.5 text-[11px] leading-relaxed text-slate-300 border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-cyan-400">Component Prognosis</div>
          <p className="mt-1">{subsystem.fault.diagnosis}</p>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>Est. Component RUL:</span>
          <span className="font-bold text-cyan-300">{subsystem.fault.rulMin} min</span>
        </div>
      </div>
    </div>
  );
}

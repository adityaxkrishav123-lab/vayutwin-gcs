import React from "react";
import { Fuel, Wrench, Flame, Radio } from "lucide-react";

export type CapacityCardsProps = {
  fuelLevel: number;
  liveRPM: number;
  oilPressure: number;
  altitude: number;
};

export function CapacityCards({ fuelLevel, liveRPM, oilPressure, altitude }: CapacityCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 h-full font-mono text-xs">
      {/* Fuel System Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5 text-cyan-400" /> Fuel System</span>
          <span className={`font-bold ${fuelLevel < 20 ? "text-rose-400" : "text-emerald-400"}`}>{fuelLevel.toFixed(0)}%</span>
        </div>
        <div className="my-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all ${fuelLevel < 20 ? "bg-rose-500" : "bg-cyan-400"}`}
            style={{ width: `${fuelLevel}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-400 flex justify-between">
          <span>Burn Rate:</span>
          <span className="text-slate-200">{((liveRPM / 5000) * 12).toFixed(1)} L/hr</span>
        </div>
      </div>

      {/* Lubrication Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Wrench className="h-3.5 w-3.5 text-blue-400" /> Lubrication</span>
          <span className={`font-bold ${oilPressure < 20 ? "text-rose-400" : "text-blue-400"}`}>{oilPressure.toFixed(1)} PSI</span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold">
          Scavenge: {oilPressure > 20 ? "NOMINAL" : "PRESSURE LEAK"}
        </div>
        <div className="text-[10px] text-slate-400 flex justify-between">
          <span>Sump Temp:</span>
          <span className="text-slate-200">84 °C</span>
        </div>
      </div>

      {/* Engine Power Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-amber-400" /> Power Output</span>
          <span className="font-bold text-amber-400">{Math.round(145 * (liveRPM / 5000))} HP</span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold">
          Altitude: {altitude} FT
        </div>
        <div className="text-[10px] text-slate-400 flex justify-between">
          <span>Air Density:</span>
          <span className="text-slate-200">{(1 - altitude / 45000).toFixed(2)} ρ</span>
        </div>
      </div>

      {/* SATCOM Datalink Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Radio className="h-3.5 w-3.5 text-emerald-400" /> SATCOM Link</span>
          <span className="font-bold text-emerald-400">9.4 dB</span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold">
          Sync Frequency: 20 Hz
        </div>
        <div className="text-[10px] text-slate-400 flex justify-between">
          <span>Packet Loss:</span>
          <span className="text-emerald-400">0.02 %</span>
        </div>
      </div>
    </div>
  );
}

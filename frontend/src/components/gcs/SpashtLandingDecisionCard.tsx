import React from "react";
import { TERRAIN_DATA, type TerrainType } from "../../types/telemetry";
import { Cpu, Navigation } from "lucide-react";

export type SpashtLandingDecisionProps = {
  currentTerrain: TerrainType;
  altitude: number;
  fuelLevel: number;
  windSpeed: number;
  windDirection: number;
};

export function SpashtLandingDecisionCard({
  currentTerrain,
  altitude,
  fuelLevel,
  windSpeed,
  windDirection,
}: SpashtLandingDecisionProps) {
  const glideDistanceNM = Math.round((altitude / 6076) * 12);
  const rankedTerrains = Object.values(TERRAIN_DATA).sort((a, b) => b.score - a.score);
  const activeTerrainObj = TERRAIN_DATA[currentTerrain];

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 backdrop-blur-md font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            SPASHT AI SAFE LANDING ASSESSMENT
          </span>
        </div>
        <span className="rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold">
          PREDICTIVE ANALYSIS
        </span>
      </div>

      {/* Flight Vector Summary */}
      <div className="mt-2.5 grid grid-cols-3 gap-2 rounded bg-slate-900/70 p-2 border border-slate-800 text-[10px]">
        <div>
          <span className="text-slate-400 block">Glide Range:</span>
          <span className="font-bold text-sky-400">{glideDistanceNM} NM ({altitude} FT)</span>
        </div>
        <div>
          <span className="text-slate-400 block">Wind Vector:</span>
          <span className="font-bold text-amber-400">{windSpeed} KT @ {windDirection}°</span>
        </div>
        <div>
          <span className="text-slate-400 block">Active Terrain:</span>
          <span className="font-bold text-emerald-400">{activeTerrainObj.label.split(" ")[0]}</span>
        </div>
      </div>

      {/* SPASHT AI Ranked Landing Sites */}
      <div className="mt-2.5 space-y-1.5 overflow-y-auto flex-1 pr-1">
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex justify-between">
          <span>SPASHT Evaluated Sites</span>
          <span>Suitability Score</span>
        </div>

        {rankedTerrains.slice(0, 4).map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between rounded p-2 border transition-all ${
              t.id === currentTerrain
                ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
                : "border-slate-800/80 bg-slate-900/50 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Navigation className={`h-3.5 w-3.5 ${t.score >= 80 ? "text-emerald-400" : t.score >= 50 ? "text-amber-400" : "text-rose-400"}`} />
              <div>
                <div className="font-bold text-[11px]">{t.label}</div>
                <div className="text-[9px] text-slate-400">{t.description}</div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`font-mono text-sm font-bold ${
                  t.score >= 80 ? "text-emerald-400" : t.score >= 50 ? "text-amber-400" : "text-rose-400"
                }`}
              >
                {t.score}
              </span>
              <span className="text-[9px] block text-slate-400">{t.risk} RISK</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

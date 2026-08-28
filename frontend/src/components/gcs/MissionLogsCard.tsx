import React from "react";
import { type LogEntry } from "../../types/telemetry";
import { Terminal, Clock, Trash2 } from "lucide-react";

export type MissionLogsProps = {
  logs: LogEntry[];
  onClear?: () => void;
};

export function MissionLogsCard({ logs, onClear }: MissionLogsProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            MISSION LOGS & EVENT STREAM
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Log Feed Stream */}
      <div className="mt-2.5 flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No mission events recorded.</div>
        ) : (
          logs.map((item, idx) => {
            const isWarn = item.msg.includes("WARNING") || item.type === "warn";
            const isCrit = item.msg.includes("CRITICAL") || item.type === "critical";
            const isTars = item.msg.includes("TARS") || item.type === "tars";

            return (
              <div
                key={idx}
                className={`flex items-start gap-2 rounded px-2.5 py-1.5 border transition-all ${
                  isCrit
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : isWarn
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : isTars
                    ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
                    : "border-slate-800/80 bg-slate-900/50 text-slate-300"
                }`}
              >
                <span className="flex items-center gap-1 shrink-0 text-slate-500 text-[10px]">
                  <Clock className="h-3 w-3" /> {item.time}
                </span>
                <span className="leading-snug">{item.msg}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

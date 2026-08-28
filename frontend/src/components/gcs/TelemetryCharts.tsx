import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Activity } from "lucide-react";

export type TelemetryChartsProps = {
  data: { t: string; rpm: number; cht: number; oil: number; vib: number }[];
  liveRPM: number;
  chtCyl3: number;
};

export function TelemetryCharts({ data, liveRPM, chtCyl3 }: TelemetryChartsProps) {
  return (
    <div className="h-full flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/80 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">
        <span className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-cyan-400" /> Live Telemetry Waveforms (RPM / CHT 3 / Oil PSI)
        </span>
        <span className="text-cyan-400">{liveRPM} RPM · CHT {chtCyl3} °C</span>
      </div>

      <ResponsiveContainer width="100%" height="82%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="t" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "#090d16", borderColor: "#334155", fontSize: 11 }} />
          <Line type="monotone" dataKey="rpm" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="RPM" />
          <Line type="monotone" dataKey="cht" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="CHT 3 (°C)" />
          <Line type="monotone" dataKey="oil" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Oil (PSI)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

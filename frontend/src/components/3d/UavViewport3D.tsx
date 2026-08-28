import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { UavEngine3DTwin, type Engine3DTwinProps } from "./UavEngine3DTwin";
import { Layers, Eye } from "lucide-react";
import { SUB_BY_ID } from "../../types/telemetry";

export type Viewport3DProps = Engine3DTwinProps & {
  onToggleViewMode: () => void;
  onClearFocus: () => void;
};

export function UavViewport3D(props: Viewport3DProps) {
  const controlsRef = useRef<any>(null);
  const alerting = Object.values(props.states).some((s) => s !== "nominal");

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-slate-800 bg-[#070c14] shadow-2xl">
      <Canvas
        camera={{
          position: props.viewMode === "engine" ? [2.4, 1.1, -3.2] : [4.5, 2.2, 5.5],
          fov: 45,
        }}
        shadows
        className="h-full w-full bg-[#070c14]"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.8} color="#0284c7" />
        <pointLight position={[0, -2, -1.5]} intensity={1.2} color="#f59e0b" />

        <Grid
          position={[0, -1.6, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.8}
          cellColor="#1e293b"
          sectionSize={2}
          sectionThickness={1.2}
          sectionColor="#0284c7"
          fadeDistance={25}
          fadeStrength={1.5}
        />

        <UavEngine3DTwin {...props} />

        <Environment preset="night" />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={!props.focus && props.viewMode === "airframe"}
          autoRotateSpeed={0.8}
        />
      </Canvas>

      {/* Top Clean HUD Controls */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-mono text-[10px] uppercase">
        <span className="pointer-events-auto flex items-center gap-1.5 rounded border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-300 backdrop-blur-md">
          <Eye className="h-3.5 w-3.5 text-cyan-400" />
          {props.focus ? `FOCUS · ${SUB_BY_ID[props.focus].short}` : `AIRFRAME · ${props.viewMode.toUpperCase()}`}
        </span>

        <button
          onClick={props.onToggleViewMode}
          className="pointer-events-auto flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/60 px-2.5 py-1 text-cyan-300 backdrop-blur-md transition-all hover:bg-cyan-900/70"
        >
          <Layers className="h-3.5 w-3.5" />
          {props.viewMode === "airframe" ? "Engine Cutaway View" : "Airframe Orbit View"}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[10px] uppercase">
        <span className="rounded border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-400 backdrop-blur-md">
          SYNC 20 Hz · TWIN {alerting ? "DIVERGENT ⚠" : "LOCKED"}
        </span>
      </div>
    </div>
  );
}

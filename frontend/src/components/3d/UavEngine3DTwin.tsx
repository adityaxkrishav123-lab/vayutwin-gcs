import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { type Severity, type SubsystemId } from "../../types/telemetry";

export type Engine3DTwinProps = {
  states: Record<SubsystemId, Severity>;
  cylTemps: [number, number, number, number]; // CHT for Cylinders 1, 2, 3, 4 (°C)
  rpm: number;
  vibration: number;
  activeScenario: string | null;
  focus: SubsystemId | null;
  viewMode: "airframe" | "engine";
  onSelectComponent: (id: SubsystemId) => void;
};

const COLD_COLOR = new THREE.Color("#1e293b");
const WARN_COLOR = new THREE.Color("#f59e0b");
const HOT_COLOR = new THREE.Color("#ef4444");

export function UavEngine3DTwin({
  states,
  cylTemps,
  rpm,
  vibration,
  activeScenario,
  focus,
  viewMode,
  onSelectComponent,
}: Engine3DTwinProps) {
  const mainGroup = useRef<THREE.Group>(null);
  const engineBlockRef = useRef<THREE.Group>(null);
  const propGroup = useRef<THREE.Group>(null);
  const cowlRef = useRef<THREE.Mesh>(null);
  const fuelTankRef = useRef<THREE.Mesh>(null);
  const oilPumpRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState<SubsystemId | null>(null);

  // Cylinder material refs for per-piston dynamic emissive thermal glow
  const cylMatRefs = [
    useRef<THREE.MeshStandardMaterial>(null),
    useRef<THREE.MeshStandardMaterial>(null),
    useRef<THREE.MeshStandardMaterial>(null),
    useRef<THREE.MeshStandardMaterial>(null),
  ];

  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Smooth UAV airframe flight motion
    if (mainGroup.current) {
      if (viewMode === "airframe") {
        mainGroup.current.rotation.y = focus ? -0.5 : t * 0.14;
        mainGroup.current.rotation.z = Math.sin(t * 0.4) * 0.035;
        mainGroup.current.position.y = Math.sin(t * 0.6) * 0.05;
      } else {
        mainGroup.current.rotation.y = THREE.MathUtils.lerp(mainGroup.current.rotation.y, -0.65, 0.05);
        mainGroup.current.rotation.x = THREE.MathUtils.lerp(mainGroup.current.rotation.x, 0.18, 0.05);
        mainGroup.current.position.y = 0;
      }
    }

    // High Vibration Animation (3D engine assembly visually shakes at high frequency!)
    if (engineBlockRef.current) {
      if (vibration > 1.2 || states.prop === "critical" || activeScenario === "high_vibration") {
        const shake = (vibration / 2) * 0.04;
        engineBlockRef.current.position.x = Math.sin(t * 45) * shake;
        engineBlockRef.current.position.y = Math.cos(t * 40) * shake;
      } else {
        engineBlockRef.current.position.set(0, 0, 0);
      }
    }

    // Dynamic Propeller Rotation matching FADEC RPM
    if (propGroup.current) {
      propGroup.current.rotation.z += delta * (rpm / 150);
    }

    // Per-Cylinder Independent Emissive Thermal Shader Updates
    cylTemps.forEach((temp, i) => {
      const mat = cylMatRefs[i]?.current;
      if (!mat) return;

      const norm = Math.max(0, Math.min(1, (temp - 175) / 65));
      if (norm < 0.45) {
        tempColor.copy(COLD_COLOR).lerp(WARN_COLOR, norm / 0.45);
      } else {
        tempColor.copy(WARN_COLOR).lerp(HOT_COLOR, (norm - 0.45) / 0.55);
      }

      mat.color.copy(tempColor);
      mat.emissive.copy(HOT_COLOR);
      mat.emissiveIntensity = norm > 0.45 ? (norm - 0.45) * 2.4 * (1 + 0.3 * Math.sin(t * 6)) : 0.05;
    });

    // Fuel Leak Animation (Fuel Tank flashes amber/red)
    if (fuelTankRef.current) {
      const isFuelLeak = states.fuel !== "nominal" || activeScenario === "fuel_leak";
      const mat = fuelTankRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissive.setHex(isFuelLeak ? 0xef4444 : 0x0284c7);
        mat.emissiveIntensity = isFuelLeak ? 0.6 * (1 + Math.sin(t * 8)) : 0.1;
      }
    }

    // Oil Loss Animation (Oil System blinks blue/red)
    if (oilPumpRef.current) {
      const isOilLoss = states.oil !== "nominal" || activeScenario === "oil_loss";
      const mat = oilPumpRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissive.setHex(isOilLoss ? 0xef4444 : 0xeab308);
        mat.emissiveIntensity = isOilLoss ? 0.8 * (1 + Math.sin(t * 10)) : 0.15;
      }
    }

    // Cowl flap actuator movement during high heat & cooling failure
    if (cowlRef.current) {
      const targetAngle = states.cooling !== "nominal" || cylTemps[2] > 210 ? 0.35 : 0.05;
      cowlRef.current.rotation.x = THREE.MathUtils.lerp(cowlRef.current.rotation.x, targetAngle, 0.05);
    }
  });

  return (
    <group ref={mainGroup}>
      {/* ---------------- 1. TRANSLUCENT GLASSMORPHIC UAV AIRFRAME ---------------- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.45, 4.2, 16, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={viewMode === "engine" ? 0.15 : 0.35}
        />
      </mesh>

      {/* Fuel Tank Assembly (Clickable & Flashing during Fuel Leak) */}
      <mesh
        ref={fuelTankRef}
        position={[0, 0.15, 0.4]}
        onClick={() => onSelectComponent("fuel")}
        onPointerOver={() => setHovered("fuel")}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[1.2, 0.35, 0.7]} />
        <meshStandardMaterial
          color={hovered === "fuel" ? "#10b981" : "#0f172a"}
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Nose Radome */}
      <mesh position={[0, 0.32, 2.1]}>
        <sphereGeometry args={[0.58, 32, 24]} />
        <meshStandardMaterial
          color="#e0f2fe"
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={viewMode === "engine" ? 0.12 : 0.38}
        />
      </mesh>

      {/* EO/IR Sensor Ball */}
      <mesh
        position={[0, -0.48, 1.95]}
        onClick={() => onSelectComponent("sensor")}
        onPointerOver={() => setHovered("sensor")}
        onPointerOut={() => setHovered(null)}
      >
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color={hovered === "sensor" ? "#38bdf8" : "#0f172a"}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Wings */}
      <group position={[0, 0.05, 0.4]}>
        <mesh position={[-2.6, 0, 0]} rotation={[0, 0, 0.03]}>
          <boxGeometry args={[4.8, 0.08, 0.68]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} transparent opacity={0.55} />
        </mesh>
        <mesh position={[2.6, 0, 0]} rotation={[0, 0, -0.03]}>
          <boxGeometry args={[4.8, 0.08, 0.68]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} transparent opacity={0.55} />
        </mesh>
      </group>

      {/* ---------------- 2. HERO TEI-PD170 AERO ENGINE ASSEMBLY (SHAKES ON VIBRATION) ---------------- */}
      <group ref={engineBlockRef} position={[0, 0.1, -1.45]}>
        {/* Crankcase Engine Block */}
        <mesh
          castShadow
          position={[0, 0, 0]}
          onClick={() => onSelectComponent("engine")}
          onPointerOver={() => setHovered("engine")}
          onPointerOut={() => setHovered(null)}
        >
          <boxGeometry args={[0.65, 0.52, 0.95]} />
          <meshStandardMaterial
            color={hovered === "engine" || focus === "engine" ? "#f97316" : "#334155"}
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Oil Pump & Sump Assembly (Blinks on Oil Loss) */}
        <mesh
          ref={oilPumpRef}
          position={[0, -0.32, 0]}
          onClick={() => onSelectComponent("oil")}
          onPointerOver={() => setHovered("oil")}
          onPointerOut={() => setHovered(null)}
        >
          <boxGeometry args={[0.45, 0.18, 0.65]} />
          <meshStandardMaterial
            color={hovered === "oil" ? "#3b82f6" : "#1e293b"}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Tubular Steel Engine Mount Space-Frame */}
        <group position={[0, 0, 0.4]}>
          {[
            [-0.32, 0.24, 0],
            [0.32, 0.24, 0],
            [-0.32, -0.24, 0],
            [0.32, -0.24, 0],
          ].map((pos, idx) => (
            <mesh key={idx} position={pos as [number, number, number]} rotation={[0.3, idx % 2 === 0 ? 0.3 : -0.3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
        </group>

        {/* 4 INDIVIDUAL CYLINDERS IN BOXER LAYOUT */}
        {[
          { pos: [-0.45, 0.08, 0.25], idx: 0 },
          { pos: [0.45, 0.08, 0.25], idx: 1 },
          { pos: [-0.45, 0.08, -0.25], idx: 2 },
          { pos: [0.45, 0.08, -0.25], idx: 3 },
        ].map((c) => (
          <group
            key={c.idx}
            position={c.pos as [number, number, number]}
            onClick={() => onSelectComponent("engine")}
            onPointerOver={() => setHovered("engine")}
            onPointerOut={() => setHovered(null)}
          >
            <mesh rotation={[0, 0, c.idx % 2 === 0 ? Math.PI / 2 : -Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.34, 16]} />
              <meshStandardMaterial ref={cylMatRefs[c.idx]} roughness={0.25} metalness={0.75} />
            </mesh>
          </group>
        ))}

        {/* Turbocharger & Exhaust */}
        <group position={[0, -0.32, -0.15]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.16, 0.08, 12, 24]} />
            <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>

        {/* Cowl Flap Actuator */}
        <mesh
          ref={cowlRef}
          position={[0, 0.42, 0.2]}
          rotation={[0.05, 0, 0]}
          onClick={() => onSelectComponent("cooling")}
          onPointerOver={() => setHovered("cooling")}
          onPointerOut={() => setHovered(null)}
        >
          <boxGeometry args={[0.55, 0.04, 0.45]} />
          <meshStandardMaterial
            color={hovered === "cooling" ? "#06b6d4" : states.cooling !== "nominal" ? "#f59e0b" : "#64748b"}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* ---------------- 3. PROPELLER & SPINNER ASSEMBLY ---------------- */}
        <group
          ref={propGroup}
          position={[0, 0.05, -0.95]}
          onClick={() => onSelectComponent("prop")}
          onPointerOver={() => setHovered("prop")}
          onPointerOut={() => setHovered(null)}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.18]} castShadow>
            <coneGeometry args={[0.26, 0.48, 32]} />
            <meshStandardMaterial
              color={hovered === "prop" || focus === "prop" ? "#38bdf8" : "#f8fafc"}
              roughness={0.15}
              metalness={0.5}
            />
          </mesh>

          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh position={[0, 0.72, -0.12]} rotation={[0, 0.25, 0]} castShadow>
                <boxGeometry args={[0.12, 1.25, 0.02]} />
                <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

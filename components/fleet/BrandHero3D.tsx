"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { RotateCw, Check, Sparkles, Sliders, ShieldCheck } from "lucide-react";
import { BrandKey, FLEET_BRANDS, BodyStyle } from "@/constants/fleetShowcase";

interface BrandHero3DProps {
    activeBrand: BrandKey;
    onSelectFlagship?: (modelName: string) => void;
}

// ---------------------------------------------------------------------------
// Procedural Stylized 3D Car Geometry tailored by Body Style
// ---------------------------------------------------------------------------
function DynamicStylizedVehicle({
    paintColor,
    bodyStyle,
}: {
    paintColor: string;
    bodyStyle: BodyStyle;
}) {
    const groupRef = useRef<THREE.Group>(null);

    // Subtle gentle floating breathing idle animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.035;
        }
    });

    // Silhouette Dimensions per bodyStyle
    const isHatch = bodyStyle === "hatchback";
    const isSuv = bodyStyle === "suv";

    // Dimensions
    const chassisWidth = isHatch ? 1.85 : isSuv ? 2.3 : 2.15;
    const chassisHeight = isHatch ? 0.48 : isSuv ? 0.68 : 0.44;
    const chassisLength = isHatch ? 3.35 : isSuv ? 4.6 : 4.45;

    const cabinWidth = isHatch ? 1.62 : isSuv ? 1.88 : 1.76;
    const cabinHeight = isHatch ? 0.62 : isSuv ? 0.72 : 0.52;
    const cabinLength = isHatch ? 1.95 : isSuv ? 2.8 : 2.45;
    const cabinZOffset = isHatch ? -0.15 : isSuv ? -0.1 : -0.22;

    const wheelRadius = isHatch ? 0.32 : isSuv ? 0.42 : 0.36;
    const wheelY = isHatch ? 0.22 : isSuv ? 0.34 : 0.26;
    const wheelZOffset = isHatch ? 1.05 : isSuv ? 1.45 : 1.35;
    const wheelTrack = isHatch ? 0.98 : isSuv ? 1.2 : 1.12;

    return (
        <group ref={groupRef} dispose={null}>
            {/* 1. Main Lower Chassis */}
            <mesh position={[0, chassisHeight / 2 + wheelY * 0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[chassisWidth, chassisHeight, chassisLength]} />
                <meshPhysicalMaterial
                    color={paintColor}
                    metalness={0.84}
                    roughness={0.16}
                    clearcoat={1.0}
                    clearcoatRoughness={0.08}
                    reflectivity={0.9}
                />
            </mesh>

            {/* 2. Cabin & Aerodynamic Tinted Glass */}
            <mesh
                position={[
                    0,
                    chassisHeight + cabinHeight / 2 + wheelY * 0.6 - 0.02,
                    cabinZOffset,
                ]}
                castShadow
            >
                <boxGeometry args={[cabinWidth, cabinHeight, cabinLength]} />
                <meshPhysicalMaterial
                    color="#090d16"
                    roughness={0.1}
                    transmission={0.7}
                    thickness={0.5}
                    ior={1.52}
                />
            </mesh>

            {/* 3. Roof Panel matching body color */}
            <mesh
                position={[
                    0,
                    chassisHeight + cabinHeight + wheelY * 0.6 - 0.01,
                    cabinZOffset,
                ]}
                castShadow
            >
                <boxGeometry args={[cabinWidth * 0.94, 0.04, cabinLength * 0.92]} />
                <meshPhysicalMaterial
                    color={paintColor}
                    metalness={0.84}
                    roughness={0.16}
                    clearcoat={1.0}
                    clearcoatRoughness={0.08}
                />
            </mesh>

            {/* 4. Front Radiator Grille Accent */}
            <mesh position={[0, chassisHeight * 0.5 + wheelY * 0.6, chassisLength / 2 + 0.01]}>
                <boxGeometry args={[chassisWidth * 0.55, chassisHeight * 0.45, 0.04]} />
                <meshStandardMaterial color="#020617" roughness={0.9} metalness={0.2} />
            </mesh>

            {/* 5. Front LED DRL Headlights */}
            <mesh
                position={[
                    -chassisWidth * 0.36,
                    chassisHeight * 0.72 + wheelY * 0.6,
                    chassisLength / 2 + 0.02,
                ]}
            >
                <boxGeometry args={[chassisWidth * 0.22, 0.1, 0.05]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={2.8}
                />
            </mesh>
            <mesh
                position={[
                    chassisWidth * 0.36,
                    chassisHeight * 0.72 + wheelY * 0.6,
                    chassisLength / 2 + 0.02,
                ]}
            >
                <boxGeometry args={[chassisWidth * 0.22, 0.1, 0.05]} />
                <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#38bdf8"
                    emissiveIntensity={2.8}
                />
            </mesh>

            {/* 6. Rear Tail Lamps (Lightbar Aesthetic) */}
            <mesh
                position={[
                    -chassisWidth * 0.35,
                    chassisHeight * 0.72 + wheelY * 0.6,
                    -(chassisLength / 2 + 0.02),
                ]}
            >
                <boxGeometry args={[chassisWidth * 0.24, 0.1, 0.05]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={2.4}
                />
            </mesh>
            <mesh
                position={[
                    chassisWidth * 0.35,
                    chassisHeight * 0.72 + wheelY * 0.6,
                    -(chassisLength / 2 + 0.02),
                ]}
            >
                <boxGeometry args={[chassisWidth * 0.24, 0.1, 0.05]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={2.4}
                />
            </mesh>

            {/* Connecting Rear Light Strip */}
            <mesh
                position={[
                    0,
                    chassisHeight * 0.75 + wheelY * 0.6,
                    -(chassisLength / 2 + 0.02),
                ]}
            >
                <boxGeometry args={[chassisWidth * 0.5, 0.03, 0.05]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={1.8}
                />
            </mesh>

            {/* 7. Four Bi-Tone Alloy Wheels */}
            {[
                [-wheelTrack, wheelY, wheelZOffset],
                [wheelTrack, wheelY, wheelZOffset],
                [-wheelTrack, wheelY, -wheelZOffset],
                [wheelTrack, wheelY, -wheelZOffset],
            ].map((pos, idx) => (
                <group key={idx} position={pos as [number, number, number]}>
                    {/* Tire Rubber */}
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[wheelRadius, wheelRadius, 0.28, 28]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.88} />
                    </mesh>
                    {/* Inner Rim Disk */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[wheelRadius * 0.66, wheelRadius * 0.66, 0.3, 18]} />
                        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.12} />
                    </mesh>
                    {/* Center Hub Cap */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[wheelRadius * 0.22, wheelRadius * 0.22, 0.32, 16]} />
                        <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// ---------------------------------------------------------------------------
// Main BrandHero3D Component
// ---------------------------------------------------------------------------
export default function BrandHero3D({ activeBrand, onSelectFlagship }: BrandHero3DProps) {
    const meta = FLEET_BRANDS[activeBrand];

    // Local Paint Color state with auto-sync on brand switch
    const [paintColor, setPaintColor] = useState(meta.defaultPaintHex);
    const [autoRotate, setAutoRotate] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync paint color whenever activeBrand changes
    useEffect(() => {
        setPaintColor(meta.defaultPaintHex);
    }, [activeBrand, meta.defaultPaintHex]);

    return (
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl">
            {/* Ambient Background Glow tailored by brand */}
            <div
                className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
                    activeBrand === "toyota"
                        ? "bg-emerald-500"
                        : activeBrand === "honda"
                        ? "bg-sky-500"
                        : "bg-amber-500"
                }`}
            />

            {/* Top Stage Header Overlay */}
            <div className="relative z-10 p-4 md:p-6 pb-0 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Sparkles className="w-3 h-3" />
                            {meta.badge}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                            {meta.modelYear} Flagship Showcase
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {meta.displayName} {meta.flagshipModel}
                    </h2>

                    <p className="text-xs md:text-sm text-slate-400 max-w-lg">
                        {meta.tagline}
                    </p>
                </div>

                {/* Pricing & CTA Quick-action */}
                <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800">
                    <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                            12-Hour Shift Rate
                        </span>
                        <span className="text-lg font-black text-emerald-400">
                            PKR {meta.startingRate12h.toLocaleString()}
                        </span>
                    </div>
                    {onSelectFlagship && (
                        <button
                            onClick={() => onSelectFlagship(meta.flagshipModel)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-md"
                        >
                            Select Model
                        </button>
                    )}
                </div>
            </div>

            {/* 3D WebGL Canvas Viewport */}
            <div className="relative w-full h-[360px] md:h-[440px]">
                {isMounted ? (
                    <Canvas shadows camera={{ position: [4.2, 2.8, 5.2], fov: 42 }}>
                        {/* High-fidelity studio lighting setup */}
                        <ambientLight intensity={0.8} />
                        <spotLight
                            position={[10, 16, 10]}
                            angle={0.35}
                            penumbra={1}
                            intensity={2.4}
                            castShadow
                            shadow-bias={-0.0001}
                        />
                        <directionalLight position={[-10, 12, -6]} intensity={0.6} />
                        <directionalLight position={[0, -2, 6]} intensity={0.2} />

                        {/* Floating Stage with gentle inertia */}
                        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.12}>
                            <Stage
                                environment="city"
                                intensity={0.45}
                                adjustCamera={false}
                                shadows={false}
                            >
                                <DynamicStylizedVehicle
                                    paintColor={paintColor}
                                    bodyStyle={meta.bodyStyle}
                                />
                            </Stage>
                        </Float>

                        {/* Realistic Contact Shadow on Studio Floor */}
                        <ContactShadows
                            position={[0, -0.01, 0]}
                            opacity={0.65}
                            scale={10}
                            blur={1.8}
                            far={4}
                        />

                        {/* Smooth Orbit Controls */}
                        <OrbitControls
                            enableZoom={true}
                            minDistance={3.2}
                            maxDistance={8.0}
                            maxPolarAngle={Math.PI / 2.05}
                            minPolarAngle={Math.PI / 6}
                            autoRotate={autoRotate}
                            autoRotateSpeed={0.9}
                            enableDamping={true}
                            dampingFactor={0.05}
                        />
                    </Canvas>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                        <span>Initializing 3D Studio Engine...</span>
                    </div>
                )}

                {/* Floating Interactive Instructions */}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" />
                    360° Studio • Drag to Inspect • Pinch / Scroll to Zoom
                </div>

                {/* Auto-spin Toggle Button */}
                <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                    <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
                    {autoRotate ? "Pause Spin" : "Auto Spin"}
                </button>
            </div>

            {/* Bottom Controls Bar: OEM Swatches & Spec Pills */}
            <div className="p-4 md:p-5 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                {/* Paint Palette Swatcher */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">
                        OEM Shades:
                    </span>
                    <div className="flex items-center gap-2">
                        {meta.palette.map((c) => (
                            <button
                                key={c.hex}
                                onClick={() => setPaintColor(c.hex)}
                                title={c.label}
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                                    paintColor === c.hex
                                        ? "scale-110 border-emerald-400 ring-2 ring-emerald-500/30"
                                        : "border-slate-700 hover:scale-105"
                                }`}
                                style={{ backgroundColor: c.hex }}
                            >
                                {paintColor === c.hex && (
                                    <Check
                                        className={`w-3.5 h-3.5 ${
                                            c.hex === "#f8fafc" ? "text-slate-950" : "text-white"
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spec Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    {meta.specs.map((spec, i) => (
                        <span
                            key={i}
                            className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1"
                        >
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            {spec}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

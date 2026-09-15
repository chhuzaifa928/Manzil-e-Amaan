// components/partner/CascadingCarForm.tsx
"use client";

import React, { useState } from "react";
import { VEHICLE_CATALOG, COMMON_SPECS } from "@/constants/vehicleCatalog";

interface FormProps {
    partnerId: string;
    partnerType: "showroom_owner" | "private_owner";
}

export default function CascadingCarForm({ partnerId, partnerType }: FormProps) {
    const brands = Object.keys(VEHICLE_CATALOG);

    const [selectedBrand, setSelectedBrand] = useState(brands[0]);
    const [selectedModel, setSelectedModel] = useState(VEHICLE_CATALOG[brands[0]][0].name);
    const [modelYear, setModelYear] = useState(2023);
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [color, setColor] = useState("White");
    const [transmission, setTransmission] = useState<"automatic" | "manual">("automatic");
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([COMMON_SPECS[0]]);
    const [rate12h, setRate12h] = useState("4500");
    const [allowedService, setAllowedService] = useState<"with_driver_only" | "both">("both");
    const [photoUrl, setPhotoUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleBrandChange = (newBrand: string) => {
        setSelectedBrand(newBrand);
        const availableModels = VEHICLE_CATALOG[newBrand];
        if (availableModels && availableModels.length > 0) {
            setSelectedModel(availableModels[0].name);
        }
    };

    const toggleSpec = (spec: string) => {
        setSelectedSpecs((prev) =>
            prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        try {
            const res = await fetch("/api/partners/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerId,
                    brand: selectedBrand,
                    modelName: selectedModel,
                    modelYear: Number(modelYear),
                    registrationNumber,
                    color,
                    transmission,
                    specs: selectedSpecs,
                    rate12h: Number(rate12h),
                    allowedService,
                    photos: photoUrl ? [photoUrl] : [],
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorDetail = data.details
                    ? typeof data.details === "string"
                        ? data.details
                        : JSON.stringify(data.details)
                    : data.error || "Failed to list vehicle";
                throw new Error(errorDetail);
            }

            setStatusMessage({ type: "success", text: data.message });
            setRegistrationNumber("");
        } catch (err: any) {
            setStatusMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-black text-white">List a Vehicle</h2>
                <p className="text-slate-400 text-[11px] mt-0.5">
                    {partnerType === "showroom_owner"
                        ? "🏢 Showroom Fleet Listing (Full Fleet Capacity)"
                        : "👤 Private Host Listing (Strictly Capped at 1 Active Car)"}
                </p>
            </div>

            {statusMessage && (
                <div
                    className={`p-3 rounded-xl border text-xs font-semibold ${statusMessage.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                >
                    {statusMessage.text}
                </div>
            )}

            {/* 1. Brand & Model Cascade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Make / Company</label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                        {brands.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Model Name</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                        {VEHICLE_CATALOG[selectedBrand]?.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Model Year</label>
                    <select
                        value={modelYear}
                        onChange={(e) => setModelYear(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                        {Array.from({ length: 18 }, (_, i) => 2026 - i).map((yr) => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 2. Registration Number, Color, Transmission */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Registration #</label>
                    <input
                        type="text"
                        placeholder="e.g. ICT-LE-8910"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono uppercase"
                        required
                    />
                </div>

                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Exterior Color</label>
                    <input
                        type="text"
                        placeholder="e.g. White, Silver, Black"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                        required
                    />
                </div>

                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Transmission</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => setTransmission("automatic")}
                            className={`py-2 rounded-xl font-bold transition-all ${transmission === "automatic"
                                ? "bg-emerald-500 text-black shadow-md"
                                : "bg-slate-950 text-slate-400 border border-slate-800"
                                }`}
                        >
                            Auto
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransmission("manual")}
                            className={`py-2 rounded-xl font-bold transition-all ${transmission === "manual"
                                ? "bg-emerald-500 text-black shadow-md"
                                : "bg-slate-950 text-slate-400 border border-slate-800"
                                }`}
                        >
                            Manual
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Specs Checklist */}
            <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Features & Specifications</label>
                <div className="flex flex-wrap gap-1.5">
                    {COMMON_SPECS.map((spec) => {
                        const isSelected = selectedSpecs.includes(spec);
                        return (
                            <button
                                type="button"
                                key={spec}
                                onClick={() => toggleSpec(spec)}
                                className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${isSelected
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                    }`}
                            >
                                {isSelected ? "✓ " : "+ "} {spec}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. 12-Hour Shift Pricing & Service Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div>
                    <label className="text-slate-300 font-semibold block mb-1">12-Hour Shift Rate (PKR)</label>
                    <input
                        type="number"
                        value={rate12h}
                        onChange={(e) => setRate12h(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                        required
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">12-hour block basis · Fuel is customer-covered</span>
                </div>

                <div>
                    <label className="text-slate-300 font-semibold block mb-1">Rental Permission</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setAllowedService("with_driver_only")}
                            className={`p-2 rounded-xl border text-center font-bold transition-all ${allowedService === "with_driver_only"
                                ? "bg-amber-500/10 border-amber-500 text-amber-300"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                                }`}
                        >
                            👨‍✈️ Driver Only
                        </button>
                        <button
                            type="button"
                            onClick={() => setAllowedService("both")}
                            className={`p-2 rounded-xl border text-center font-bold transition-all ${allowedService === "both"
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                                }`}
                        >
                            🔄 Both Options
                        </button>
                    </div>
                </div>
            </div>

            {/* Photo URL */}
            <div>
                <label className="text-slate-300 font-semibold block mb-1">Vehicle Image URL (Optional)</label>
                <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
                {loading ? "Registering Vehicle..." : "Publish Vehicle to Fleet"}
            </button>
        </form>
    );
}
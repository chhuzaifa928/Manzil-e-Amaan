"use client";

import React, { useState, useEffect, useId } from "react";
import {
    X,
    Calendar,
    Clock,
    User,
    Phone,
    ShieldCheck,
    CheckCircle2,
    MapPin,
    Car,
    Sparkles,
    Check,
} from "lucide-react";

export interface BookingVehicle {
    id: string;
    brand: string;
    model_name: string;
    model_year: number;
    rate_12h: number;
    allowed_service: "with_driver_only" | "both";
    business_name?: string;
    city?: string;
    color?: string;
    transmission?: string;
    photos?: string[];
}

interface BookingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: BookingVehicle | null;
}

export default function BookingFormModal({
    isOpen,
    onClose,
    vehicle,
}: BookingFormModalProps) {
    const nameInputId = useId();
    const phoneInputId = useId();
    const dateInputId = useId();

    // Form fields
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [pickupDate, setPickupDate] = useState("");
    const [shift, setShift] = useState<"day" | "night">("day");
    const [includeChauffeur, setIncludeChauffeur] = useState(true);

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [bookingCode, setBookingCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Initialize pickup date to tomorrow
    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setPickupDate(tomorrow.toISOString().split("T")[0]);
            setIsConfirmed(false);
            setErrorMsg("");
            setBookingCode("");
            // Default chauffeur state based on vehicle allowance
            if (vehicle?.allowed_service === "with_driver_only") {
                setIncludeChauffeur(true);
            }
        }
    }, [isOpen, vehicle]);

    // Handle Escape key listener & body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !vehicle) return null;

    // Validate Pakistan phone number format
    const isValidPakistanPhone = (val: string) => {
        const clean = val.replace(/[\s\-]/g, "");
        // Matches +923001234567, 03001234567, 923001234567
        return /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/.test(clean);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!fullName.trim() || fullName.trim().length < 2) {
            setErrorMsg("Please enter your full name (minimum 2 characters).");
            return;
        }

        if (!isValidPakistanPhone(phone)) {
            setErrorMsg(
                "Please enter a valid Pakistani mobile number (e.g. 0300 1234567 or +92 300 1234567)."
            );
            return;
        }

        if (!pickupDate) {
            setErrorMsg("Please select a valid booking date.");
            return;
        }

        setIsSubmitting(true);

        // Simulate seamless reservation processing
        setTimeout(() => {
            const randomCode = `MZ-${Math.floor(10000 + Math.random() * 90000)}`;
            setBookingCode(randomCode);
            setIsSubmitting(false);
            setIsConfirmed(true);
        }, 600);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto">
                {/* 1. Modal Header */}
                <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-800 bg-slate-950/60">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                12-Hour Block Reservation
                            </span>
                            <span className="text-xs text-slate-400">
                                {vehicle.model_year} Model
                            </span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-black text-white">
                            {vehicle.brand} {vehicle.model_name}
                        </h2>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                {vehicle.business_name || "Certified Showroom"} •{" "}
                                {vehicle.city || "Islamabad / Rawalpindi"}
                            </span>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            aria-label="Close reservation modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                                12-Hour Shift
                            </span>
                            <span className="text-sm font-black text-emerald-400">
                                PKR {Number(vehicle.rate_12h).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Content Body: Confirmation vs. Input Form */}
                {isConfirmed ? (
                    <div className="p-6 md:p-8 space-y-6 text-center animate-fadeIn">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                                Reservation Request Confirmed
                            </span>
                            <h3 className="text-2xl font-black text-white">
                                {bookingCode}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto">
                                Your 12-hour reservation request for the{" "}
                                <strong className="text-slate-200">
                                    {vehicle.brand} {vehicle.model_name}
                                </strong>{" "}
                                has been logged. Our fleet coordinator is connecting with the showroom.
                            </p>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Guest Name:</span>
                                <span className="font-semibold text-white">{fullName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">WhatsApp Contact:</span>
                                <span className="font-mono text-emerald-400">{phone}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Booking Date:</span>
                                <span className="font-semibold text-white">{pickupDate}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Shift Window:</span>
                                <span className="font-semibold text-white">
                                    {shift === "day"
                                        ? "Day Shift (08:00 AM – 08:00 PM)"
                                        : "Night Shift (08:00 PM – 08:00 AM)"}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Chauffeur Service:</span>
                                <span className="font-semibold text-emerald-400">
                                    {includeChauffeur
                                        ? "Professional Chauffeur Included"
                                        : "Self-Drive Authorized"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 rounded-xl transition shadow-lg"
                        >
                            Done & Return to Fleet
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
                        {errorMsg && (
                            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
                                {errorMsg}
                            </div>
                        )}

                        {/* Customer Full Name */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={nameInputId}
                                className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                            >
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                Full Name:
                            </label>
                            <input
                                id={nameInputId}
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. Malik Muhammad Huzaifa"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>

                        {/* WhatsApp / Mobile Contact */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={phoneInputId}
                                className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                            >
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                WhatsApp / Contact Number:
                            </label>
                            <input
                                id={phoneInputId}
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0300 1234567 or +92 300 1234567"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                            />
                            <span className="text-[11px] text-slate-500 block">
                                Showroom updates and direct dispatch PIN will be sent to this number.
                            </span>
                        </div>

                        {/* Booking Date & 12h Shift Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor={dateInputId}
                                    className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                                    Booking Date:
                                </label>
                                <input
                                    id={dateInputId}
                                    type="date"
                                    required
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                                />
                            </div>

                            {/* 12-Hour Shift Selection */}
                            <div className="space-y-1.5">
                                <span className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                    12-Hour Shift Window:
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShift("day")}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition flex flex-col justify-between ${
                                            shift === "day"
                                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                        }`}
                                    >
                                        <span className="font-bold block">Day Shift</span>
                                        <span className="text-[10px] opacity-80">
                                            08:00 AM – 08:00 PM
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShift("night")}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition flex flex-col justify-between ${
                                            shift === "night"
                                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                        }`}
                                    >
                                        <span className="font-bold block">Night Shift</span>
                                        <span className="text-[10px] opacity-80">
                                            08:00 PM – 08:00 AM
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Service Options (Chauffeur toggle vs permanent badge) */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                            <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                                <Car className="w-3.5 h-3.5 text-emerald-400" />
                                Driver & Service Configuration:
                            </span>

                            {vehicle.allowed_service === "with_driver_only" ? (
                                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/20 px-3 py-2 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>
                                        <strong>Chauffeur Included:</strong> This vehicle is strictly operated by verified professional chauffeurs.
                                    </span>
                                </div>
                            ) : (
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 transition">
                                            Include Professional Chauffeur
                                        </span>
                                        <span className="text-[11px] text-slate-400 block">
                                            Trained executive driver dedicated for your 12-hour booking.
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={includeChauffeur}
                                        onClick={() => setIncludeChauffeur(!includeChauffeur)}
                                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                            includeChauffeur
                                                ? "bg-emerald-500"
                                                : "bg-slate-800"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block w-4 h-4 rounded-full bg-slate-950 transform transition-transform ${
                                                includeChauffeur
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </label>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold text-sm py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                        <span>Confirming Block Reservation...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>
                                            Reserve 12h Block • PKR{" "}
                                            {Number(vehicle.rate_12h).toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

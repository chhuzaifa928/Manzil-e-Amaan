// constants/fleetShowcase.ts

export type BrandKey = "toyota" | "suzuki" | "honda";

export type BodyStyle = "sedan" | "hatchback" | "suv";

export interface ColorOption {
    label: string;
    hex: string;
}

export interface BrandMetadata {
    key: BrandKey;
    displayName: string;
    tagline: string;
    flagshipModel: string;
    modelYear: number;
    bodyStyle: BodyStyle;
    defaultPaintHex: string;
    palette: ColorOption[];
    specs: string[];
    startingRate12h: number;
    description: string;
    badge: string;
}

export const FLEET_BRANDS: Record<BrandKey, BrandMetadata> = {
    toyota: {
        key: "toyota",
        displayName: "Toyota",
        tagline: "Executive Comfort, Superior Reliability & Prestige",
        flagshipModel: "Corolla Altis Grande",
        modelYear: 2023,
        bodyStyle: "sedan",
        defaultPaintHex: "#f8fafc", // Pearl White
        startingRate12h: 9500,
        badge: "Twin Cities Executive Choice",
        specs: [
            "1.8L Dual VVT-i Engine",
            "CVT-i 7-Speed Sport Mode",
            "Electric Sunroof",
            "Cruise Control & Climate AC",
        ],
        description:
            "The quintessential executive rental choice across Islamabad & Rawalpindi for diplomatic, business, and wedding travels.",
        palette: [
            { label: "Super White", hex: "#f8fafc" },
            { label: "Attitude Black", hex: "#0a0a0c" },
            { label: "Silver Metallic", hex: "#64748b" },
            { label: "Phantom Brown", hex: "#3b2a1a" },
            { label: "Royal Emerald", hex: "#064e3b" },
        ],
    },
    suzuki: {
        key: "suzuki",
        displayName: "Suzuki",
        tagline: "Agile City Cruising & Exceptional Fuel Economy",
        flagshipModel: "Alto VXL",
        modelYear: 2023,
        bodyStyle: "hatchback",
        defaultPaintHex: "#94a3b8", // Silky Silver
        startingRate12h: 4500,
        badge: "Smart Urban Efficiency",
        specs: [
            "660cc R06A Efficient Motor",
            "Auto Gear Shift (AGS)",
            "Chilled AC & Power Windows",
            "ABS Braking with EBD",
        ],
        description:
            "Perfect for navigating bustling Twin Cities avenues and tight urban parking with unmatched fuel efficiency.",
        palette: [
            { label: "Silky Silver", hex: "#94a3b8" },
            { label: "Solid White", hex: "#f8fafc" },
            { label: "Graphite Grey", hex: "#334155" },
            { label: "Cerulean Blue", hex: "#1e3a8a" },
            { label: "Crimson Red", hex: "#991b1b" },
        ],
    },
    honda: {
        key: "honda",
        displayName: "Honda",
        tagline: "Aerodynamic Power, Sport Stance & Turbocharged Luxury",
        flagshipModel: "Civic (Oriel / RS)",
        modelYear: 2023,
        bodyStyle: "sedan",
        defaultPaintHex: "#0f172a", // Crystal Black Pearl
        startingRate12h: 11500,
        badge: "Sport Prestige Edition",
        specs: [
            "1.5L DOHC VTEC Turbo (176 HP)",
            "LL-CVT with Sport Mode",
            "Panoramic Power Sunroof",
            "Digital Cockpit & Leather Trim",
        ],
        description:
            "Uncompromising road presence and turbocharged power engineered for grand highway journeys and high-profile VIP transport.",
        palette: [
            { label: "Crystal Black", hex: "#0f172a" },
            { label: "Taffeta White", hex: "#f8fafc" },
            { label: "Meteoroid Gray", hex: "#475569" },
            { label: "Carnelian Red", hex: "#881337" },
            { label: "Midnight Blue", hex: "#172554" },
        ],
    },
};

export const BRAND_ORDER: BrandKey[] = ["toyota", "suzuki", "honda"];

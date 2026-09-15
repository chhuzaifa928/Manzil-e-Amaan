// constants/vehicleCatalog.ts

export interface CarModelSpec {
    name: string;
    defaultTier: "standard" | "luxury";
    transmissions: ("automatic" | "manual")[];
    bodyType: "hatchback" | "sedan" | "suv" | "crossover" | "van";
}

export const VEHICLE_CATALOG: Record<string, CarModelSpec[]> = {
    Suzuki: [
        { name: "Alto", defaultTier: "standard", transmissions: ["automatic", "manual"], bodyType: "hatchback" },
        { name: "Cultus", defaultTier: "standard", transmissions: ["automatic", "manual"], bodyType: "hatchback" },
        { name: "Wagon R", defaultTier: "standard", transmissions: ["manual"], bodyType: "hatchback" },
        { name: "Swift", defaultTier: "standard", transmissions: ["automatic", "manual"], bodyType: "hatchback" },
        { name: "Every / Bolan", defaultTier: "standard", transmissions: ["manual"], bodyType: "van" },
    ],
    Toyota: [
        { name: "Corolla Altis Grande", defaultTier: "standard", transmissions: ["automatic"], bodyType: "sedan" },
        { name: "Corolla GLi / XLi", defaultTier: "standard", transmissions: ["automatic", "manual"], bodyType: "sedan" },
        { name: "Yaris", defaultTier: "standard", transmissions: ["automatic", "manual"], bodyType: "sedan" },
        { name: "Fortuner", defaultTier: "luxury", transmissions: ["automatic"], bodyType: "suv" },
        { name: "Land Cruiser Prado", defaultTier: "luxury", transmissions: ["automatic"], bodyType: "suv" },
        { name: "Hilux Revo", defaultTier: "luxury", transmissions: ["automatic", "manual"], bodyType: "suv" },
    ],
    Honda: [
        { name: "Civic (Oriel / RS)", defaultTier: "standard", transmissions: ["automatic"], bodyType: "sedan" },
        { name: "City", defaultTier: "standard", transmissions: ["automatic", "manual"], bodyType: "sedan" },
        { name: "BR-V", defaultTier: "standard", transmissions: ["automatic"], bodyType: "crossover" },
    ],
    Hyundai: [
        { name: "Elantra", defaultTier: "standard", transmissions: ["automatic"], bodyType: "sedan" },
        { name: "Sonata", defaultTier: "luxury", transmissions: ["automatic"], bodyType: "sedan" },
        { name: "Tucson", defaultTier: "standard", transmissions: ["automatic"], bodyType: "suv" },
    ],
    KIA: [
        { name: "Sportage", defaultTier: "standard", transmissions: ["automatic"], bodyType: "suv" },
        { name: "Stonic", defaultTier: "standard", transmissions: ["automatic"], bodyType: "crossover" },
        { name: "Sorento", defaultTier: "luxury", transmissions: ["automatic"], bodyType: "suv" },
    ],
};

export const COMMON_SPECS = [
    "Air Conditioning (Chilled AC)",
    "Sunroof / Moonroof",
    "Android Auto / Apple CarPlay",
    "Reverse Camera",
    "Leather Seats",
    "Dashcam Installed",
    "Alloy Wheels",
];
// app/api/partners/vehicles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { VEHICLE_CATALOG } from "@/constants/vehicleCatalog";

const VehicleSubmissionSchema = z.object({
    partnerId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "Invalid Partner ID format"
        ),
    brand: z.string().min(1, "Brand is required"),
    modelName: z.string().min(1, "Model name is required"),
    modelYear: z.coerce.number().int().min(2005).max(2030),
    registrationNumber: z.string().trim().min(3, "Registration number is required").max(20),
    color: z.string().min(1, "Color is required"),
    transmission: z.enum(["automatic", "manual"]),
    specs: z.array(z.string()).default([]),
    rate12h: z.coerce.number().positive("Rate must be greater than 0"),
    allowedService: z.enum(["with_driver_only", "both"]),
    photos: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
    try {
        const rawData = await req.json();

        // Clean photos array: discard empty strings if user left the field blank
        if (Array.isArray(rawData.photos)) {
            rawData.photos = rawData.photos.filter((url: string) => typeof url === "string" && url.trim().length > 0);
        }

        const parsed = VehicleSubmissionSchema.safeParse(rawData);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Validation Error",
                    details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
                },
                { status: 400 }
            );
        }

        const {
            partnerId,
            brand,
            modelName,
            modelYear,
            registrationNumber,
            color,
            transmission,
            specs,
            rate12h,
            allowedService,
            photos,
        } = parsed.data;

        // 1. Verify Partner existence
        const partnerCheck = await db.query(
            "SELECT id, partner_type, status FROM partners WHERE id = $1",
            [partnerId]
        );

        if (partnerCheck.rowCount === 0) {
            return NextResponse.json(
                {
                    error: `Partner ID (${partnerId}) not found in the database. Please insert a test partner into the 'partners' table first.`
                },
                { status: 404 }
            );
        }

        const partner = partnerCheck.rows[0];
        if (partner.status !== "active") {
            return NextResponse.json(
                { error: "Partner account is not currently active." },
                { status: 403 }
            );
        }

        // 2. Identify Tier from Catalog
        const brandCatalog = VEHICLE_CATALOG[brand] || [];
        const matchedModel = brandCatalog.find(
            (m) => m.name.toLowerCase() === modelName.toLowerCase()
        );
        const tier = matchedModel?.defaultTier || "standard";
        const hasSunroof = specs.includes("Sunroof / Moonroof");

        // 3. Insert into Database
        const insertQuery = `
      INSERT INTO partner_vehicles (
        partner_id, brand, model_name, model_year, registration_number,
        color, transmission, specs, rate_12h, allowed_service,
        tier, has_sunroof, photos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, brand, model_name, tier, approval_status, is_active;
    `;

        const result = await db.query(insertQuery, [
            partnerId,
            brand,
            modelName,
            modelYear,
            registrationNumber.toUpperCase(),
            color,
            transmission,
            specs,
            rate12h,
            allowedService,
            tier,
            hasSunroof,
            photos,
        ]);

        const vehicle = result.rows[0];

        return NextResponse.json(
            {
                message:
                    vehicle.tier === "luxury"
                        ? "Luxury vehicle submitted. Awaiting admin verification before activation."
                        : "Vehicle listed successfully and active on the Manzil-e-Amaan network.",
                vehicle,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Vehicle creation error:", error);

        if (error.message?.includes("Private owners are strictly restricted to 1 active vehicle")) {
            return NextResponse.json(
                { error: "Limit Reached: Private owners can only list 1 active vehicle at a time." },
                { status: 400 }
            );
        }

        if (error.code === "23505") {
            return NextResponse.json(
                { error: "A vehicle with this registration number is already registered." },
                { status: 409 }
            );
        }

        return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
    }
}
// scripts/verify-all.js
const { Client } = require("pg");

async function runTests() {
    console.log("=== Comprehensive Verification ===");

    const partnerId = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

    // Test 1: Standard Vehicle Creation
    console.log("\n1. Testing Standard Vehicle creation (Toyota Corolla)...");
    const regStandard = `TEST-STD-${Date.now().toString().slice(-4)}`;
    const res1 = await fetch("http://localhost:3000/api/partners/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            partnerId,
            brand: "Toyota",
            modelName: "Corolla Altis Grande",
            modelYear: 2023,
            registrationNumber: regStandard,
            color: "Phantom White",
            transmission: "automatic",
            specs: ["Air Conditioning (Chilled AC)"],
            rate12h: 8000,
            allowedService: "both",
            photos: []
        })
    });
    const data1 = await res1.json();
    console.log("Status:", res1.status);
    console.log("Result:", data1);
    if (res1.status !== 201 || data1.vehicle.tier !== "standard" || !data1.vehicle.is_active) {
        throw new Error("Standard vehicle test failed!");
    }
    console.log("✓ Standard Vehicle created successfully.");

    // Test 2: Luxury Vehicle Creation (Should trigger pending_approval & is_active = false)
    console.log("\n2. Testing Luxury Vehicle creation (Toyota Fortuner)...");
    const regLux = `TEST-LUX-${Date.now().toString().slice(-4)}`;
    const res2 = await fetch("http://localhost:3000/api/partners/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            partnerId,
            brand: "Toyota",
            modelName: "Fortuner",
            modelYear: 2023,
            registrationNumber: regLux,
            color: "Attitude Black",
            transmission: "automatic",
            specs: ["Air Conditioning (Chilled AC)", "Sunroof / Moonroof", "Leather Seats"],
            rate12h: 25000,
            allowedService: "with_driver_only",
            photos: []
        })
    });
    const data2 = await res2.json();
    console.log("Status:", res2.status);
    console.log("Result:", data2);
    if (res2.status !== 201 || data2.vehicle.tier !== "luxury" || data2.vehicle.approval_status !== "pending_approval" || data2.vehicle.is_active !== false) {
        throw new Error("Luxury vehicle test failed!");
    }
    console.log("✓ Luxury Vehicle created and routed to pending_approval successfully by DB trigger.");

    // Test 3: Duplicate Registration Number (Should return 409 Conflict)
    console.log("\n3. Testing Duplicate Registration Number...");
    const res3 = await fetch("http://localhost:3000/api/partners/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            partnerId,
            brand: "Suzuki",
            modelName: "Alto",
            modelYear: 2022,
            registrationNumber: regStandard, // duplicate!
            color: "Silver",
            transmission: "manual",
            specs: [],
            rate12h: 3500,
            allowedService: "both",
            photos: []
        })
    });
    const data3 = await res3.json();
    console.log("Status:", res3.status);
    console.log("Result:", data3);
    if (res3.status !== 409) {
        throw new Error("Duplicate check failed!");
    }
    console.log("✓ Duplicate registration rejected with 409 Conflict.");

    // Test 4: Unknown Partner ID (Should return 404 Not Found)
    console.log("\n4. Testing Non-existent Partner ID...");
    const res4 = await fetch("http://localhost:3000/api/partners/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            partnerId: "00000000-0000-0000-0000-000000000000",
            brand: "Suzuki",
            modelName: "Alto",
            modelYear: 2022,
            registrationNumber: "RANDOM-123",
            color: "Silver",
            transmission: "manual",
            specs: [],
            rate12h: 3500,
            allowedService: "both",
            photos: []
        })
    });
    const data4 = await res4.json();
    console.log("Status:", res4.status);
    console.log("Result:", data4);
    if (res4.status !== 404) {
        throw new Error("Missing partner check failed!");
    }
    console.log("✓ Non-existent partner rejected with 404 Not Found.");

    // Test 5: Check database directly
    console.log("\n5. Checking records directly in PostgreSQL 'manzil_e_amaan'...");
    const client = new Client({
        connectionString: "postgresql://postgres:admin123@localhost:5432/manzil_e_amaan"
    });
    await client.connect();
    const dbRes = await client.query("SELECT COUNT(*) as total_vehicles FROM partner_vehicles WHERE partner_id = $1", [partnerId]);
    console.log("Total vehicles in DB for test partner:", dbRes.rows[0].total_vehicles);
    await client.end();

    console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(err => {
    console.error("Verification error:", err);
    process.exit(1);
});

// scripts/test-api.js
async function test() {
    // Unique registration number using timestamp to avoid 409 conflict on multiple runs
    const regNum = `ISB-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
        partnerId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        brand: "Toyota",
        modelName: "Corolla Altis Grande",
        modelYear: 2022,
        registrationNumber: regNum,
        color: "White",
        transmission: "automatic",
        specs: ["Air Conditioning (Chilled AC)", "Reverse Camera"],
        rate12h: 7500,
        allowedService: "both",
        photos: []
    };

    console.log("Testing POST /api/partners/vehicles with registration:", regNum);
    try {
        const res = await fetch("http://localhost:3000/api/partners/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const status = res.status;
        const json = await res.json();
        console.log("Response Status:", status);
        console.log("Response Body:", JSON.stringify(json, null, 2));
        if (status === 201) {
            console.log("✓ SUCCESS: Vehicle successfully created with 201 status!");
        } else {
            console.error("✗ Failed with status:", status);
        }
    } catch (err) {
        console.error("Fetch error:", err.message);
    }
}

test();

// scripts/provision.js
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("=== Step 1: Testing connection to PostgreSQL server ===");
    const rootClient = new Client({
        connectionString: "postgresql://postgres:admin123@localhost:5432/postgres",
    });

    try {
        await rootClient.connect();
        console.log("✓ Successfully connected to PostgreSQL server on localhost:5432.");
    } catch (err) {
        console.error("✗ Failed to connect to PostgreSQL:", err.message);
        process.exit(1);
    }

    console.log("\n=== Step 2: Checking database 'manzil_e_amaan' ===");
    try {
        const checkDb = await rootClient.query(
            "SELECT 1 FROM pg_database WHERE datname = 'manzil_e_amaan'"
        );
        if (checkDb.rowCount === 0) {
            console.log("Database 'manzil_e_amaan' does not exist. Creating now...");
            await rootClient.query("CREATE DATABASE manzil_e_amaan");
            console.log("✓ Database 'manzil_e_amaan' created successfully.");
        } else {
            console.log("✓ Database 'manzil_e_amaan' already exists.");
        }
    } catch (err) {
        console.error("✗ Error checking/creating database:", err.message);
        await rootClient.end();
        process.exit(1);
    } finally {
        await rootClient.end();
    }

    console.log("\n=== Step 3: Connecting to 'manzil_e_amaan' & Executing schema ===");
    const dbClient = new Client({
        connectionString: "postgresql://postgres:admin123@localhost:5432/manzil_e_amaan",
    });

    try {
        await dbClient.connect();
        console.log("✓ Connected to 'manzil_e_amaan' database.");

        // 1. Ensure enums exist safely using a DO block
        const enumInitSql = `
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_type_enum') THEN
                CREATE TYPE partner_type_enum AS ENUM ('showroom_owner', 'private_owner');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_status_enum') THEN
                CREATE TYPE partner_status_enum AS ENUM ('active', 'suspended', 'pending_verification');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_tier_enum') THEN
                CREATE TYPE vehicle_tier_enum AS ENUM ('standard', 'luxury');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_allowed_service_enum') THEN
                CREATE TYPE vehicle_allowed_service_enum AS ENUM ('with_driver_only', 'both');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_approval_status_enum') THEN
                CREATE TYPE vehicle_approval_status_enum AS ENUM ('pending_approval', 'approved', 'rejected');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transmission_enum') THEN
                CREATE TYPE transmission_enum AS ENUM ('automatic', 'manual');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'travel_scope_enum') THEN
                CREATE TYPE travel_scope_enum AS ENUM ('twin_cities', 'outstation');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status_enum') THEN
                CREATE TYPE deal_status_enum AS ENUM ('pending_quote', 'locked', 'expired', 'cancelled');
            END IF;
        END $$;
        `;
        await dbClient.query(enumInitSql);
        console.log("✓ Enums verified / initialized.");

        // 2. Read database/schema.sql, but strip out the initial CREATE TYPE statements since they were handled safely
        const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
        let schemaSql = fs.readFileSync(schemaPath, "utf-8");

        // Remove CREATE TYPE lines from schemaSql to avoid duplicate_object errors
        schemaSql = schemaSql.replace(/CREATE TYPE [^;]+;/gi, "-- [type handled]");

        await dbClient.query(schemaSql);
        console.log("✓ Full database schema, tables, triggers, and indexes applied successfully.");

        // Check tables
        const tableCheck = await dbClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('partners', 'partner_vehicles', 'booking_deals');
        `);
        console.log("Verified tables present:", tableCheck.rows.map(r => r.table_name).join(", "));

        // Check function & trigger
        const procCheck = await dbClient.query(`
            SELECT proname FROM pg_proc WHERE proname = 'enforce_private_owner_vehicle_limit';
        `);
        console.log("Function 'enforce_private_owner_vehicle_limit' exists:", procCheck.rowCount > 0);

        const trigCheck = await dbClient.query(`
            SELECT tgname FROM pg_trigger WHERE tgname = 'trg_enforce_private_limit';
        `);
        console.log("Trigger 'trg_enforce_private_limit' exists:", trigCheck.rowCount > 0);

        // Step 4: Seed Initial Test Partner
        console.log("\n=== Step 4: Seeding / Verifying Initial Test Partner ===");
        const testPartnerId = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
        
        const partnerCheck = await dbClient.query(
            "SELECT id, contact_name, status, partner_type FROM partners WHERE id = $1",
            [testPartnerId]
        );

        if (partnerCheck.rowCount === 0) {
            console.log(`Inserting test partner ${testPartnerId}...`);
            await dbClient.query(`
                INSERT INTO partners (
                    id, partner_type, business_name, contact_name, 
                    phone_number, whatsapp_number, cnic_number, 
                    city, address, status
                ) VALUES (
                    $1, 'showroom_owner', 'Twin Cities Premium Motors', 'Huzaifa Partner',
                    '+923001234567', '+923001234567', '3740512345671',
                    'Islamabad', 'Blue Area, Islamabad', 'active'
                )
            `, [testPartnerId]);
            console.log("✓ Test partner inserted successfully with status 'active'.");
        } else {
            console.log(`✓ Test partner ${testPartnerId} already exists with status '${partnerCheck.rows[0].status}'.`);
            if (partnerCheck.rows[0].status !== "active") {
                await dbClient.query("UPDATE partners SET status = 'active' WHERE id = $1", [testPartnerId]);
                console.log("✓ Updated partner status to 'active'.");
            }
        }

    } catch (err) {
        console.error("✗ Database provisioning error:", err);
        process.exit(1);
    } finally {
        await dbClient.end();
    }

    console.log("\n=== Database Provisioning Complete ===");
}

main();

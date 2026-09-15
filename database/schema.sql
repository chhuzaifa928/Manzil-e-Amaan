-- database/schema.sql
-- =========================================================================
-- MANZIL-E-AMAAN: Core Database Schema
-- Architecture: Multi-tier car rental facilitation platform (Twin Cities)
-- =========================================================================

-- 1. ENUM DEFINITIONS
CREATE TYPE partner_type_enum AS ENUM ('showroom_owner', 'private_owner');
CREATE TYPE partner_status_enum AS ENUM ('active', 'suspended', 'pending_verification');
CREATE TYPE vehicle_tier_enum AS ENUM ('standard', 'luxury');
CREATE TYPE vehicle_allowed_service_enum AS ENUM ('with_driver_only', 'both');
CREATE TYPE vehicle_approval_status_enum AS ENUM ('pending_approval', 'approved', 'rejected');
CREATE TYPE transmission_enum AS ENUM ('automatic', 'manual');
CREATE TYPE travel_scope_enum AS ENUM ('twin_cities', 'outstation');
CREATE TYPE deal_status_enum AS ENUM ('pending_quote', 'locked', 'expired', 'cancelled');

-- 2. PARTNERS TABLE
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_type partner_type_enum NOT NULL,
    business_name VARCHAR(150),
    contact_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    whatsapp_number VARCHAR(20) NOT NULL UNIQUE,
    cnic_number VARCHAR(15) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL DEFAULT 'Islamabad',
    address TEXT,
    status partner_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VEHICLE INVENTORY TABLE
CREATE TABLE IF NOT EXISTS partner_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    brand VARCHAR(50) NOT NULL,
    model_name VARCHAR(80) NOT NULL,
    model_year INT NOT NULL CHECK (model_year BETWEEN 2005 AND 2030),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(30) NOT NULL,
    transmission transmission_enum NOT NULL DEFAULT 'automatic',
    specs TEXT[] DEFAULT '{}',
    rate_12h NUMERIC(10, 2) NOT NULL CHECK (rate_12h > 0),
    allowed_service vehicle_allowed_service_enum NOT NULL DEFAULT 'both',
    tier vehicle_tier_enum NOT NULL DEFAULT 'standard',
    approval_status vehicle_approval_status_enum NOT NULL DEFAULT 'approved',
    has_sunroof BOOLEAN DEFAULT FALSE,
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HARD CONSTRAINT TRIGGER: 1-Car Limit & Luxury Approval
CREATE OR REPLACE FUNCTION enforce_private_owner_vehicle_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_partner_type partner_type_enum;
    v_current_count INT;
BEGIN
    SELECT partner_type INTO v_partner_type 
    FROM partners 
    WHERE id = NEW.partner_id;

    -- Enforce strict 1-car rule for private hosts
    IF v_partner_type = 'private_owner' THEN
        SELECT COUNT(*) INTO v_current_count 
        FROM partner_vehicles 
        WHERE partner_id = NEW.partner_id AND is_active = TRUE;

        IF v_current_count >= 1 THEN
            RAISE EXCEPTION 'Constraint Violation: Private owners are strictly restricted to 1 active vehicle.';
        END IF;
    END IF;

    -- Automatically route luxury tier to pending admin review
    IF NEW.tier = 'luxury' THEN
        NEW.approval_status := 'pending_approval';
        NEW.is_active := FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_private_limit ON partner_vehicles;
CREATE TRIGGER trg_enforce_private_limit
BEFORE INSERT ON partner_vehicles
FOR EACH ROW
EXECUTE FUNCTION enforce_private_owner_vehicle_limit();

-- 5. BOOKING DEALS TABLE
CREATE TABLE IF NOT EXISTS booking_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_code VARCHAR(12) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    vehicle_category VARCHAR(100) NOT NULL,
    customer_budget NUMERIC(10, 2) NOT NULL,
    service_type VARCHAR(20) NOT NULL,
    travel_scope travel_scope_enum NOT NULL DEFAULT 'twin_cities',
    destination VARCHAR(100),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    shift_hours INT NOT NULL DEFAULT 12,
    fuel_policy VARCHAR(50) NOT NULL DEFAULT 'Excluded',
    status deal_status_enum NOT NULL DEFAULT 'pending_quote',
    matched_partner_id UUID REFERENCES partners(id),
    agreed_rate NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_search ON partner_vehicles (brand, model_name, is_active, approval_status);
CREATE INDEX IF NOT EXISTS idx_deals_status ON booking_deals (status, created_at);
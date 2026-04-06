-- ENUMS for strict process control
CREATE TYPE way_type AS ENUM ('PICKUP', 'DELIVERY', 'RETURN', 'IN_OUT');
CREATE TYPE way_status AS ENUM (
  'CREATED', 'TO_ASSIGN', 'ASSIGNED', 'ON_WAY', 'ARRIVED', 
  'PROCESSING', 'SUCCESSFUL', 'FAILED', 'CANCELED', 'RETURNED'
);

-- WAYS / DISPATCH TABLE
CREATE TABLE IF NOT EXISTS way_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    way_id VARCHAR(50) UNIQUE NOT NULL,
    way_type way_type NOT NULL,
    status way_status DEFAULT 'CREATED',
    merchant_id VARCHAR(50),
    merchant_name VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    township VARCHAR(100),
    address TEXT,
    cod_amount NUMERIC(12,2) DEFAULT 0,
    transportation_cost NUMERIC(12,2) DEFAULT 0,
    prepaid VARCHAR(10) DEFAULT 'No',
    cash_advance NUMERIC(12,2) DEFAULT 0,
    total_ways INT DEFAULT 1,
    delivered_count INT DEFAULT 0,
    pickup_date DATE,
    deliver_date DATE,
    pickup_by VARCHAR(100),
    deliver_by VARCHAR(100),
    created_by VARCHAR(100),
    failed_reason TEXT,
    retry_count INT DEFAULT 0,
    zone VARCHAR(100),
    branch VARCHAR(100) DEFAULT 'Head Office',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIDER COMPLIANCE
CREATE TABLE IF NOT EXISTS rider_compliance (
    rider_id UUID PRIMARY KEY,
    kyc_verified BOOLEAN DEFAULT FALSE,
    vehicle_docs_valid BOOLEAN DEFAULT FALSE,
    training_completed BOOLEAN DEFAULT FALSE,
    background_check VARCHAR(50) DEFAULT 'PENDING',
    current_status VARCHAR(50) DEFAULT 'OFFLINE',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DATA ENTRY QUEUE & RECORDS
CREATE TABLE IF NOT EXISTS data_entry_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255),
    quantity INT DEFAULT 1,
    weight_kg NUMERIC(10,2) DEFAULT 0,
    remark TEXT,
    entry_status VARCHAR(50) DEFAULT 'pending',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) NOT NULL,
    uploaded_by_role VARCHAR(50),
    uploaded_by_name VARCHAR(100),
    image_url TEXT,
    image_kind VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

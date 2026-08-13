const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isCloud = process.env.PGSSL === 'true' || 
                (process.env.PGHOST && process.env.PGHOST.includes('supabase')) ||
                (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));

const sslConfig = isCloud ? { rejectUnauthorized: false } : false;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'postgres',
      port: parseInt(process.env.PGPORT || '5432', 10),
      ssl: sslConfig,
    };

const pool = new Pool(poolConfig);

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`✅ PostgreSQL Connected to database via ${process.env.DATABASE_URL ? 'DATABASE_URL' : process.env.PGHOST}`);
    client.release();
    await initDb();
  } catch (err) {
    console.error(`❌ Error connecting to PostgreSQL: ${err.message}`);
  }
};

const initDb = async () => {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      is_subscribed BOOLEAN DEFAULT false,
      subscription_plan VARCHAR(20) DEFAULT 'none',
      subscription_expiry TIMESTAMP,
      street VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      zip_code VARCHAR(20),
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS salts (
      id SERIAL PRIMARY KEY,
      salt_name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      medical_uses TEXT[],
      common_side_effects TEXT[],
      precautions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id SERIAL PRIMARY KEY,
      medicine_id VARCHAR(100) UNIQUE NOT NULL,
      brand_name VARCHAR(255) NOT NULL,
      generic_name VARCHAR(255) NOT NULL,
      salt_id INTEGER REFERENCES salts(id) ON DELETE CASCADE,
      category VARCHAR(100) NOT NULL,
      dosage_form VARCHAR(100) NOT NULL,
      strength VARCHAR(100) NOT NULL,
      manufacturer VARCHAR(255) NOT NULL,
      schedule_type VARCHAR(20) DEFAULT 'OTC',
      requires_prescription BOOLEAN DEFAULT false,
      cold_chain_required BOOLEAN DEFAULT false,
      pack_size VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      stock BOOLEAN DEFAULT true,
      inventory_count INTEGER DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      rider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      payment_method VARCHAR(50) DEFAULT 'Razorpay',
      payment_result JSONB,
      items_price NUMERIC(10, 2) DEFAULT 0.00,
      tax_price NUMERIC(10, 2) DEFAULT 0.00,
      platform_fee NUMERIC(10, 2) DEFAULT 0.00,
      delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
      cold_chain_fee NUMERIC(10, 2) DEFAULT 0.00,
      emergency_fee NUMERIC(10, 2) DEFAULT 0.00,
      late_night_fee NUMERIC(10, 2) DEFAULT 0.00,
      total_price NUMERIC(10, 2) DEFAULT 0.00,
      is_paid BOOLEAN DEFAULT false,
      paid_at TIMESTAMP,
      is_delivered BOOLEAN DEFAULT false,
      delivered_at TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending',
      shipping_address JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      qty INTEGER NOT NULL,
      image VARCHAR(550),
      price NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pharmacies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      license_number VARCHAR(255) UNIQUE NOT NULL,
      street VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      zip_code VARCHAR(20),
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      document_url TEXT NOT NULL,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'PENDING',
      reviewer_notes TEXT DEFAULT 'Pending Pharmacist Review',
      pharmacist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      verified_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS riders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      vehicle_make VARCHAR(100),
      vehicle_model VARCHAR(100),
      vehicle_reg_number VARCHAR(100),
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      is_available BOOLEAN DEFAULT false,
      status VARCHAR(50) DEFAULT 'OFFLINE',
      active_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      rating NUMERIC(3, 2) DEFAULT 5.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      frequency VARCHAR(50) NOT NULL,
      next_delivery_date TIMESTAMP NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      delivery_address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscription_items (
      id SERIAL PRIMARY KEY,
      subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
      medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
      quantity INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS support_requests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id SERIAL PRIMARY KEY,
      account_owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      name VARCHAR(255) NOT NULL,
      relation VARCHAR(50) NOT NULL DEFAULT 'Self',
      dob VARCHAR(50),
      blood_group VARCHAR(10) DEFAULT 'A+',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS family_member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS family_member_id INTEGER REFERENCES family_members(id) ON DELETE SET NULL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE SET NULL;

    ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS alt_phone VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_doctor VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
  `;
  try {
    await pool.query(schemaSql);
    console.log('✅ PostgreSQL Schema & Tables initialized successfully on Supabase');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL tables:', err.message);
  }
};

module.exports = {
  pool,
  connectDB,
  query: (text, params) => pool.query(text, params),
};

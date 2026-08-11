const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createDatabaseIfNotExists = require('./initDatabase');
const { pool, connectDB, query } = require('../config/db');

const CSV_PATH = path.join(__dirname, '..', 'data', 'medicines.csv');

const seedMedicines = async () => {
  try {
    // Step 1: Ensure database exists
    await createDatabaseIfNotExists();

    // Step 2: Initialize PostgreSQL connection & tables
    await connectDB();

    const medicines = [];

    // Step 3: Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => medicines.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 Parsed ${medicines.length} medicines from CSV`);

    let seededCount = 0;

    for (const med of medicines) {
      const saltName = med.saltComposition || med.genericName;

      // Upsert Salt
      const saltResult = await query(
        `INSERT INTO salts (salt_name) 
         VALUES ($1) 
         ON CONFLICT (salt_name) DO UPDATE SET salt_name = EXCLUDED.salt_name 
         RETURNING id`,
        [saltName]
      );
      const saltId = saltResult.rows[0].id;

      // Upsert Medicine
      await query(
        `INSERT INTO medicines (
          medicine_id, brand_name, generic_name, salt_id, category, dosage_form, 
          strength, manufacturer, schedule_type, requires_prescription, cold_chain_required, 
          pack_size, price, stock, inventory_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, 50)
        ON CONFLICT (medicine_id) DO UPDATE SET 
          brand_name = EXCLUDED.brand_name,
          generic_name = EXCLUDED.generic_name,
          salt_id = EXCLUDED.salt_id,
          category = EXCLUDED.category,
          dosage_form = EXCLUDED.dosage_form,
          strength = EXCLUDED.strength,
          manufacturer = EXCLUDED.manufacturer,
          schedule_type = EXCLUDED.schedule_type,
          requires_prescription = EXCLUDED.requires_prescription,
          cold_chain_required = EXCLUDED.cold_chain_required,
          pack_size = EXCLUDED.pack_size,
          price = EXCLUDED.price`,
        [
          med.medicineId,
          med.brandName,
          med.genericName,
          saltId,
          med.category,
          med.dosageForm,
          med.strength,
          med.manufacturer,
          med.scheduleType || 'OTC',
          med.requiresPrescription === 'true',
          med.coldChainRequired === 'true',
          med.packSize,
          parseFloat(med.price) || 99.00
        ]
      );
      seededCount++;
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ PostgreSQL Seeding complete!`);
    console.log(`   📦 Seeded: ${seededCount} medicines into PostgreSQL`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedMedicines();

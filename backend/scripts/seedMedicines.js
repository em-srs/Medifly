const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createDatabaseIfNotExists = require('./initDatabase');
const { pool, connectDB } = require('../config/db');

const ORIGINAL_CSV_PATH = path.join(__dirname, '..', 'data', 'meds_dB_original.csv');
const SMALL_CSV_PATH = path.join(__dirname, '..', 'data', 'medicines.csv');

const processBatch = async (client, rows) => {
  try {
    await client.query('BEGIN');

    for (const med of rows) {
      const medId = med.id ? `MED-${med.id}` : (med.medicineId || `MED-${Math.random().toString(36).substr(2, 9)}`);
      const brandName = med.name || med.brandName;
      const comp1 = med.short_composition1 ? med.short_composition1.trim() : '';
      const comp2 = med.short_composition2 ? med.short_composition2.trim() : '';
      const genericName = med.genericName || [comp1, comp2].filter(Boolean).join(' + ') || brandName;
      const saltName = med.saltComposition || genericName || 'General Salt';

      const price = parseFloat(med['price(₹)'] || med.price) || 99.00;
      const manufacturer = med.manufacturer_name || med.manufacturer || 'General Pharma';
      const packSize = med.pack_size_label || med.packSize || '1 strip';
      const category = med.type || med.category || 'allopathy';
      const dosageForm = med.dosageForm || 'Tablet';
      const strength = med.strength || 'Standard';

      // 1. Upsert Salt
      const saltResult = await client.query(
        `INSERT INTO salts (salt_name) 
         VALUES ($1) 
         ON CONFLICT (salt_name) DO UPDATE SET salt_name = EXCLUDED.salt_name 
         RETURNING id`,
        [saltName]
      );
      const saltId = saltResult.rows[0].id;

      // 2. Upsert Medicine
      await client.query(
        `INSERT INTO medicines (
          medicine_id, brand_name, generic_name, salt_id, category, dosage_form, 
          strength, manufacturer, schedule_type, requires_prescription, cold_chain_required, 
          pack_size, price, stock, inventory_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OTC', false, false, $9, $10, true, 50)
        ON CONFLICT (medicine_id) DO UPDATE SET 
          brand_name = EXCLUDED.brand_name,
          generic_name = EXCLUDED.generic_name,
          salt_id = EXCLUDED.salt_id,
          category = EXCLUDED.category,
          manufacturer = EXCLUDED.manufacturer,
          pack_size = EXCLUDED.pack_size,
          price = EXCLUDED.price`,
        [medId, brandName, genericName, saltId, category, dosageForm, strength, manufacturer, packSize, price]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
};

const seedMedicines = async () => {
  try {
    await createDatabaseIfNotExists();
    await connectDB();

    const targetCsv = fs.existsSync(ORIGINAL_CSV_PATH) ? ORIGINAL_CSV_PATH : SMALL_CSV_PATH;
    console.log(`📄 Seeding full original dataset from: ${path.basename(targetCsv)}`);

    const client = await pool.connect();

    let totalRows = 0;
    let batch = [];
    const BATCH_SIZE = 500;

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(targetCsv).pipe(csv());

      stream.on('data', async (row) => {
        batch.push(row);
        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          try {
            await processBatch(client, batch);
            totalRows += batch.length;
            if (totalRows % 2500 === 0) {
              console.log(`   ⚡ Seeded ${totalRows} medicines into Supabase...`);
            }
            batch = [];
            stream.resume();
          } catch (err) {
            stream.destroy(err);
          }
        }
      });

      stream.on('end', async () => {
        if (batch.length > 0) {
          await processBatch(client, batch);
          totalRows += batch.length;
        }
        resolve();
      });

      stream.on('error', reject);
    });

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Complete Original Database Seeding!`);
    console.log(`   📦 Total Seeded: ${totalRows} medicines into PostgreSQL`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedMedicines();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createDatabaseIfNotExists = require('./initDatabase');
const { pool, connectDB } = require('../config/db');

const ORIGINAL_CSV_PATH = path.join(__dirname, '..', 'data', 'meds_dB_original.csv');
const SMALL_CSV_PATH = path.join(__dirname, '..', 'data', 'medicines.csv');

const processBulkBatch = async (client, rows) => {
  if (rows.length === 0) return;

  try {
    await client.query('BEGIN');

    const preparedRows = rows.map((med, index) => {
      const medId = med.id ? `MED-${med.id}` : (med.medicineId || `MED-${index}-${Date.now()}`);
      const brandName = med.name || med.brandName || 'Medicine';
      const comp1 = med.short_composition1 ? med.short_composition1.trim() : '';
      const comp2 = med.short_composition2 ? med.short_composition2.trim() : '';
      const genericName = med.genericName || [comp1, comp2].filter(Boolean).join(' + ') || brandName;
      const saltName = med.saltComposition || genericName || 'General Salt';
      const price = parseFloat(med['price(₹)'] || med.price) || 99.00;
      const manufacturer = med.manufacturer_name || med.manufacturer || 'General Pharma';
      const packSize = med.pack_size_label || med.packSize || '1 strip';
      const category = med.type || med.category || 'allopathy';

      return { medId, brandName, genericName, saltName, price, manufacturer, packSize, category };
    });

    const uniqueSalts = Array.from(new Set(preparedRows.map(r => r.saltName)));

    // 1. Bulk Upsert Salts
    await client.query(
      `INSERT INTO salts (salt_name) 
       SELECT UNNEST($1::text[]) 
       ON CONFLICT (salt_name) DO UPDATE SET salt_name = EXCLUDED.salt_name`,
      [uniqueSalts]
    );

    // 2. Fetch Salt IDs
    const saltRes = await client.query('SELECT id, salt_name FROM salts WHERE salt_name = ANY($1)', [uniqueSalts]);
    const saltMap = new Map();
    saltRes.rows.forEach(s => saltMap.set(s.salt_name, s.id));

    // 3. Bulk Insert Medicines
    const valueClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const r of preparedRows) {
      const saltId = saltMap.get(r.saltName) || null;
      valueClauses.push(
        `($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, 'Tablet', 'Standard', $${paramIndex+5}, 'OTC', false, false, $${paramIndex+6}, $${paramIndex+7}, true, 50)`
      );
      values.push(r.medId, r.brandName, r.genericName, saltId, r.category, r.manufacturer, r.packSize, r.price);
      paramIndex += 8;
    }

    const insertSql = `
      INSERT INTO medicines (
        medicine_id, brand_name, generic_name, salt_id, category, dosage_form, 
        strength, manufacturer, schedule_type, requires_prescription, cold_chain_required, 
        pack_size, price, stock, inventory_count
      ) VALUES ${valueClauses.join(', ')}
      ON CONFLICT (medicine_id) DO UPDATE SET 
        brand_name = EXCLUDED.brand_name,
        generic_name = EXCLUDED.generic_name,
        salt_id = EXCLUDED.salt_id,
        category = EXCLUDED.category,
        manufacturer = EXCLUDED.manufacturer,
        pack_size = EXCLUDED.pack_size,
        price = EXCLUDED.price
    `;

    await client.query(insertSql, values);
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
    console.log(`🚀 Ultra-Fast Bulk Seeding from: ${path.basename(targetCsv)}`);

    const client = await pool.connect();

    let totalRows = 0;
    let batch = [];
    const BATCH_SIZE = 1000;

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(targetCsv).pipe(csv());

      stream.on('data', async (row) => {
        batch.push(row);
        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          try {
            await processBulkBatch(client, batch);
            totalRows += batch.length;
            console.log(`   ⚡ Seeded ${totalRows} / 253,975 medicines into Supabase...`);
            batch = [];
            stream.resume();
          } catch (err) {
            stream.destroy(err);
          }
        }
      });

      stream.on('end', async () => {
        if (batch.length > 0) {
          await processBulkBatch(client, batch);
          totalRows += batch.length;
        }
        resolve();
      });

      stream.on('error', reject);
    });

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Complete Ultra-Fast Database Seeding Finished!`);
    console.log(`   📦 Total Seeded: ${totalRows} medicines into Supabase PostgreSQL`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedMedicines();

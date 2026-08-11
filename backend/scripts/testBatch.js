const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { pool, connectDB } = require('../config/db');
const ORIGINAL_CSV_PATH = path.join(__dirname, '..', 'data', 'meds_dB_original.csv');

const testRun = async () => {
  try {
    await connectDB();
    const client = await pool.connect();

    console.log('Testing 1,000 fast multi-query batch insert...');

    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(ORIGINAL_CSV_PATH)
        .pipe(csv())
        .on('data', (data) => {
          if (rows.length < 1000) rows.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const startTime = Date.now();
    await client.query('BEGIN');

    const preparedRows = rows.map((med, index) => {
      const medId = med.id ? `MED-${med.id}` : `MED-${index}-${Date.now()}`;
      const brandName = med.name || 'Medicine';
      const comp1 = med.short_composition1 ? med.short_composition1.trim() : '';
      const comp2 = med.short_composition2 ? med.short_composition2.trim() : '';
      const genericName = [comp1, comp2].filter(Boolean).join(' + ') || brandName;
      const saltName = genericName || 'General Salt';
      const price = parseFloat(med['price(₹)']) || 99.00;
      const manufacturer = med.manufacturer_name || 'General Pharma';
      const packSize = med.pack_size_label || '1 strip';
      const category = med.type || 'allopathy';

      return { medId, brandName, genericName, saltName, price, manufacturer, packSize, category };
    });

    const uniqueSalts = Array.from(new Set(preparedRows.map(r => r.saltName)));

    await client.query(
      `INSERT INTO salts (salt_name) 
       SELECT UNNEST($1::text[]) 
       ON CONFLICT (salt_name) DO UPDATE SET salt_name = EXCLUDED.salt_name`,
      [uniqueSalts]
    );

    const saltRes = await client.query('SELECT id, salt_name FROM salts WHERE salt_name = ANY($1)', [uniqueSalts]);
    const saltMap = new Map();
    saltRes.rows.forEach(s => saltMap.set(s.salt_name, s.id));

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

    const duration = Date.now() - startTime;
    console.log(`✅ 1,000 ROWS INSERTED IN ${duration}ms!`);

    const countRes = await client.query('SELECT COUNT(*) FROM medicines');
    console.log('Total Medicines in DB:', countRes.rows[0].count);

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ TEST BATCH ERROR:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

testRun();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Medicine = require('../models/Medicine');
const Salt = require('../models/Salt');

const CSV_PATH = path.join(__dirname, '..', 'data', 'medicines.csv');

const seedMedicines = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const medicines = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => medicines.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 Parsed ${medicines.length} medicines from CSV`);

    let created = 0;
    let updated = 0;

    for (const med of medicines) {
      // Find or create the Salt entry using the saltComposition column
      const saltName = med.saltComposition || med.genericName;
      let salt = await Salt.findOne({ saltName });
      if (!salt) {
        salt = await Salt.create({ saltName });
        console.log(`  🧂 Created salt: ${saltName}`);
      }

      // Upsert medicine (insert if new, update if exists)
      const result = await Medicine.findOneAndUpdate(
        { medicineId: med.medicineId },
        {
          medicineId: med.medicineId,
          brandName: med.brandName,
          genericName: med.genericName,
          saltComposition: salt._id,
          category: med.category,
          dosageForm: med.dosageForm,
          strength: med.strength,
          manufacturer: med.manufacturer,
          scheduleType: med.scheduleType || 'OTC',
          requiresPrescription: med.requiresPrescription === 'true',
          coldChainRequired: med.coldChainRequired === 'true',
          packSize: med.packSize,
          price: parseFloat(med.price),
          stock: true,
          inventoryCount: 50,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Check if it was an insert or update
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Seeding complete!`);
    console.log(`   📦 Created: ${created} medicines`);
    console.log(`   🔄 Updated: ${updated} medicines`);
    console.log(`   📊 Total:   ${medicines.length} medicines`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedMedicines();

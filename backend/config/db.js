const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host} | DB Name: ${conn.connection.name}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    try {
      console.log('🔄 Attempting in-memory MongoDB fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected successfully at ${uri}`);

      // Auto-seed medicines from CSV if memory DB is clean
      const Medicine = require('../models/Medicine');
      const count = await Medicine.countDocuments();
      if (count === 0) {
        console.log('🌱 Auto-seeding initial medicine data into In-Memory database...');
        const fs = require('fs');
        const path = require('path');
        const csv = require('csv-parser');
        const Salt = require('../models/Salt');
        const CSV_PATH = path.join(__dirname, '..', 'data', 'medicines.csv');
        if (fs.existsSync(CSV_PATH)) {
          const medicines = [];
          await new Promise((resolve, reject) => {
            fs.createReadStream(CSV_PATH)
              .pipe(csv())
              .on('data', (row) => medicines.push(row))
              .on('end', resolve)
              .on('error', reject);
          });
          for (const med of medicines) {
            const saltName = med.saltComposition || med.genericName;
            let salt = await Salt.findOne({ saltName });
            if (!salt) {
              salt = await Salt.create({ saltName });
            }
            await Medicine.create({
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
              price: parseFloat(med.price) || 99,
              stock: true,
              inventoryCount: 50,
            });
          }
          console.log(`✅ Auto-seeded ${medicines.length} medicines into In-Memory Database!`);
        }
      }
    } catch (fallbackErr) {
      console.warn('⚠️ In-Memory fallback failed or unavailable:', fallbackErr.message);
      console.warn('Server will continue running without database connection.');
    }
  }
};

module.exports = connectDB;


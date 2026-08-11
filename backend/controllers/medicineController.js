const { query } = require('../config/db');

// Helper to format PostgreSQL row to frontend-expected camelCase shape
const formatMedicine = (row) => ({
  _id: row.id,
  id: row.id,
  medicineId: row.medicine_id,
  brandName: row.brand_name,
  genericName: row.generic_name,
  saltComposition: row.salt_name ? { _id: row.salt_id, saltName: row.salt_name } : row.salt_id,
  saltId: row.salt_id,
  category: row.category,
  dosageForm: row.dosage_form,
  strength: row.strength,
  manufacturer: row.manufacturer,
  scheduleType: row.schedule_type,
  requiresPrescription: row.requires_prescription,
  coldChainRequired: row.cold_chain_required,
  packSize: row.pack_size,
  price: parseFloat(row.price),
  stock: row.stock,
  inventoryCount: row.inventory_count,
  createdAt: row.created_at
});

// @desc    Get all medicines (with pagination & search support)
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
  try {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : null;
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    let countQuery = 'SELECT COUNT(*) FROM medicines';
    let dataQuery = 'SELECT m.*, s.salt_name FROM medicines m LEFT JOIN salts s ON m.salt_id = s.id';
    let params = [];
    let countParams = [];

    if (keyword) {
      countQuery += ' WHERE brand_name ILIKE $1 OR generic_name ILIKE $1';
      dataQuery += ' WHERE m.brand_name ILIKE $1 OR m.generic_name ILIKE $1';
      countParams = [keyword];
      dataQuery += ' ORDER BY m.id LIMIT $2 OFFSET $3';
      params = [keyword, pageSize, offset];
    } else {
      dataQuery += ' ORDER BY m.id LIMIT $1 OFFSET $2';
      params = [pageSize, offset];
    }

    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    const dataResult = await query(dataQuery, params);
    const medicines = dataResult.rows.map(formatMedicine);

    res.json({
      medicines,
      page,
      pages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching medicines', error: error.message });
  }
};

// @desc    Fetch single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicineById = async (req, res) => {
  try {
    const param = req.params.id;
    const isNum = !isNaN(param);

    let sql = 'SELECT m.*, s.salt_name FROM medicines m LEFT JOIN salts s ON m.salt_id = s.id WHERE ';
    let params = [param];

    if (isNum) {
      sql += 'm.id = $1 OR m.medicine_id = $1';
    } else {
      sql += 'm.medicine_id = $1';
    }

    const result = await query(sql, params);

    if (result.rows.length > 0) {
      res.json(formatMedicine(result.rows[0]));
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get alternatives by Salt Name (For Salt Comparison engine)
// @route   GET /api/medicines/alternatives/:saltName
// @access  Public
exports.getAlternatives = async (req, res) => {
  try {
    const saltQuery = `%${req.params.saltName}%`;
    const result = await query(
      `SELECT m.*, s.salt_name 
       FROM medicines m 
       LEFT JOIN salts s ON m.salt_id = s.id 
       WHERE m.generic_name ILIKE $1 OR s.salt_name ILIKE $1 
       ORDER BY m.price ASC`,
      [saltQuery]
    );

    res.json(result.rows.map(formatMedicine));
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching alternatives', error: error.message });
  }
};

// @desc    Compare salts for a specific medicine by its ID
// @route   GET /api/medicines/salt-comparison/:medicineId
// @access  Public
exports.compareSalts = async (req, res) => {
  try {
    const param = req.params.medicineId;
    const isNum = !isNaN(param);

    let sql = 'SELECT m.*, s.salt_name FROM medicines m LEFT JOIN salts s ON m.salt_id = s.id WHERE ';
    let params = [param];

    if (isNum) {
      sql += 'm.id = $1 OR m.medicine_id = $1';
    } else {
      sql += 'm.medicine_id = $1';
    }

    const origResult = await query(sql, params);

    if (origResult.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const originalRow = origResult.rows[0];
    const originalMedicine = formatMedicine(originalRow);

    let altResult;
    if (originalRow.salt_id) {
      altResult = await query(
        `SELECT m.*, s.salt_name 
         FROM medicines m 
         LEFT JOIN salts s ON m.salt_id = s.id 
         WHERE m.salt_id = $1 AND m.id != $2 
         ORDER BY m.price ASC`,
        [originalRow.salt_id, originalRow.id]
      );
    } else {
      altResult = await query(
        `SELECT m.*, s.salt_name 
         FROM medicines m 
         LEFT JOIN salts s ON m.salt_id = s.id 
         WHERE m.generic_name ILIKE $1 AND m.id != $2 
         ORDER BY m.price ASC`,
        [`%${originalRow.generic_name}%`, originalRow.id]
      );
    }

    res.json({
      original_medicine: originalMedicine,
      alternative_medicines: altResult.rows.map(formatMedicine)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during salt comparison', error: error.message });
  }
};

// @desc    Update medicine price (Admin/Pharmacy)
// @route   PUT /api/medicines/:id/price
// @access  Private/Admin
exports.updateMedicinePrice = async (req, res) => {
  try {
    const { price } = req.body;
    const param = req.params.id;

    const result = await query(
      'UPDATE medicines SET price = $1 WHERE id = $2 OR medicine_id = $2 RETURNING *',
      [price, param]
    );

    if (result.rows.length > 0) {
      const updatedMed = formatMedicine(result.rows[0]);

      // Emit real-time price update to all clients
      const { getIo } = require('../socket');
      const io = getIo();
      io.emit('priceChanged', {
        medicineId: updatedMed._id,
        newPrice: updatedMed.price
      });

      res.json(updatedMed);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error during price update', error: error.message });
  }
};

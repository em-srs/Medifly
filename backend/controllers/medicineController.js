const { query } = require('../config/db');

// Helper to format PostgreSQL row to frontend-expected camelCase shape
const formatMedicine = (row) => ({
  _id: row.id,
  id: row.id,
  medicineId: row.medicine_id || `MED-${row.id}`,
  brandName: row.brand_name || row.name || 'Medicine',
  genericName: row.generic_name || row.salt_name || 'Generic Salt Composition',
  saltComposition: row.salt_name ? { _id: row.salt_id, saltName: row.salt_name } : row.salt_id,
  saltId: row.salt_id,
  category: row.category || 'General',
  dosageForm: row.dosage_form || 'Tablet',
  strength: row.strength || '',
  manufacturer: row.manufacturer || 'Licensed Pharmaceutical Partner',
  scheduleType: row.schedule_type || 'OTC',
  requiresPrescription: row.requires_prescription || false,
  coldChainRequired: row.cold_chain_required || false,
  packSize: row.pack_size || '1 Strip',
  price: parseFloat(row.price || 50),
  stock: row.stock !== undefined ? row.stock : 100,
  inventoryCount: row.inventory_count !== undefined ? row.inventory_count : 100,
  createdAt: row.created_at
});

// Cache global un-filtered total count in memory to avoid repeated SELECT COUNT(*) over 250k rows
let cachedTotalCount = 254023;
let lastCountFetch = 0;

const getCachedCount = async () => {
  const now = Date.now();
  if (now - lastCountFetch > 300000) { // Refresh count every 5 minutes
    try {
      const res = await query('SELECT COUNT(*) FROM medicines');
      cachedTotalCount = parseInt(res.rows[0].count, 10);
      lastCountFetch = now;
    } catch (e) {
      console.warn('Failed to refresh total count, using cached:', e.message);
    }
  }
  return cachedTotalCount;
};

// @desc    Get all medicines (with fast indexing, fast count & pagination)
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
  try {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : null;
    const category = req.query.category && req.query.category !== 'all' ? req.query.category : null;
    const sort = req.query.sort || 'name';
    const page = Math.max(1, Number(req.query.pageNumber) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 12));
    const offset = (page - 1) * pageSize;

    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    if (keyword) {
      whereClauses.push(`(m.brand_name ILIKE $${paramIndex} OR m.generic_name ILIKE $${paramIndex} OR m.manufacturer ILIKE $${paramIndex})`);
      params.push(keyword);
      paramIndex++;
    }

    if (category) {
      whereClauses.push(`m.category ILIKE $${paramIndex}`);
      params.push(`%${category}%`);
      paramIndex++;
    }

    const whereString = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    // Fast Total Count Optimization
    let totalCount;
    if (!keyword && !category) {
      totalCount = await getCachedCount();
    } else {
      const countQuery = `SELECT COUNT(*) FROM medicines m${whereString}`;
      const countResult = await query(countQuery, params);
      totalCount = parseInt(countResult.rows[0].count, 10);
    }

    // Fast Sorting Clause
    let orderClause = 'ORDER BY m.id ASC';
    if (sort === 'name') {
      orderClause = 'ORDER BY m.brand_name ASC, m.id ASC';
    } else if (sort === 'price-low') {
      orderClause = 'ORDER BY m.price ASC, m.id ASC';
    } else if (sort === 'price-high') {
      orderClause = 'ORDER BY m.price DESC, m.id ASC';
    }

    // Data Query
    const dataQuery = `
      SELECT m.*, s.salt_name 
      FROM medicines m 
      LEFT JOIN salts s ON m.salt_id = s.id 
      ${whereString} 
      ${orderClause} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, pageSize, offset];
    const dataResult = await query(dataQuery, dataParams);
    const medicines = dataResult.rows.map(formatMedicine);

    res.json({
      medicines,
      page,
      pageSize,
      totalCount,
      pages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
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

// @desc    Get alternatives by Salt Name
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
       ORDER BY m.price ASC LIMIT 20`,
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
         ORDER BY m.price ASC LIMIT 20`,
        [originalRow.salt_id, originalRow.id]
      );
    } else {
      altResult = await query(
        `SELECT m.*, s.salt_name 
         FROM medicines m 
         LEFT JOIN salts s ON m.salt_id = s.id 
         WHERE m.generic_name ILIKE $1 AND m.id != $2 
         ORDER BY m.price ASC LIMIT 20`,
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

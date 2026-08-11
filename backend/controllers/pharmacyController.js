const { query } = require('../config/db');

exports.registerPharmacy = async (req, res) => {
  try {
    const { name, licenseNumber, address } = req.body;

    const result = await query(
      `INSERT INTO pharmacies (user_id, name, license_number, street, city, state, zip_code, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        name,
        licenseNumber,
        address?.street || null,
        address?.city || null,
        address?.state || null,
        address?.zipCode || null,
        address?.location?.lat || null,
        address?.location?.lng || null
      ]
    );

    const row = result.rows[0];
    const pharmacy = {
      _id: row.id,
      id: row.id,
      user: row.user_id,
      name: row.name,
      licenseNumber: row.license_number,
      address: {
        street: row.street,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        location: { lat: row.lat, lng: row.lng }
      },
      status: row.status,
      createdAt: row.created_at
    };

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getPharmacyDashboard = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pharmacies WHERE user_id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const row = result.rows[0];
    const pharmacy = {
      _id: row.id,
      id: row.id,
      user: row.user_id,
      name: row.name,
      licenseNumber: row.license_number,
      address: {
        street: row.street,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        location: { lat: row.lat, lng: row.lng }
      },
      status: row.status,
      createdAt: row.created_at
    };

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

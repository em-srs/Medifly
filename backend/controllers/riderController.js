const { query } = require('../config/db');

const formatRider = (row) => ({
  _id: row.id,
  id: row.id,
  user: row.user_id,
  vehicleDetail: {
    make: row.vehicle_make,
    model: row.vehicle_model,
    registrationNumber: row.vehicle_reg_number
  },
  currentLocation: {
    lat: row.lat,
    lng: row.lng
  },
  isAvailable: row.is_available,
  status: row.status,
  activeOrder: row.active_order_id,
  rating: parseFloat(row.rating || 5.0),
  createdAt: row.created_at
});

exports.registerRider = async (req, res) => {
  try {
    const { vehicleDetail } = req.body;

    const result = await query(
      `INSERT INTO riders (user_id, vehicle_make, vehicle_model, vehicle_reg_number)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        req.user.id,
        vehicleDetail?.make || null,
        vehicleDetail?.model || null,
        vehicleDetail?.registrationNumber || null
      ]
    );

    res.status(201).json(formatRider(result.rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { location } = req.body;

    const result = await query(
      `UPDATE riders 
       SET lat = $1, lng = $2 
       WHERE user_id = $3 
       RETURNING *`,
      [location?.lat, location?.lng, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    const rider = formatRider(result.rows[0]);

    // Broadcast live location if Rider is mapped to an ongoing Order.
    if (rider.activeOrder) {
      const orderResult = await query('SELECT user_id FROM orders WHERE id = $1', [rider.activeOrder]);
      if (orderResult.rows.length > 0) {
        const userId = orderResult.rows[0].user_id;
        const { getIo } = require('../socket');
        const io = getIo();
        io.to(userId.toString()).emit('riderLocationUpdated', {
          lat: rider.currentLocation.lat,
          lng: rider.currentLocation.lng,
          status: rider.status
        });
      }
    }

    res.json(rider);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getRiderDeliveries = async (req, res) => {
  try {
    const riderResult = await query('SELECT * FROM riders WHERE user_id = $1', [req.user.id]);
    const activeOrderId = riderResult.rows[0]?.active_order_id;

    const ordersResult = await query(
      `SELECT o.*, u.name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.rider_name = $1 OR o.id = $2
       ORDER BY o.created_at DESC`,
      [req.user.name, activeOrderId || 0]
    );

    const formatted = ordersResult.rows.map(o => ({
      id: `DEL-${o.id}`,
      orderId: `MF-${o.id}`,
      customer: o.customer_name || 'Customer',
      address: o.shipping_address || 'Registered Address',
      items: ['Prescription Medicines'],
      coldChain: parseFloat(o.cold_chain_fee || 0) > 0,
      status: o.is_delivered ? 'Delivered' : 'In Transit',
      pharmacy: 'MediFly Partner Pharmacy',
      est: '20 min',
      earnings: 50
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


const { pool, query } = require('../config/db');
const PricingService = require('../services/pricingService');
const RiderAssignmentService = require('../services/riderAssignmentService');
const { getIo } = require('../socket');

const formatOrder = (orderRow, itemRows = []) => ({
  _id: orderRow.id,
  id: orderRow.id,
  user: orderRow.user_id,
  userName: orderRow.user_name,
  userEmail: orderRow.user_email,
  orderItems: itemRows.map(item => ({
    _id: item.id,
    id: item.id,
    name: item.name,
    qty: item.qty,
    price: parseFloat(item.price),
    medicine: item.medicine_id
  })),
  shippingAddress: orderRow.shipping_address,
  paymentMethod: orderRow.payment_method,
  paymentResult: orderRow.payment_result,
  itemsPrice: parseFloat(orderRow.items_price),
  taxPrice: parseFloat(orderRow.tax_price),
  platformFee: parseFloat(orderRow.platform_fee),
  deliveryFee: parseFloat(orderRow.delivery_fee),
  coldChainFee: parseFloat(orderRow.cold_chain_fee),
  emergencyFee: parseFloat(orderRow.emergency_fee),
  lateNightFee: parseFloat(orderRow.late_night_fee),
  totalPrice: parseFloat(orderRow.total_price),
  isPaid: orderRow.is_paid,
  paidAt: orderRow.paid_at,
  isDelivered: orderRow.is_delivered,
  deliveredAt: orderRow.delivered_at,
  status: orderRow.status,
  rider: orderRow.rider_id,
  createdAt: orderRow.created_at
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, prescriptionId, isEmergency } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let requiresPrescription = false;
    let validatedItems = [];

    // 1. Lock and validate medicines & check stock
    for (const item of orderItems) {
      const medId = item.medicine || item._id;
      const medResult = await client.query('SELECT * FROM medicines WHERE id = $1 FOR UPDATE', [medId]);

      if (medResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: `Medicine not found for ID: ${medId}` });
      }

      const medicine = medResult.rows[0];

      if (medicine.stock === false || medicine.inventory_count < item.qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for ${medicine.brand_name}` });
      }

      if (medicine.requires_prescription) {
        requiresPrescription = true;
      }

      validatedItems.push({
        medicineId: medicine.id,
        name: item.name || medicine.brand_name,
        qty: item.qty,
        price: parseFloat(medicine.price)
      });
    }

    // 2. Check prescription requirement if applicable
    if (requiresPrescription) {
      if (!prescriptionId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Prescription is required for one or more medicines in your cart' });
      }

      const rxResult = await client.query('SELECT * FROM prescriptions WHERE id = $1', [prescriptionId]);
      if (rxResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Prescription not found' });
      }

      if (rxResult.rows[0].status !== 'VERIFIED') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Prescription must be verified by a pharmacist before ordering' });
      }
    }

    // 3. Calculate pricing
    const pricingItems = validatedItems.map(i => ({ price: i.price, qty: i.qty }));
    const { 
      subtotal, tax, platformFee, deliveryFee, 
      coldChainFee, emergencyFee, lateNightFee, total 
    } = PricingService.calculateTotals(pricingItems, req.user, { isEmergency });

    // 4. Create Order row
    const orderInsertResult = await client.query(
      `INSERT INTO orders (
        user_id, payment_method, shipping_address, items_price, tax_price, 
        platform_fee, delivery_fee, cold_chain_fee, emergency_fee, late_night_fee, 
        total_price, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'verified')
      RETURNING *`,
      [
        req.user.id,
        paymentMethod || 'Razorpay',
        JSON.stringify(shippingAddress),
        subtotal,
        tax,
        platformFee,
        deliveryFee,
        coldChainFee,
        emergencyFee,
        lateNightFee,
        total
      ]
    );

    const savedOrderRow = orderInsertResult.rows[0];

    // 5. Insert Order Items rows
    const insertedItems = [];
    for (const item of validatedItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, medicine_id, name, qty, price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [savedOrderRow.id, item.medicineId, item.name, item.qty, item.price]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    // 6. Assign Rider if available
    const ridersResult = await client.query(
      "SELECT r.*, u.id as user_id FROM riders r JOIN users u ON r.user_id = u.id WHERE r.status = 'ONLINE' AND r.is_available = true LIMIT 1"
    );

    let assignedRiderId = null;
    if (ridersResult.rows.length > 0) {
      const riderRow = ridersResult.rows[0];
      assignedRiderId = riderRow.user_id;

      await client.query('UPDATE orders SET rider_id = $1, status = $2 WHERE id = $3', [
        assignedRiderId,
        'assigned',
        savedOrderRow.id
      ]);

      await client.query(
        "UPDATE riders SET is_available = false, status = 'ON_DELIVERY', active_order_id = $1 WHERE id = $2",
        [savedOrderRow.id, riderRow.id]
      );

      savedOrderRow.rider_id = assignedRiderId;
      savedOrderRow.status = 'assigned';
    }

    // 7. Atomic stock decrementing
    const io = getIo();

    for (const item of validatedItems) {
      const updateResult = await client.query(
        `UPDATE medicines 
         SET inventory_count = inventory_count - $1 
         WHERE id = $2 AND inventory_count >= $1 
         RETURNING *`,
        [item.qty, item.medicineId]
      );

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Stock changed concurrently, please review cart and retry.' });
      }

      const updatedMed = updateResult.rows[0];
      io.emit('inventoryChanged', {
        medicineId: updatedMed.id,
        available: updatedMed.inventory_count > 0,
        count: updatedMed.inventory_count
      });
    }

    await client.query('COMMIT');

    const formattedOrder = formatOrder(savedOrderRow, insertedItems);

    // Broadcast real-time order status update
    io.to(req.user.id.toString()).emit('orderStatusChanged', {
      orderId: formattedOrder._id,
      status: formattedOrder.status,
    });

    res.status(201).json(formattedOrder);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error processing order', error: error.message });
  } finally {
    client.release();
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const orderResult = await query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (orderResult.rows.length > 0) {
      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
      res.json(formatOrder(orderResult.rows[0], itemsResult.rows));
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const paymentResult = JSON.stringify({
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    });

    const result = await query(
      `UPDATE orders 
       SET is_paid = true, paid_at = CURRENT_TIMESTAMP, payment_result = $1 
       WHERE id = $2 
       RETURNING *`,
      [paymentResult, req.params.id]
    );

    if (result.rows.length > 0) {
      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
      res.json(formatOrder(result.rows[0], itemsResult.rows));
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const ordersResult = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const orders = [];
    for (const orderRow of ordersResult.rows) {
      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [orderRow.id]);
      orders.push(formatOrder(orderRow, itemsResult.rows));
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

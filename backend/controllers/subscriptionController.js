const { query, pool } = require('../config/db');

exports.createSubscription = async (req, res) => {
  const client = await pool.connect();
  try {
    const { medicines, frequency, nextDeliveryDate, deliveryAddress } = req.body;

    await client.query('BEGIN');

    const subResult = await client.query(
      `INSERT INTO subscriptions (user_id, frequency, next_delivery_date, delivery_address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, frequency, nextDeliveryDate, deliveryAddress]
    );

    const subRow = subResult.rows[0];
    const items = [];

    if (Array.isArray(medicines)) {
      for (const medItem of medicines) {
        const medId = medItem.medicine || medItem.id;
        const qty = medItem.quantity || 1;

        const itemResult = await client.query(
          `INSERT INTO subscription_items (subscription_id, medicine_id, quantity)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [subRow.id, medId, qty]
        );

        items.push(itemResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    const subscription = {
      _id: subRow.id,
      id: subRow.id,
      user: subRow.user_id,
      frequency: subRow.frequency,
      nextDeliveryDate: subRow.next_delivery_date,
      status: subRow.status,
      deliveryAddress: subRow.delivery_address,
      medicines: items.map(i => ({ medicine: i.medicine_id, quantity: i.quantity })),
      createdAt: subRow.created_at
    };

    // Emit real-time subscription update
    const { getIo } = require('../socket');
    const io = getIo();
    io.to(req.user.id.toString()).emit('subscriptionUpdated', subscription);

    res.status(201).json(subscription);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    client.release();
  }
};

exports.getMySubscriptions = async (req, res) => {
  try {
    const subsResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const subscriptions = [];
    for (const subRow of subsResult.rows) {
      const itemsResult = await query(
        `SELECT si.*, m.id as med_id, m.brand_name, m.generic_name, m.price 
         FROM subscription_items si 
         JOIN medicines m ON si.medicine_id = m.id 
         WHERE si.subscription_id = $1`,
        [subRow.id]
      );

      subscriptions.push({
        _id: subRow.id,
        id: subRow.id,
        user: subRow.user_id,
        frequency: subRow.frequency,
        nextDeliveryDate: subRow.next_delivery_date,
        status: subRow.status,
        deliveryAddress: subRow.delivery_address,
        medicines: itemsResult.rows.map(item => ({
          medicine: {
            _id: item.med_id,
            id: item.med_id,
            brandName: item.brand_name,
            genericName: item.generic_name,
            price: parseFloat(item.price)
          },
          quantity: item.quantity
        })),
        createdAt: subRow.created_at
      });
    }

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subId = req.params.id;

    const result = await query(
      `UPDATE subscriptions SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, subId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.addSubscriptionItem = async (req, res) => {
  try {
    const subId = req.params.id;
    const { medicineId, quantity = 1 } = req.body;

    // Verify ownership
    const subCheck = await query('SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2', [subId, req.user.id]);
    if (subCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const itemResult = await query(
      `INSERT INTO subscription_items (subscription_id, medicine_id, quantity)
       VALUES ($1, $2, $3) RETURNING *`,
      [subId, medicineId, quantity]
    );

    res.status(201).json(itemResult.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.removeSubscriptionItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    // Verify ownership
    const subCheck = await query('SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (subCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await query('DELETE FROM subscription_items WHERE id = $1 AND subscription_id = $2', [itemId, id]);

    res.json({ message: 'Item removed from subscription' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

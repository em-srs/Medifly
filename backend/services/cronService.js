const cron = require('node-cron');
const { query, pool } = require('../config/db');

const startCronJobs = () => {
  // Run everyday at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription & auto-refill check...');

    const client = await pool.connect();

    try {
      // Find active subscriptions where next_delivery_date is today or before today
      const dueResult = await client.query(
        `SELECT s.*, u.id as user_id, u.email as user_email, u.is_subscribed as user_is_subscribed 
         FROM subscriptions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.status = 'ACTIVE' AND s.next_delivery_date <= CURRENT_TIMESTAMP`
      );

      for (const sub of dueResult.rows) {
        await client.query('BEGIN');

        // Fetch subscription items with medicine details
        const itemsResult = await client.query(
          `SELECT si.*, m.id as med_id, m.brand_name, m.price 
           FROM subscription_items si 
           JOIN medicines m ON si.medicine_id = m.id 
           WHERE si.subscription_id = $1`,
          [sub.id]
        );

        const orderItems = itemsResult.rows.map(item => ({
          name: item.brand_name,
          qty: item.quantity,
          price: parseFloat(item.price),
          medicineId: item.med_id
        }));

        const itemsPrice = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const taxPrice = itemsPrice * 0.05;
        const platformFee = 2.0;
        let deliveryFee = sub.user_is_subscribed ? 0 : 50.0;
        const totalPrice = itemsPrice + taxPrice + platformFee + deliveryFee;

        // Insert new order row
        const orderResult = await client.query(
          `INSERT INTO orders (
            user_id, payment_method, shipping_address, items_price, tax_price, 
            platform_fee, delivery_fee, cold_chain_fee, emergency_fee, late_night_fee, 
            total_price, is_paid, paid_at, status
          ) VALUES ($1, 'Auto-Billed', $2, $3, $4, $5, $6, 0, 0, 0, $7, true, CURRENT_TIMESTAMP, 'verified')
          RETURNING id`,
          [
            sub.user_id,
            JSON.stringify({ address: sub.delivery_address, city: 'AutoCity', postalCode: '00000', country: 'DefaultCountry' }),
            itemsPrice,
            taxPrice,
            platformFee,
            deliveryFee,
            totalPrice
          ]
        );

        const newOrderId = orderResult.rows[0].id;

        // Insert order items
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO order_items (order_id, medicine_id, name, qty, price)
             VALUES ($1, $2, $3, $4, $5)`,
            [newOrderId, item.medicineId, item.name, item.qty, item.price]
          );
        }

        // Fast-forward next_delivery_date
        let nextDate = new Date(sub.next_delivery_date);
        if (sub.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
        else if (sub.frequency === 'BIWEEKLY') nextDate.setDate(nextDate.getDate() + 14);
        else if (sub.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);

        await client.query(
          'UPDATE subscriptions SET next_delivery_date = $1 WHERE id = $2',
          [nextDate, sub.id]
        );

        await client.query('COMMIT');
        console.log(`Auto-refill order #${newOrderId} created for user ${sub.user_email}`);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error running daily auto-refill logic:', error);
    } finally {
      client.release();
    }
  });
};

module.exports = startCronJobs;

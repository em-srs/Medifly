const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const User = require('../models/User');

const startCronJobs = () => {
  // Run everyday at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription & auto-refill check...');

    try {
      const today = new Date();
      // Find active subscriptions where nextDeliveryDate is today or before today
      const dueSubscriptions = await Subscription.find({
        status: 'ACTIVE',
        nextDeliveryDate: { $lte: today }
      }).populate('user').populate('medicines.medicine');

      for (const sub of dueSubscriptions) {
        // Step 1: Create auto order
        // Note: Realistically, here we would charge the user's saved card. For this architecture, we skip actual charging.

        // Convert subscription items to order items shape
        const orderItems = sub.medicines.map(m => ({
          name: m.medicine.brandName,
          qty: m.quantity,
          price: m.medicine.price,
          medicine: m.medicine._id
        }));

        const itemsPrice = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        
        // Subscription users get priority and lower platform fees. Flat tax rate.
        const taxPrice = itemsPrice * 0.05;
        const platformFee = 2.0; // Reduced for subscribers
        let deliveryFee = 50.0;
        
        // Premium feature: free shipping regardless of size or highly discounted
        if (sub.user.isSubscribed) {
          deliveryFee = 0; // VIP Free Delivery for Prime members
        }

        const totalPrice = itemsPrice + taxPrice + platformFee + deliveryFee;

        const newOrder = new Order({
          user: sub.user._id,
          orderItems,
          shippingAddress: {
            address: sub.deliveryAddress,
            city: 'AutoCity',
            postalCode: '00000',
            country: 'DefaultCountry'
          },
          paymentMethod: 'Auto-Billed',
          itemsPrice,
          taxPrice,
          platformFee,
          deliveryFee,
          coldChainFee: 0,
          emergencyFee: 0,
          lateNightFee: 0,
          totalPrice,
          isPaid: true, // Assuming auto-charge was successful
          paidAt: Date.now(),
          status: 'verified' // Auto-verified
        });

        await newOrder.save();

        // Step 2: Notify User (placeholder config for pushing notifications)
        console.log(`Auto-refill order ${newOrder._id} created for user ${sub.user.email}`);

        // Step 3: Fast-forward the nextDeliveryDate
        let nextDate = new Date(sub.nextDeliveryDate);
        if (sub.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
        else if (sub.frequency === 'BIWEEKLY') nextDate.setDate(nextDate.getDate() + 14);
        else if (sub.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);

        sub.nextDeliveryDate = nextDate;
        await sub.save();
      }
    } catch (error) {
      console.error('Error running daily auto-refill logic:', error);
    }
  });
};

module.exports = startCronJobs;

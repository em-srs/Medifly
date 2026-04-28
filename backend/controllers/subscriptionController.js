const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  try {
    const sub = await Subscription.create({
      user: req.user._id,
      medicines: req.body.medicines,
      frequency: req.body.frequency,
      nextDeliveryDate: req.body.nextDeliveryDate,
      deliveryAddress: req.body.deliveryAddress
    });

    // Emit real-time subscription update
    const { getIo } = require('../socket');
    const io = getIo();
    io.to(req.user._id.toString()).emit('subscriptionUpdated', sub);

    res.status(201).json(sub);
  } catch(error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id }).populate('medicines.medicine');
    res.json(subs);
  } catch(error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

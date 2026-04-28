const Rider = require('../models/Rider');

exports.registerRider = async (req, res) => {
  try {
    const rider = await Rider.create({
      user: req.user._id,
      vehicleDetail: req.body.vehicleDetail
    });
    res.status(201).json(rider);
  } catch(error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user._id });
    if(!rider) return res.status(404).json({ message: 'Rider not found' });
    
    rider.currentLocation = req.body.location;
    await rider.save();
    
    // Broadcast live location if Rider is mapped to an ongoing Order.
    if (rider.activeOrder) {
      // Need to find the exact user ID linked to that order to target the WebSocket successfully
      const Order = require('../models/Order');
      const ongoingOrder = await Order.findById(rider.activeOrder);
      if (ongoingOrder) {
        const { getIo } = require('../socket');
        const io = getIo();
        io.to(ongoingOrder.user.toString()).emit('riderLocationUpdated', {
          lat: rider.currentLocation.lat,
          lng: rider.currentLocation.lng,
          status: rider.status
        });
      }
    }

    res.json(rider);
  } catch(error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

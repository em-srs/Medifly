const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const Rider = require('../models/Rider');
const PricingService = require('../services/pricingService');
const RiderAssignmentService = require('../services/riderAssignmentService');
const { getIo } = require('../socket');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, prescriptionId } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    let requiresPrescription = false;
    let validatedItems = [];

    // 1 & 4. User selects medicines & Check pharmacy stock
    for (const item of orderItems) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine not found for ID: ${item.medicine}` });
      }

      if (medicine.stock === false || medicine.inventoryCount < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine.brandName}` });
      }

      // 2. Check prescription requirement
      if (medicine.requiresPrescription) {
        requiresPrescription = true;
      }

      validatedItems.push({
        ...item,
        name: item.name || medicine.brandName, // Ensure name is always set
        price: medicine.price // Force real DB price to prevent client spoofing
      });
    }

    // 3. Verify prescription if required
    if (requiresPrescription) {
      if (!prescriptionId) {
        return res.status(400).json({ message: 'Prescription is required for one or more medicines in your cart' });
      }

      const prescription = await Prescription.findById(prescriptionId);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      if (prescription.status !== 'VERIFIED') {
        return res.status(400).json({ message: 'Prescription must be verified by a pharmacist before ordering' });
      }
    }

    // 5. Calculate price
    const { isEmergency } = req.body;
    const { 
      subtotal, tax, platformFee, deliveryFee, 
      coldChainFee, emergencyFee, lateNightFee, total 
    } = PricingService.calculateTotals(validatedItems, req.user, { isEmergency });

    // 6. Create order (Initial status: 'pending' or 'verified' if Rx checked)
    const order = new Order({
      orderItems: validatedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: subtotal,
      taxPrice: tax,
      platformFee,
      deliveryFee,
      coldChainFee,
      emergencyFee,
      lateNightFee,
      totalPrice: total,
      status: 'verified' // Moving to verified since stock and Rx checks passed
    });

    const savedOrder = await order.save();

    // 7. Assign rider (Finding an available rider)
    const availableRiders = await Rider.find({ status: 'ONLINE', isAvailable: true });
    const assignedRider = RiderAssignmentService.assignRider(savedOrder, availableRiders);

    // 8. Update order status if rider assigned
    if (assignedRider) {
      savedOrder.rider = assignedRider.user;
      savedOrder.status = 'assigned';
      await savedOrder.save();

      assignedRider.isAvailable = false;
      assignedRider.status = 'ON_DELIVERY';
      assignedRider.activeOrder = savedOrder._id;
      await assignedRider.save();
    }

    // Update Medicine Stock & Emit changes
    const io = getIo();

    for (const item of validatedItems) {
      const updatedMed = await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { inventoryCount: -item.qty }
      }, { new: true });

      io.emit('inventoryChanged', {
        medicineId: updatedMed._id,
        available: updatedMed.inventoryCount > 0,
        count: updatedMed.inventoryCount
      });
    }

    // Emit order creation / status updates to user's personalized room
    io.to(req.user._id.toString()).emit('orderStatusChanged', {
      orderId: savedOrder._id,
      status: savedOrder.status,
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error processing order', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

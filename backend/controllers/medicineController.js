const Medicine = require('../models/Medicine');

// @desc    Get all medicines (with pagination & search support)
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { brandName: { $regex: req.query.keyword, $options: 'i' } },
            { genericName: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20;

    const count = await Medicine.countDocuments({ ...keyword });
    const medicines = await Medicine.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ medicines, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching medicines', error: error.message });
  }
};

// @desc    Fetch single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (medicine) {
      res.json(medicine);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get alternatives by Salt Name (For Salt Comparison engine)
// @route   GET /api/medicines/alternatives/:saltName
// @access  Public
exports.getAlternatives = async (req, res) => {
  try {
    const saltQuery = req.params.saltName;
    const alternatives = await Medicine.find({ 
      genericName: { $regex: saltQuery, $options: 'i' } 
    }).sort({ priceInr: 1 }); // Sorted by price for cheaper option first

    res.json(alternatives);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching alternatives', error: error.message });
  }
};

// @desc    Compare salts for a specific medicine by its ID
// @route   GET /api/medicines/salt-comparison/:medicineId
// @access  Public
exports.compareSalts = async (req, res) => {
  try {
    const original_medicine = await Medicine.findById(req.params.medicineId).populate('saltComposition');
    
    if (!original_medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Find other medicines with the same salt composition, excluding the original one
    const alternative_medicines = await Medicine.find({
      saltComposition: original_medicine.saltComposition._id,
      _id: { $ne: original_medicine._id }
    })
    .populate('saltComposition')
    .sort({ price: 1 }); // Sort by lowest price first

    res.json({
      original_medicine,
      alternative_medicines
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
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
      medicine.price = price;
      const updatedMedicine = await medicine.save();

      // Emit real-time price update to all clients
      const { getIo } = require('../socket');
      const io = getIo();
      io.emit('priceChanged', {
        medicineId: updatedMedicine._id,
        newPrice: updatedMedicine.price
      });

      res.json(updatedMedicine);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error during price update', error: error.message });
  }
};

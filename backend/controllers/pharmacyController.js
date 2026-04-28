const Pharmacy = require('../models/Pharmacy');

exports.registerPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.create({
      user: req.user._id,
      name: req.body.name,
      licenseNumber: req.body.licenseNumber,
      address: req.body.address
    });
    res.status(201).json(pharmacy);
  } catch(error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getPharmacyDashboard = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user._id });
    if(!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    res.json(pharmacy);
  } catch(error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

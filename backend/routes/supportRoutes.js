const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// @desc    Submit a support / contact request
// @route   POST /api/support
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required fields.' });
    }

    const result = await query(
      `INSERT INTO support_requests (name, email, category, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), email.trim(), category || 'General Inquiry', message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. Our team will get back to you shortly.',
      request: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving support request:', error);
    res.status(500).json({ message: 'Server Error processing support request', error: error.message });
  }
});

module.exports = router;

const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token to get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from PostgreSQL
      const result = await query(
        'SELECT id, name, email, phone, role, is_subscribed, subscription_plan, subscription_expiry, street, city, state, zip_code, lat, lng, created_at FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      const user = result.rows[0];
      // Map properties for backward compatibility with frontend
      user._id = user.id;
      user.isSubscribed = user.is_subscribed;
      user.subscriptionPlan = user.subscription_plan;
      user.subscriptionExpiry = user.subscription_expiry;

      req.user = user;

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token available' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };

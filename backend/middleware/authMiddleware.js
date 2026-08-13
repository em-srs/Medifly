const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const protect = async (req, res, next) => {
  let token;
  const secret = process.env.JWT_SECRET || 'medifly_secret_key_2026';

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  const clerkIdHeader = req.headers['x-clerk-id'];
  const userEmailHeader = req.headers['x-user-email'];

  if (!token && !clerkIdHeader && !userEmailHeader) {
    return res.status(401).json({ message: 'Not authorized, no token available' });
  }

  try {
    let userId = null;
    let userEmail = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (err) {
        const decoded = jwt.decode(token);
        if (decoded) {
          userEmail = decoded.email || decoded.primary_email || decoded.sub;
          userId = decoded.id || decoded.sub;
        } else {
          userId = token;
        }
      }
    }

    if (!userEmail && userEmailHeader) userEmail = userEmailHeader;

    let result;
    const selectFields = 'id, clerk_id, name, email, phone, alt_phone, blood_group, allergies, primary_doctor, upi_id, role, is_subscribed, subscription_plan, subscription_expiry, street, city, state, zip_code, lat, lng, created_at';

    if (userId && !isNaN(userId)) {
      result = await query(`SELECT ${selectFields} FROM users WHERE id = $1`, [userId]);
    } else if (userId) {
      result = await query(`SELECT ${selectFields} FROM users WHERE clerk_id = $1 OR email = $2 OR id::text = $3`, [userId, userId, userId]);
    } else if (userEmail) {
      result = await query(`SELECT ${selectFields} FROM users WHERE email = $1`, [userEmail]);
    }

    if (!result || result.rows.length === 0) {
      // If user isn't in PostgreSQL yet, auto-create with NULL phone (no hardcoded default)
      if (userEmail) {
        const userName = req.headers['x-user-name'] || userEmail.split('@')[0];
        const newRes = await query(
          `INSERT INTO users (name, email, password, phone, role, clerk_id)
           VALUES ($1, $2, 'clerk_sso_nopassword', NULL, 'user', $3)
           RETURNING ${selectFields}`,
          [userName, userEmail, clerkIdHeader || userId || userEmail]
        );
        result = newRes;
      } else {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
    }

    const user = result.rows[0];
    user._id = user.id;
    user.isSubscribed = user.is_subscribed;
    user.subscriptionPlan = user.subscription_plan;
    user.subscriptionExpiry = user.subscription_expiry;

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

// Requires admin OR super_admin role
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized — admin access required' });
  }
};

// Requires super_admin role exclusively
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized — super_admin access required' });
  }
};

module.exports = { protect, admin, superAdmin };

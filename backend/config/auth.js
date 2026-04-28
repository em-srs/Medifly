module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey_for_medifly',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

const { verifyToken } = require('../utils/jwt');
const authService = require('../services/auth.service');

const COOKIE_NAME = process.env.COOKIE_NAME || 'waste_warrior_token';

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const user = await authService.findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned or disabled',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};

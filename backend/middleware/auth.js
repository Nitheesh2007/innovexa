const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    // Admin always has universal access
    if (req.user.role === 'admin') {
      return next();
    }

    // If route is restricted strictly to admin only
    if (roles.length === 1 && roles[0] === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator privileges required'
      });
    }

    const effectiveRoles = [...roles];
    if (effectiveRoles.some(r => ['staff', 'manager', 'user', 'employee'].includes(r))) {
      effectiveRoles.push('staff', 'user', 'manager', 'employee');
    }
    
    if (!effectiveRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

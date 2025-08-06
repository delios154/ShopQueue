const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const shopOwner = (req, res, next) => {
  if (req.user.role !== 'shop_owner') {
    return res.status(403).json({ message: 'Access denied. Shop owner role required.' });
  }
  next();
};

const shopAccess = async (req, res, next) => {
  try {
    const shopId = req.params.shopId || req.body.shopId;
    
    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    if (req.user.role === 'shop_owner' && req.user.shops.includes(shopId)) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied to this shop' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, shopOwner, shopAccess };
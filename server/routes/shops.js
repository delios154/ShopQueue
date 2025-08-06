const express = require('express');
const { body, validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { auth, shopOwner, shopAccess } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, shopOwner, [
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('category').isIn(['barbershop', 'salon', 'tailor', 'repair', 'clinic', 'dental', 'cafe', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const shopData = {
      ...req.body,
      owner: req.user.id
    };

    const shop = new Shop(shopData);
    await shop.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { shops: shop._id }
    });

    res.status(201).json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-shops', auth, shopOwner, async (req, res) => {
  try {
    const shops = await Shop.find({ owner: req.user.id });
    res.json(shops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:shopId', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).populate('owner', 'name email');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:shopId', auth, shopAccess, async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      req.body,
      { new: true }
    );
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:shopId', auth, shopAccess, async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.shopId);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { shops: shop._id }
    });

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:shopId/public', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId)
      .select('name description category operatingHours services branding address phone email')
      .where({ isActive: true });
      
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found or inactive' });
    }
    
    res.json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
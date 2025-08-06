const express = require('express');
const { body, validationResult } = require('express-validator');
const Queue = require('../models/Queue');
const Booking = require('../models/Booking');
const { auth, shopAccess } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('name').notEmpty().trim(),
  body('shopId').isMongoId(),
  body('maxCapacity').isInt({ min: 1 }),
  body('estimatedServiceTime').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, shopId, maxCapacity, estimatedServiceTime } = req.body;

    const queue = new Queue({
      name,
      description,
      shop: shopId,
      maxCapacity,
      estimatedServiceTime
    });

    await queue.save();
    res.status(201).json(queue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/shop/:shopId', async (req, res) => {
  try {
    const queues = await Queue.find({ 
      shop: req.params.shopId,
      isActive: true 
    });
    res.json(queues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:queueId', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId)
      .populate('shop', 'name description branding');
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const currentBookings = await Booking.find({
      queue: queue._id,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    }).sort({ queueNumber: 1 });

    res.json({
      ...queue.toObject(),
      currentBookings: currentBookings.length,
      estimatedWaitTime: currentBookings.length * queue.estimatedServiceTime
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:queueId', auth, async (req, res) => {
  try {
    const queue = await Queue.findByIdAndUpdate(
      req.params.queueId,
      req.body,
      { new: true }
    );
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    res.json(queue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:queueId/status', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const activeBookings = await Booking.find({
      queue: queue._id,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    }).sort({ queueNumber: 1 });

    const inProgressBooking = activeBookings.find(b => b.status === 'in_progress');
    const nextInLine = activeBookings.find(b => b.status === 'confirmed');

    res.json({
      queueId: queue._id,
      queueName: queue.name,
      totalWaiting: activeBookings.length,
      currentlyServing: inProgressBooking ? {
        queueNumber: inProgressBooking.queueNumber,
        customer: inProgressBooking.customer.name
      } : null,
      nextInLine: nextInLine ? {
        queueNumber: nextInLine.queueNumber,
        customer: nextInLine.customer.name
      } : null,
      estimatedWaitTime: activeBookings.length * queue.estimatedServiceTime
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
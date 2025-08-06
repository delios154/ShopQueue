const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Queue = require('../models/Queue');
const Shop = require('../models/Shop');
const { auth, shopAccess } = require('../middleware/auth');
const { sendSMS } = require('../utils/notifications');

const router = express.Router();

router.post('/', [
  body('shopId').isMongoId(),
  body('queueId').isMongoId(),
  body('customer.name').notEmpty().trim(),
  body('customer.phone').notEmpty().trim(),
  body('customer.email').optional().isEmail(),
  body('service').notEmpty().trim(),
  body('type').isIn(['appointment', 'walk_in'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shopId, queueId, customer, service, type, scheduledTime } = req.body;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const activeBookings = await Booking.countDocuments({
      queue: queueId,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (activeBookings >= queue.maxCapacity) {
      return res.status(400).json({ message: 'Queue is at maximum capacity' });
    }

    const lastBooking = await Booking.findOne({ queue: queueId })
      .sort({ queueNumber: -1 });

    const queueNumber = lastBooking ? lastBooking.queueNumber + 1 : 1;
    const estimatedWaitTime = activeBookings * queue.estimatedServiceTime;

    const booking = new Booking({
      shop: shopId,
      queue: queueId,
      customer,
      service,
      type,
      scheduledTime,
      queueNumber,
      estimatedWaitTime,
      status: type === 'appointment' ? 'confirmed' : 'pending'
    });

    await booking.save();

    await Queue.findByIdAndUpdate(queueId, {
      currentNumber: queueNumber
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('shop', 'name')
      .populate('queue', 'name');

    if (customer.phone) {
      const message = `Hello ${customer.name}! Your booking at ${populatedBooking.shop.name} is confirmed. Queue number: ${queueNumber}. Estimated wait: ${estimatedWaitTime} minutes.`;
      try {
        await sendSMS(customer.phone, message);
        booking.notificationsSent.push({
          type: 'sms',
          message
        });
        await booking.save();
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }
    }

    global.io.to(`queue-${queueId}`).emit('queue-updated', {
      queueId,
      totalWaiting: activeBookings + 1,
      newBooking: {
        queueNumber,
        customer: customer.name,
        estimatedWaitTime
      }
    });

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/shop/:shopId', auth, shopAccess, async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = { shop: req.params.shopId };

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const bookings = await Booking.find(query)
      .populate('queue', 'name')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('shop', 'name branding')
      .populate('queue', 'name estimatedServiceTime');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const queuePosition = await Booking.countDocuments({
      queue: booking.queue._id,
      queueNumber: { $lt: booking.queueNumber },
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    res.json({
      ...booking.toObject(),
      queuePosition: queuePosition + 1,
      estimatedWaitTime: queuePosition * booking.queue.estimatedServiceTime
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:bookingId/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updateData = { status };
    
    if (notes) updateData.notes = notes;
    
    if (status === 'in_progress') {
      updateData.serviceStartTime = new Date();
    } else if (status === 'completed') {
      updateData.serviceEndTime = new Date();
      if (booking.serviceStartTime) {
        updateData.actualWaitTime = Math.floor(
          (new Date() - booking.serviceStartTime) / (1000 * 60)
        );
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      updateData,
      { new: true }
    ).populate('shop', 'name').populate('queue', 'name');

    global.io.to(`queue-${booking.queue}`).emit('booking-status-updated', {
      bookingId: booking._id,
      queueNumber: booking.queueNumber,
      status,
      customer: booking.customer.name
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    global.io.to(`queue-${booking.queue}`).emit('booking-cancelled', {
      queueNumber: booking.queueNumber
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
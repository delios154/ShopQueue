const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const { auth, shopAccess } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  body('shopId').isMongoId(),
  body('bookingId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('serviceRating').optional().isInt({ min: 1, max: 5 }),
  body('waitTimeRating').optional().isInt({ min: 1, max: 5 }),
  body('comments').optional().trim(),
  body('wouldRecommend').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shopId, bookingId, rating, serviceRating, waitTimeRating, comments, wouldRecommend, customer } = req.body;

    const existingFeedback = await Feedback.findOne({ booking: bookingId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this booking' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot submit feedback for incomplete booking' });
    }

    const feedback = new Feedback({
      shop: shopId,
      booking: bookingId,
      customer: customer || booking.customer,
      rating,
      serviceRating,
      waitTimeRating,
      comments,
      wouldRecommend
    });

    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('shop', 'name')
      .populate('booking', 'queueNumber service');

    res.status(201).json(populatedFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/shop/:shopId', auth, shopAccess, async (req, res) => {
  try {
    const { page = 1, limit = 20, rating } = req.query;
    
    const query = { shop: req.params.shopId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const feedback = await Feedback.find(query)
      .populate('booking', 'queueNumber service')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/shop/:shopId/summary', auth, shopAccess, async (req, res) => {
  try {
    const feedback = await Feedback.find({ shop: req.params.shopId });

    if (feedback.length === 0) {
      return res.json({
        averageRating: 0,
        totalFeedback: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageServiceRating: 0,
        averageWaitTimeRating: 0,
        recommendationRate: 0
      });
    }

    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
    
    const ratingDistribution = feedback.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    const serviceRatings = feedback.filter(f => f.serviceRating);
    const averageServiceRating = serviceRatings.length > 0 
      ? serviceRatings.reduce((sum, f) => sum + f.serviceRating, 0) / serviceRatings.length 
      : 0;

    const waitTimeRatings = feedback.filter(f => f.waitTimeRating);
    const averageWaitTimeRating = waitTimeRatings.length > 0 
      ? waitTimeRatings.reduce((sum, f) => sum + f.waitTimeRating, 0) / waitTimeRatings.length 
      : 0;

    const recommendations = feedback.filter(f => f.wouldRecommend !== undefined);
    const recommendationRate = recommendations.length > 0 
      ? (recommendations.filter(f => f.wouldRecommend).length / recommendations.length * 100) 
      : 0;

    res.json({
      averageRating: averageRating.toFixed(1),
      totalFeedback: feedback.length,
      ratingDistribution,
      averageServiceRating: averageServiceRating.toFixed(1),
      averageWaitTimeRating: averageWaitTimeRating.toFixed(1),
      recommendationRate: recommendationRate.toFixed(1)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/booking/:bookingId/form', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('shop', 'name branding');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Service not completed yet' });
    }

    const existingFeedback = await Feedback.findOne({ booking: booking._id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }

    res.json({
      booking: {
        id: booking._id,
        queueNumber: booking.queueNumber,
        service: booking.service,
        customer: booking.customer
      },
      shop: {
        id: booking.shop._id,
        name: booking.shop.name,
        branding: booking.shop.branding
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
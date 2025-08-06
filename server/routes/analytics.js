const express = require('express');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const { auth, shopAccess } = require('../middleware/auth');

const router = express.Router();

router.get('/shop/:shopId/dashboard', auth, shopAccess, async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await Booking.find({
      shop: req.params.shopId,
      createdAt: { $gte: startDate }
    });

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const noShowBookings = bookings.filter(b => b.status === 'no_show').length;

    const averageWaitTime = bookings
      .filter(b => b.actualWaitTime)
      .reduce((sum, b) => sum + b.actualWaitTime, 0) / 
      bookings.filter(b => b.actualWaitTime).length || 0;

    const bookingsByDay = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayBookings = bookings.filter(b => 
        b.createdAt >= dayStart && b.createdAt <= dayEnd
      ).length;

      bookingsByDay.push({
        date: date.toISOString().split('T')[0],
        bookings: dayBookings
      });
    }

    const peakHours = bookings.reduce((acc, booking) => {
      const hour = new Date(booking.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHourData = Object.entries(peakHours)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    const feedback = await Feedback.find({
      shop: req.params.shopId,
      createdAt: { $gte: startDate }
    });

    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0;

    res.json({
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        noShowBookings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0,
        averageWaitTime: Math.round(averageWaitTime),
        averageRating: averageRating.toFixed(1)
      },
      charts: {
        bookingsByDay,
        peakHours: peakHourData.slice(0, 6)
      },
      insights: {
        busiestDay: bookingsByDay.reduce((max, day) => 
          day.bookings > max.bookings ? day : max, bookingsByDay[0]),
        busiestHour: peakHourData[0] || { hour: 12, count: 0 },
        feedbackCount: feedback.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/shop/:shopId/reports', auth, shopAccess, async (req, res) => {
  try {
    const { startDate, endDate, type = 'summary' } = req.query;

    const query = { shop: req.params.shopId };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type === 'detailed') {
      const bookings = await Booking.find(query)
        .populate('queue', 'name')
        .sort({ createdAt: -1 });

      res.json({
        type: 'detailed',
        period: { startDate, endDate },
        bookings: bookings.map(b => ({
          id: b._id,
          queueNumber: b.queueNumber,
          customer: b.customer,
          service: b.service,
          status: b.status,
          queueName: b.queue.name,
          bookingTime: b.createdAt,
          serviceTime: b.serviceStartTime,
          completionTime: b.serviceEndTime,
          waitTime: b.actualWaitTime,
          estimatedWaitTime: b.estimatedWaitTime
        }))
      });
    } else {
      const bookings = await Booking.find(query);
      const feedback = await Feedback.find({
        shop: req.params.shopId,
        createdAt: query.createdAt || { $exists: true }
      });

      res.json({
        type: 'summary',
        period: { startDate, endDate },
        metrics: {
          totalBookings: bookings.length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          averageWaitTime: bookings
            .filter(b => b.actualWaitTime)
            .reduce((sum, b) => sum + b.actualWaitTime, 0) / 
            bookings.filter(b => b.actualWaitTime).length || 0,
          customerSatisfaction: feedback.length > 0 
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
            : 0,
          noShowRate: bookings.length > 0 
            ? (bookings.filter(b => b.status === 'no_show').length / bookings.length * 100) 
            : 0
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
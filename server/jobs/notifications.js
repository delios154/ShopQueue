const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendBookingReminder, sendTurnNotification } = require('../utils/notifications');

const startNotificationJobs = () => {
  // Send reminders every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Checking for booking reminders...');
    
    try {
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60000);
      
      // Find bookings scheduled in the next 15 minutes that haven't been reminded
      const upcomingBookings = await Booking.find({
        scheduledTime: {
          $gte: now,
          $lte: in15Minutes
        },
        status: 'confirmed',
        'notificationsSent.type': { $ne: 'reminder' }
      }).populate('shop', 'name');

      for (const booking of upcomingBookings) {
        try {
          await sendBookingReminder(booking);
          
          // Mark reminder as sent
          booking.notificationsSent.push({
            type: 'reminder',
            message: `Reminder: Your appointment at ${booking.shop.name} is in 15 minutes`
          });
          await booking.save();
          
          console.log(`Reminder sent for booking ${booking._id}`);
        } catch (error) {
          console.error(`Failed to send reminder for booking ${booking._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in reminder job:', error);
    }
  });

  // Check for "next in line" notifications every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    console.log('Checking for turn notifications...');
    
    try {
      // Find bookings that are next in line (position 2 in queue)
      const allQueues = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'in_progress'] }
          }
        },
        {
          $group: {
            _id: '$queue',
            bookings: {
              $push: {
                _id: '$_id',
                queueNumber: '$queueNumber',
                status: '$status',
                customer: '$customer',
                notificationsSent: '$notificationsSent'
              }
            }
          }
        }
      ]);

      for (const queueGroup of allQueues) {
        const sortedBookings = queueGroup.bookings.sort((a, b) => a.queueNumber - b.queueNumber);
        
        // Find the booking that's next in line (after current in_progress)
        const inProgressIndex = sortedBookings.findIndex(b => b.status === 'in_progress');
        const nextInLineIndex = inProgressIndex >= 0 ? inProgressIndex + 1 : 0;
        
        if (nextInLineIndex < sortedBookings.length) {
          const nextBooking = sortedBookings[nextInLineIndex];
          
          // Check if we haven't sent a "turn" notification yet
          const hasTurnNotification = nextBooking.notificationsSent.some(n => n.type === 'turn');
          
          if (!hasTurnNotification) {
            try {
              const fullBooking = await Booking.findById(nextBooking._id)
                .populate('shop', 'name');
              
              await sendTurnNotification(fullBooking);
              
              // Mark turn notification as sent
              fullBooking.notificationsSent.push({
                type: 'turn',
                message: `It's almost your turn! You're next in line at ${fullBooking.shop.name}`
              });
              await fullBooking.save();
              
              console.log(`Turn notification sent for booking ${fullBooking._id}`);
            } catch (error) {
              console.error(`Failed to send turn notification for booking ${nextBooking._id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in turn notification job:', error);
    }
  });

  console.log('Notification cron jobs started');
};

module.exports = { startNotificationJobs };
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('SMS simulation (Twilio not configured):', { to, message });
      return { success: true, simulated: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

const sendWhatsApp = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('WhatsApp simulation (Twilio not configured):', { to, message });
      return { success: true, simulated: true };
    }

    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`
    });

    console.log('WhatsApp sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    throw error;
  }
};

const sendBookingReminder = async (booking) => {
  const message = `Reminder: Your appointment at ${booking.shop.name} is in 15 minutes. Queue number: ${booking.queueNumber}`;
  
  try {
    await sendSMS(booking.customer.phone, message);
  } catch (error) {
    console.error('Failed to send booking reminder:', error);
  }
};

const sendTurnNotification = async (booking) => {
  const message = `It's almost your turn! You're next in line at ${booking.shop.name}. Please be ready. Queue number: ${booking.queueNumber}`;
  
  try {
    await sendSMS(booking.customer.phone, message);
  } catch (error) {
    console.error('Failed to send turn notification:', error);
  }
};

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendBookingReminder,
  sendTurnNotification
};
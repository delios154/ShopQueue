# ShopQueue - Smart Booking & Customer Queue System

A comprehensive SaaS solution for small shops to manage customer queues, appointments, and walk-ins with real-time updates and SMS notifications.

## 🚀 Features

### Core Features
- **📱 Online Booking Page** - Custom branded booking pages for each shop
- **⏱️ Real-Time Queue Display** - Live queue status with WebSocket updates
- **📲 SMS/WhatsApp Notifications** - Automated customer notifications via Twilio
- **📊 Analytics & Insights** - Detailed reporting on bookings, wait times, and customer feedback
- **🔄 Feedback Collection** - Automated feedback collection after service completion

### Shop Management
- Multi-shop support for shop owners
- Queue management with customizable capacity and service times
- Booking status management (pending, confirmed, in-progress, completed)
- Customer database with contact information

### Customer Experience
- Simple booking process with queue selection
- Real-time status updates via booking status page
- SMS notifications for queue position updates
- Feedback submission system

## 🛠️ Tech Stack

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - Database and ODM
- **Socket.io** - Real-time communications
- **JWT** - Authentication and authorization
- **Twilio** - SMS/WhatsApp notifications
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling and responsive design
- **Socket.io Client** - Real-time updates

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Twilio account (for SMS notifications)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ShopQueue
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
npm run install:all
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopqueue
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Database Setup
Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB Atlas cluster.

### 5. Twilio Setup (Optional but Recommended)
1. Sign up for a [Twilio account](https://www.twilio.com)
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending SMS
4. Update the Twilio credentials in your `.env` file

**Note:** The app will work without Twilio credentials but will only simulate SMS sending in the console.

## 🚀 Running the Application

### Development Mode
```bash
# Start both backend and frontend concurrently
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## 📱 Usage Guide

### For Shop Owners

1. **Register an Account**
   - Visit `/register`
   - Select "Shop Owner" as account type
   - Fill in your details

2. **Create Your First Shop**
   - Go to the dashboard
   - Click "Add New Shop"
   - Fill in shop details, address, and services

3. **Set Up Queues**
   - Click on a shop card in your dashboard
   - Click "Manage Queues"
   - Create queues for different services or areas

4. **Share Your Booking Page**
   - Each shop gets a public booking page at `/shop/{shopId}`
   - Share this URL with customers for online bookings

5. **Monitor Queue Display**
   - Each queue has a display page at `/queue/{queueId}/display`
   - Use this for in-shop displays on tablets or monitors

### For Customers

1. **Book an Appointment**
   - Visit the shop's booking page
   - Fill in your details and select a service
   - Choose appointment or walk-in
   - Receive SMS confirmation with queue number

2. **Track Your Status**
   - Use the link in your SMS to check queue position
   - Get real-time updates on wait times

3. **Provide Feedback**
   - After service completion, receive feedback request
   - Rate your experience to help shops improve

## 🏗️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Shops
- `POST /api/shops` - Create new shop (shop owners only)
- `GET /api/shops/my-shops` - Get user's shops
- `GET /api/shops/:id/public` - Get public shop info

### Queues
- `POST /api/queues` - Create new queue
- `GET /api/queues/shop/:shopId` - Get shop's queues
- `GET /api/queues/:id/status` - Get real-time queue status

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status

### Analytics
- `GET /api/analytics/shop/:shopId/dashboard` - Get dashboard analytics
- `GET /api/analytics/shop/:shopId/reports` - Get detailed reports

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/booking/:bookingId/form` - Get feedback form

## 🔧 Configuration

### Subscription Plans

The app supports three subscription tiers:

- **Free**: 1 queue, 50 bookings/month
- **Standard ($10/month)**: 3 queues, SMS notifications, custom branding
- **Pro ($30/month)**: Unlimited queues, advanced analytics, team access

### Customization

Shops can customize their branding:
- Primary and secondary colors
- Logo upload (implementation pending)
- Custom domain support (implementation pending)

## 📊 Analytics Features

- **Dashboard Overview**: Key metrics and trends
- **Booking Analytics**: Completion rates, no-show tracking
- **Customer Insights**: Peak hours, busiest days
- **Feedback Analysis**: Average ratings, customer satisfaction

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection

## 🚀 Deployment

### Using Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Enable automatic deploys

### Using Docker (Coming Soon)
Docker configuration files will be added for easy containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@shopqueue.com (when available)

## 🎯 Roadmap

- [ ] WhatsApp Business API integration
- [ ] QR code generation for easy booking
- [ ] Mobile app (React Native)
- [ ] Advanced subscription management
- [ ] Multi-language support
- [ ] Integration with payment systems
- [ ] Advanced reporting and export features
- [ ] Team management for multi-staff shops

---

**Built with ❤️ for small businesses everywhere**
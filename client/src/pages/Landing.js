import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-800">ShopQueue</span>
          </div>
          <div className="space-x-4">
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Queue Management for Small Shops
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Reduce wait times, improve customer experience, and grow your business with our simple booking and queue system.
          </p>
          <div className="space-x-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Start Free Trial
            </Link>
            <a href="#features" className="btn btn-secondary text-lg px-8 py-3">
              Learn More
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20" id="features">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-500 text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Online Booking</h3>
            <p className="text-gray-600">
              Customers can book appointments or join queues remotely through your custom booking page.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-500 text-2xl">⏱️</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-Time Updates</h3>
            <p className="text-gray-600">
              Live queue display and SMS notifications keep customers informed about wait times.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-500 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
            <p className="text-gray-600">
              Track peak hours, customer feedback, and optimize your business operations.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Perfect for Small Shops
          </h2>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              'Barbershops & Salons',
              'Repair Shops',
              'Clinics & Dental',
              'Tailors & Custom Services'
            ].map((shop, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{shop}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600">Free tier: 1 queue, 50 bookings/month</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600">Standard: $10/month - 3 queues, SMS alerts</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600">Pro: $30/month - unlimited, analytics, team access</span>
            </div>
          </div>
          <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
            Get Started Today
          </Link>
        </div>
      </main>

      <footer className="bg-gray-100 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary-500 rounded"></div>
            <span className="text-lg font-bold text-gray-800">ShopQueue</span>
          </div>
          <p className="text-gray-600">
            © 2024 ShopQueue. All rights reserved. Smart queue management for modern businesses.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
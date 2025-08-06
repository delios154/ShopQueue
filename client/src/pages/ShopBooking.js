import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { shops, queues, bookings } from '../utils/api';
import toast from 'react-hot-toast';

const ShopBooking = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    service: '',
    type: 'appointment',
    queueId: ''
  });

  const { data: shop, isLoading: shopLoading } = useQuery(
    ['shop', shopId],
    () => shops.getPublic(shopId).then(res => res.data),
    { retry: 1 }
  );

  const { data: shopQueues } = useQuery(
    ['queues', shopId],
    () => queues.getByShop(shopId).then(res => res.data),
    { enabled: !!shopId }
  );

  const createBookingMutation = useMutation(
    (bookingData) => bookings.create(bookingData),
    {
      onSuccess: (response) => {
        const booking = response.data;
        toast.success(`Booking confirmed! Queue number: ${booking.queueNumber}`);
        navigate(`/booking/${booking._id}/status`);
        queryClient.invalidateQueries(['queues']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('customer.')) {
      const customerField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [customerField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.queueId) {
      toast.error('Please select a queue');
      return;
    }

    const bookingData = {
      shopId,
      queueId: formData.queueId,
      customer: formData.customer,
      service: formData.service,
      type: formData.type
    };

    createBookingMutation.mutate(bookingData);
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h1>
          <p className="text-gray-600">The shop you're looking for doesn't exist or is not active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12"
        style={{
          background: shop.branding?.primaryColor ? 
            `linear-gradient(to right, ${shop.branding.primaryColor}, ${shop.branding.primaryColor}dd)` : 
            undefined
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">{shop.name}</h1>
          <p className="text-lg opacity-90 mb-4">{shop.description}</p>
          <div className="flex items-center space-x-6 text-sm opacity-80">
            <span>📍 {shop.address?.city}</span>
            <span>📞 {shop.phone}</span>
            <span>✉️ {shop.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-4">Our Services</h2>
              {shop.services && shop.services.length > 0 ? (
                <div className="space-y-3">
                  {shop.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${service.price}</div>
                        <div className="text-sm text-gray-600">{service.duration} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Services will be discussed during your visit.</p>
              )}
            </div>

            {shopQueues && shopQueues.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Current Queues</h2>
                <div className="space-y-3">
                  {shopQueues.map((queue) => (
                    <div key={queue._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{queue.name}</div>
                          <div className="text-sm text-gray-600">{queue.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Est. wait: {queue.estimatedServiceTime} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Book Your Appointment</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="customer.name"
                      required
                      className="input"
                      placeholder="Your full name"
                      value={formData.customer.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="customer.phone"
                      required
                      className="input"
                      placeholder="Your phone number"
                      value={formData.customer.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    name="customer.email"
                    className="input"
                    placeholder="your@email.com"
                    value={formData.customer.email}
                    onChange={handleChange}
                  />
                </div>

                {shopQueues && shopQueues.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Queue *
                    </label>
                    <select
                      name="queueId"
                      required
                      className="input"
                      value={formData.queueId}
                      onChange={handleChange}
                    >
                      <option value="">Choose a queue</option>
                      {shopQueues.map((queue) => (
                        <option key={queue._id} value={queue._id}>
                          {queue.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service *
                  </label>
                  {shop.services && shop.services.length > 0 ? (
                    <select
                      name="service"
                      required
                      className="input"
                      value={formData.service}
                      onChange={handleChange}
                    >
                      <option value="">Select a service</option>
                      {shop.services.map((service, index) => (
                        <option key={index} value={service.name}>
                          {service.name} - ${service.price} ({service.duration} min)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="service"
                      required
                      className="input"
                      placeholder="Describe the service you need"
                      value={formData.service}
                      onChange={handleChange}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Type
                  </label>
                  <select
                    name="type"
                    className="input"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="appointment">Appointment</option>
                    <option value="walk_in">Walk-in</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={createBookingMutation.isLoading}
                  className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBookingMutation.isLoading ? 'Booking...' : 'Book Now'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">ℹ️</span>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">What happens next?</p>
                    <p>
                      You'll receive an SMS confirmation with your queue number and estimated wait time. 
                      You can check your status anytime using the link in the message.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopBooking;
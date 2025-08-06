import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookings } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

const BookingStatus = () => {
  const { bookingId } = useParams();
  const { joinQueue } = useSocket();

  const { data: booking, isLoading, refetch } = useQuery(
    ['booking', bookingId],
    () => bookings.getById(bookingId).then(res => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      onSuccess: (data) => {
        if (data.queue._id) {
          joinQueue(data.queue._id);
        }
      }
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'in_progress': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      case 'no_show': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'no_show': return '❌';
      default: return '⏳';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Your booking is pending confirmation';
      case 'confirmed': return 'Your booking is confirmed';
      case 'in_progress': return 'You are currently being served';
      case 'completed': return 'Your service has been completed';
      case 'cancelled': return 'Your booking has been cancelled';
      case 'no_show': return 'Marked as no-show';
      default: return 'Unknown status';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600">The booking you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(booking.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Booking Status</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 rounded-full bg-${statusColor}-100 flex items-center justify-center text-2xl`}>
                  {getStatusIcon(booking.status)}
                </div>
                <div>
                  <h2 className="text-xl font-bold capitalize">{booking.status.replace('_', ' ')}</h2>
                  <p className={`text-${statusColor}-600`}>{getStatusMessage(booking.status)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue Number:</span>
                  <span className="font-bold text-2xl text-primary-500">#{booking.queueNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Queue:</span>
                  <span className="font-medium">{booking.queue.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{booking.service}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{booking.customer.name}</span>
                </div>

                {booking.status === 'confirmed' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position in Queue:</span>
                      <span className="font-bold text-lg">#{booking.queuePosition}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Wait:</span>
                      <span className="font-bold text-lg text-primary-500">
                        {booking.estimatedWaitTime} minutes
                      </span>
                    </div>
                  </>
                )}

                {booking.actualWaitTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Wait Time:</span>
                    <span className="font-medium">{booking.actualWaitTime} minutes</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Time:</span>
                  <span className="font-medium">
                    {new Date(booking.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Notes:</h3>
                  <p className="text-gray-700">{booking.notes}</p>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => refetch()}
                  className="btn btn-secondary flex-1"
                >
                  Refresh Status
                </button>
                
                {booking.status === 'completed' && (
                  <Link 
                    to={`/booking/${booking._id}/feedback`}
                    className="btn btn-primary flex-1 text-center"
                  >
                    Leave Feedback
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Shop Information</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="font-medium">{booking.shop.name}</div>
                  {booking.shop.address && (
                    <div className="text-sm text-gray-600">
                      {booking.shop.address.street}, {booking.shop.address.city}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">📞</span>
                  <span>{booking.shop.phone || 'Contact info not available'}</span>
                </div>

                {booking.shop.email && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">✉️</span>
                    <span>{booking.shop.email}</span>
                  </div>
                )}
              </div>
            </div>

            {booking.status === 'confirmed' && (
              <div className="card mt-6">
                <h3 className="text-lg font-bold mb-4">What's Next?</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">1.</span>
                    <span>We'll send you an SMS when it's almost your turn</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">2.</span>
                    <span>Please arrive 5 minutes before your estimated time</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-0.5">3.</span>
                    <span>Check this page anytime for updated wait times</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Bookmark this page or save the link from your SMS for easy access to your booking status.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;
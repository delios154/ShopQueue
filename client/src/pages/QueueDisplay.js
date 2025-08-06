import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { queues, bookings } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

const QueueDisplay = () => {
  const { queueId } = useParams();
  const { joinQueue, socket } = useSocket();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (queueId) {
      joinQueue(queueId);
    }
  }, [queueId, joinQueue]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: queue, isLoading: queueLoading, refetch: refetchQueue } = useQuery(
    ['queue', queueId],
    () => queues.getById(queueId).then(res => res.data),
    {
      refetchInterval: 30000,
    }
  );

  const { data: activeBookings, refetch: refetchBookings } = useQuery(
    ['bookings', 'active', queueId],
    () => bookings.getByShop(queue.shop._id, { 
      status: 'confirmed,in_progress,pending' 
    }).then(res => res.data.filter(b => b.queue._id === queueId)),
    {
      enabled: !!queue,
      refetchInterval: 15000,
    }
  );

  useEffect(() => {
    if (socket) {
      socket.on('queue-updated', () => {
        refetchQueue();
        refetchBookings();
      });

      socket.on('booking-status-updated', () => {
        refetchQueue();
        refetchBookings();
      });

      return () => {
        socket.off('queue-updated');
        socket.off('booking-status-updated');
      };
    }
  }, [socket, refetchQueue, refetchBookings]);

  if (queueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Queue Not Found</h1>
          <p className="text-gray-600">The queue display you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentlyServing = activeBookings?.find(b => b.status === 'in_progress');
  const upNext = activeBookings?.filter(b => b.status === 'confirmed').sort((a, b) => a.queueNumber - b.queueNumber);
  const pendingCount = activeBookings?.filter(b => b.status === 'pending').length || 0;

  const shopColors = queue.shop.branding || {};

  return (
    <div 
      className="min-h-screen p-8"
      style={{ 
        background: `linear-gradient(135deg, ${shopColors.primaryColor || '#3B82F6'}, ${shopColors.secondaryColor || '#1F2937'})`,
        color: 'white'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-6xl font-bold mb-4">{queue.shop.name}</h1>
            <h2 className="text-3xl opacity-90">{queue.name}</h2>
            {queue.description && (
              <p className="text-xl opacity-75 mt-2">{queue.description}</p>
            )}
          </div>
          
          <div className="text-lg opacity-80">
            {currentTime.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        {/* Main Display */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Currently Serving */}
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-3xl p-12 backdrop-blur-lg">
              <h3 className="text-2xl font-semibold mb-6 opacity-90">NOW SERVING</h3>
              {currentlyServing ? (
                <div>
                  <div className="text-8xl font-bold mb-4 animate-pulse">
                    #{currentlyServing.queueNumber}
                  </div>
                  <div className="text-2xl opacity-90">
                    {currentlyServing.customer.name}
                  </div>
                  <div className="text-lg opacity-75 mt-2">
                    {currentlyServing.service}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-8xl font-bold mb-4 opacity-50">-</div>
                  <div className="text-2xl opacity-75">No one being served</div>
                </div>
              )}
            </div>
          </div>

          {/* Up Next */}
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-3xl p-12 backdrop-blur-lg">
              <h3 className="text-2xl font-semibold mb-6 opacity-90">UP NEXT</h3>
              {upNext && upNext.length > 0 ? (
                <div>
                  <div className="text-6xl font-bold mb-4">
                    #{upNext[0].queueNumber}
                  </div>
                  <div className="text-xl opacity-90">
                    {upNext[0].customer.name}
                  </div>
                  <div className="text-base opacity-75 mt-2">
                    {upNext[0].service}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-6xl font-bold mb-4 opacity-50">-</div>
                  <div className="text-xl opacity-75">Queue is empty</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Queue Status */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center bg-white bg-opacity-15 rounded-2xl p-8 backdrop-blur-lg">
            <div className="text-4xl font-bold mb-2">
              {activeBookings?.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length || 0}
            </div>
            <div className="text-lg opacity-90">People in Queue</div>
          </div>

          <div className="text-center bg-white bg-opacity-15 rounded-2xl p-8 backdrop-blur-lg">
            <div className="text-4xl font-bold mb-2">
              {pendingCount}
            </div>
            <div className="text-lg opacity-90">Pending Bookings</div>
          </div>

          <div className="text-center bg-white bg-opacity-15 rounded-2xl p-8 backdrop-blur-lg">
            <div className="text-4xl font-bold mb-2">
              ~{queue.estimatedServiceTime}
            </div>
            <div className="text-lg opacity-90">Minutes per Service</div>
          </div>
        </div>

        {/* Upcoming Queue */}
        {upNext && upNext.length > 1 && (
          <div className="bg-white bg-opacity-15 rounded-2xl p-8 backdrop-blur-lg">
            <h3 className="text-2xl font-semibold mb-6 text-center opacity-90">COMING UP</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {upNext.slice(1, 7).map((booking) => (
                <div key={booking._id} className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    #{booking.queueNumber}
                  </div>
                  <div className="text-sm opacity-90 truncate">
                    {booking.customer.name}
                  </div>
                </div>
              ))}
            </div>
            
            {upNext.length > 7 && (
              <div className="text-center mt-6 opacity-75">
                + {upNext.length - 7} more in queue
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 opacity-75">
          <div className="text-lg mb-2">
            📱 Book your spot: QR code or visit our website
          </div>
          <div className="text-sm">
            Wait times are estimates and may vary • Updates every 15 seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;
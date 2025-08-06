import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { queues, bookings } from '../utils/api';

const ShopCard = ({ shop, onSelectForAnalytics }) => {
  const [showQueueModal, setShowQueueModal] = useState(false);

  const { data: shopQueues } = useQuery(
    ['queues', shop._id],
    () => queues.getByShop(shop._id).then(res => res.data)
  );

  const { data: todayBookings } = useQuery(
    ['bookings', shop._id, 'today'],
    () => {
      const today = new Date().toISOString().split('T')[0];
      return bookings.getByShop(shop._id, { date: today }).then(res => res.data);
    }
  );

  const categoryEmoji = {
    barbershop: '💇',
    salon: '💅',
    tailor: '🧵',
    repair: '🔧',
    clinic: '🏥',
    dental: '🦷',
    cafe: '☕',
    other: '🏪'
  };

  const getStatusColor = (subscription) => {
    switch (subscription.plan) {
      case 'pro': return 'border-purple-200 bg-purple-50';
      case 'standard': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`card border-2 ${getStatusColor(shop.subscription)} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
            {categoryEmoji[shop.category] || '🏪'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{shop.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{shop.category}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getPlanBadge(shop.subscription.plan)}`}>
          {shop.subscription.plan}
        </span>
      </div>

      <p className="text-gray-600 mb-4 text-sm line-clamp-2">{shop.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Queues:</span>
          <span className="ml-1 font-medium">{shopQueues?.length || 0}</span>
        </div>
        <div>
          <span className="text-gray-500">Today:</span>
          <span className="ml-1 font-medium">{todayBookings?.length || 0} bookings</span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>
          <span className={`ml-1 font-medium ${shop.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {shop.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Phone:</span>
          <span className="ml-1 font-medium text-xs">{shop.phone}</span>
        </div>
      </div>

      {shop.address?.city && (
        <div className="text-sm text-gray-600 mb-4">
          📍 {shop.address.city}, {shop.address.state}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowQueueModal(true)}
            className="btn btn-primary flex-1 text-sm py-2"
          >
            Manage Queues
          </button>
          <Link 
            to={`/shop/${shop._id}`}
            target="_blank"
            className="btn btn-secondary flex-1 text-sm py-2 text-center"
          >
            View Public
          </Link>
        </div>
        
        <button
          onClick={onSelectForAnalytics}
          className="btn btn-secondary w-full text-sm py-2"
        >
          View Analytics
        </button>
      </div>

      {showQueueModal && (
        <QueueManagementModal
          shop={shop}
          queues={shopQueues || []}
          onClose={() => setShowQueueModal(false)}
        />
      )}
    </div>
  );
};

const QueueManagementModal = ({ shop, queues, onClose }) => {
  const [newQueue, setNewQueue] = useState({
    name: '',
    description: '',
    maxCapacity: 20,
    estimatedServiceTime: 15
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Queues - {shop.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Current Queues</h3>
              {queues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⚪</div>
                  <p>No queues created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queues.map((queue) => (
                    <div key={queue._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{queue.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          queue.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {queue.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{queue.description}</p>
                      <div className="text-xs text-gray-500">
                        Max: {queue.maxCapacity} • Service: {queue.estimatedServiceTime}min
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Link 
                          to={`/queue/${queue._id}/display`}
                          target="_blank"
                          className="btn btn-secondary text-xs py-1 px-2"
                        >
                          Display
                        </Link>
                        <button className="btn btn-primary text-xs py-1 px-2">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Create New Queue</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Queue Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Main Queue, VIP Service"
                    value={newQueue.name}
                    onChange={(e) => setNewQueue({...newQueue, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows="2"
                    placeholder="Brief description of this queue..."
                    value={newQueue.description}
                    onChange={(e) => setNewQueue({...newQueue, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      max="100"
                      value={newQueue.maxCapacity}
                      onChange={(e) => setNewQueue({...newQueue, maxCapacity: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Time (min)
                    </label>
                    <input
                      type="number"
                      className="input"
                      min="5"
                      max="120"
                      value={newQueue.estimatedServiceTime}
                      onChange={(e) => setNewQueue({...newQueue, estimatedServiceTime: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  Create Queue
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { shops, analytics } from '../utils/api';
import CreateShopModal from '../components/CreateShopModal';
import ShopCard from '../components/ShopCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const { data: userShops, isLoading } = useQuery(
    ['shops', 'my-shops'],
    () => shops.getMyShops().then(res => res.data),
    {
      enabled: user?.role === 'shop_owner'
    }
  );

  if (user?.role !== 'shop_owner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Account</h2>
          <p className="text-gray-600 mb-6">
            Customer accounts don't have access to the dashboard. Shop owners can manage their queues and bookings here.
          </p>
          <div className="space-x-4">
            <a href="/" className="btn btn-primary">
              Find a Shop to Book
            </a>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Add New Shop
              </button>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : !userShops || userShops.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">🏪</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Shops Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first shop. Set up queues, manage bookings, and provide a better experience for your customers.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Your First Shop
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Shops</h2>
                <div className="flex items-center space-x-4">
                  {selectedShop && (
                    <select
                      value={selectedShop}
                      onChange={(e) => setSelectedShop(e.target.value)}
                      className="input"
                    >
                      <option value="">Select shop for analytics</option>
                      {userShops.map((shop) => (
                        <option key={shop._id} value={shop._id}>
                          {shop.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userShops.map((shop) => (
                  <ShopCard 
                    key={shop._id} 
                    shop={shop}
                    onSelectForAnalytics={() => setSelectedShop(shop._id)}
                  />
                ))}
              </div>
            </div>

            {selectedShop && (
              <div className="mb-8">
                <AnalyticsDashboard shopId={selectedShop} />
              </div>
            )}

            {!selectedShop && userShops.length > 0 && (
              <div className="card text-center">
                <h3 className="text-lg font-bold mb-4">Quick Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Select a shop from the cards above to view detailed analytics and insights.
                </p>
                <div className="flex justify-center space-x-2">
                  {userShops.slice(0, 3).map((shop) => (
                    <button
                      key={shop._id}
                      onClick={() => setSelectedShop(shop._id)}
                      className="btn btn-secondary text-sm"
                    >
                      View {shop.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateShopModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload(); // Simple refresh to update the shops list
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
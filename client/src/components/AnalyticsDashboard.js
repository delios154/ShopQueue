import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { analytics } from '../utils/api';

const AnalyticsDashboard = ({ shopId }) => {
  const [period, setPeriod] = useState('7');

  const { data: dashboardData, isLoading } = useQuery(
    ['analytics', shopId, 'dashboard', period],
    () => analytics.getDashboard(shopId, period).then(res => res.data),
    { enabled: !!shopId }
  );

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { summary, charts, insights } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Analytics Overview</h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-1">
              {summary.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {summary.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {summary.averageWaitTime}
            </div>
            <div className="text-sm text-gray-600">Avg Wait (min)</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-1">
              {summary.averageRating}
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Bookings by Day</h4>
            <div className="space-y-2">
              {charts.bookingsByDay.map((day, index) => {
                const maxBookings = Math.max(...charts.bookingsByDay.map(d => d.bookings));
                const percentage = maxBookings > 0 ? (day.bookings / maxBookings) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-primary-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-sm font-medium text-right">
                      {day.bookings}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Peak Hours</h4>
            <div className="space-y-2">
              {charts.peakHours.slice(0, 6).map((hour, index) => {
                const maxCount = Math.max(...charts.peakHours.map(h => h.count));
                const percentage = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-12 text-sm text-gray-600">
                      {hour.hour}:00
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-sm font-medium text-right">
                      {hour.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-lg font-medium mb-3">Quick Stats</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">{summary.completedBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cancelled:</span>
              <span className="font-medium text-red-600">{summary.cancelledBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">No-shows:</span>
              <span className="font-medium text-orange-600">{summary.noShowBookings}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-lg font-medium mb-3">Insights</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Busiest day:</span>
              <div className="font-medium">
                {insights.busiestDay ? 
                  new Date(insights.busiestDay.date).toLocaleDateString('en-US', { weekday: 'long' })
                  : 'No data'
                }
              </div>
            </div>
            <div>
              <span className="text-gray-600">Peak hour:</span>
              <div className="font-medium">
                {insights.busiestHour ? `${insights.busiestHour.hour}:00` : 'No data'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-lg font-medium mb-3">Customer Feedback</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1">
              {summary.averageRating}/5
            </div>
            <div className="text-sm text-gray-600 mb-2">Average Rating</div>
            <div className="text-xs text-gray-500">
              Based on {insights.feedbackCount} reviews
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
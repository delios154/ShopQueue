import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { feedback } from '../utils/api';
import toast from 'react-hot-toast';

const Feedback = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rating: 5,
    serviceRating: 5,
    waitTimeRating: 5,
    comments: '',
    wouldRecommend: true
  });

  const { data: feedbackForm, isLoading } = useQuery(
    ['feedback', 'form', bookingId],
    () => feedback.getForm(bookingId).then(res => res.data)
  );

  const submitFeedbackMutation = useMutation(
    (feedbackData) => feedback.create(feedbackData),
    {
      onSuccess: () => {
        toast.success('Thank you for your feedback!');
        navigate('/');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit feedback');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const feedbackData = {
      shopId: feedbackForm.shop.id,
      bookingId: feedbackForm.booking.id,
      ...formData
    };

    submitFeedbackMutation.mutate(feedbackData);
  };

  const StarRating = ({ value, onChange, label }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`text-2xl transition-colors ${
                star <= value ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {value === 1 && 'Poor'}
          {value === 2 && 'Fair'}
          {value === 3 && 'Good'}
          {value === 4 && 'Very Good'}
          {value === 5 && 'Excellent'}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!feedbackForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Feedback Not Available</h1>
          <p className="text-gray-600 mb-6">
            This feedback form is not available. The booking may not be completed yet or feedback has already been submitted.
          </p>
          <a href="/" className="btn btn-primary">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div 
            className="px-8 py-6 text-white"
            style={{ backgroundColor: feedbackForm.shop.branding?.primaryColor || '#3B82F6' }}
          >
            <h1 className="text-2xl font-bold mb-2">How was your experience?</h1>
            <p className="opacity-90">
              We'd love to hear about your visit to {feedbackForm.shop.name}
            </p>
          </div>

          {/* Booking Details */}
          <div className="px-8 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-gray-600">Queue #</span>
                <span className="font-bold ml-1">{feedbackForm.booking.queueNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Service:</span>
                <span className="font-medium ml-1">{feedbackForm.booking.service}</span>
              </div>
              <div>
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium ml-1">{feedbackForm.booking.customer.name}</span>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <StarRating
              value={formData.rating}
              onChange={(value) => setFormData({...formData, rating: value})}
              label="Overall Experience"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <StarRating
                value={formData.serviceRating}
                onChange={(value) => setFormData({...formData, serviceRating: value})}
                label="Service Quality"
              />

              <StarRating
                value={formData.waitTimeRating}
                onChange={(value) => setFormData({...formData, waitTimeRating: value})}
                label="Wait Time"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (optional)
              </label>
              <textarea
                rows="4"
                className="input"
                placeholder="Tell us more about your experience..."
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
              />
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  checked={formData.wouldRecommend}
                  onChange={(e) => setFormData({...formData, wouldRecommend: e.target.checked})}
                />
                <span className="text-sm font-medium text-gray-700">
                  I would recommend this shop to others
                </span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary flex-1"
              >
                Skip Feedback
              </button>
              <button
                type="submit"
                disabled={submitFeedbackMutation.isLoading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitFeedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Your feedback helps {feedbackForm.shop.name} improve their service quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
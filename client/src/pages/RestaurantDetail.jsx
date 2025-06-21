import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    images: []
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/restaurants/${id}`);
        setRestaurant(response.data);
        await fetchReviews();
      } catch (error) {
        toast.error('Failed to load restaurant details');
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reviews/restaurant/${id}`);
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/reviews/restaurant/${id}`, reviewForm, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      toast.success('Review added successfully');
      setReviewForm({ rating: 5, comment: '', images: [] });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      toast.error('Please login to like reviews');
      navigate('/login');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/reviews/${reviewId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to like review');
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      toast.success('Restaurant deleted successfully');
      navigate('/restaurants');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete restaurant');
    }
  };

  const handleEditClick = () => {
    navigate(`/edit-restaurant/${id}`);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {restaurant && (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <img
              src={restaurant.images[0] || 'https://via.placeholder.com/800x400'}
              alt={restaurant.name}
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                  <p className="text-gray-600 mt-2">{restaurant.location}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-100 text-blue-800 text-lg font-medium px-3 py-1 rounded">
                    {restaurant.rating.toFixed(1)} ★
                  </span>
                  {user?.isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteRestaurant}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mt-4">{restaurant.description}</p>
            </div>
          </div>

          {/* Review Form */}
          {user && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Write a Review</h2>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rating
                  </label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} {rating === 1 ? 'Star' : 'Stars'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Comment
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{review.user.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-gray-600">{review.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLikeReview(review._id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                          review.likes.includes(user?._id)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span>❤</span>
                        <span>{review.likes.length}</span>
                      </button>
                      {user?.isAdmin && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-4 flex space-x-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-gray-500 text-sm mt-4">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDetail;
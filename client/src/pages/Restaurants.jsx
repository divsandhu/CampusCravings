import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/restaurants`);
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
  
    return () => clearTimeout(timer);
  }, [searchTerm]);
  

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );
  

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a237e]">CampusCravings</h1>
        <p className="text-gray-600 mt-2">Discover the best food around Chandigarh University</p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search restaurants by name or location..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48">
              <img
                src={restaurant.images && restaurant.images.length > 0 ? restaurant.images[0] : 'https://via.placeholder.com/400x300?text=Restaurant'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-[#1a237e] text-white px-3 py-1 rounded-full">
                {restaurant.rating ? `${restaurant.rating.toFixed(1)} ★` : 'New'}
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-4">{restaurant.location}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {restaurant.reviewCount || 0} reviews
                </span>
                <Link
                  to={`/restaurants/${restaurant._id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a237e] hover:bg-[#283593]"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center mt-8 text-gray-600">
          No restaurants found matching your search.
        </div>
      )}
    </div>
  );
};

export default Restaurants;
import Restaurant from '../models/restaurant.js';
import Review from '../models/review.js';

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res) => {
  try {
    // Get all restaurants
    const restaurants = await Restaurant.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get review counts for all restaurants
    const reviewCounts = await Review.aggregate([
      { $group: { _id: '$restaurant', count: { $sum: 1 } } }
    ]);
    const reviewCountMap = {};
    reviewCounts.forEach(rc => {
      reviewCountMap[rc._id.toString()] = rc.count;
    });

    // Add reviewCount to each restaurant
    const restaurantsWithReviewCount = restaurants.map(r => {
      const obj = r.toObject();
      obj.reviewCount = reviewCountMap[r._id.toString()] || 0;
      return obj;
    });

    res.json(restaurantsWithReviewCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private
export const createRestaurant = async (req, res) => {
  try {
    const { name, location, description, images } = req.body;
    
    const restaurant = await Restaurant.create({
      name,
      location,
      description,
      images,
      createdBy: req.user._id 
    });
    
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is the creator or admin
    const isAdmin = req.user.email === process.env.ADMIN_EMAIL;
    if (restaurant.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is the creator or admin
    const isAdmin = req.user.email === process.env.ADMIN_EMAIL;
    if (restaurant.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await restaurant.deleteOne();
    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
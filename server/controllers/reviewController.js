import Review from '../models/review.js';
import Restaurant from '../models/restaurant.js';

// @desc    Get all reviews for a restaurant
// @route   GET /api/restaurants/:restaurantId/reviews
// @access  Public
export const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/restaurants/:restaurantId/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const restaurantId = req.params.restaurantId;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user has already reviewed this restaurant
    const existingReview = await Review.findOne({
      restaurant: restaurantId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant' });
    }

    const review = await Review.create({
      restaurant: restaurantId,
      user: req.user._id,
      rating,
      comment,
      images,
      createdBy: req.user._id
    });

    // Update restaurant's average rating
    const allReviews = await Review.find({ restaurant: restaurantId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    restaurant.rating = avgRating;
    await restaurant.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the creator
    if (review.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Update restaurant's average rating
    const restaurant = await Restaurant.findById(review.restaurant);
    const allReviews = await Review.find({ restaurant: review.restaurant });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    restaurant.rating = avgRating;
    await restaurant.save();

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the creator
    if (review.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await review.deleteOne();

    // Update restaurant's average rating
    const restaurant = await Restaurant.findById(review.restaurant);
    const allReviews = await Review.find({ restaurant: review.restaurant });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length 
      : 0;
    restaurant.rating = avgRating;
    await restaurant.save();

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike a review
// @route   PUT /api/reviews/:id/like
// @access  Private
export const likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const likeIndex = review.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      // Like the review
      review.likes.push(req.user._id);
    } else {
      // Unlike the review
      review.likes.splice(likeIndex, 1);
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 
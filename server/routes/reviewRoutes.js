import express from 'express';
import {
  getRestaurantReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all reviews for a restaurant
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Create a review for a restaurant
router.post('/restaurant/:restaurantId', protect, createReview);

// Update, delete, and like a review
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Like/Unlike a review
router.put('/:id/like', protect, likeReview);

export default router; 
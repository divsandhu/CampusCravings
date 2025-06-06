import mongoose from 'mongoose';
import User from './users.js';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
restaurantSchema.pre('save', async function(next) {
  try {
    this.updatedAt = Date.now();
    
    // Check if this is a new restaurant
    if (this.isNew) {
      const creator = await User.findById(this.createdBy);
      if (!creator || creator.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Only admin can create restaurants');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant; 
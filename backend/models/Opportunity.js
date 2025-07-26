const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Date must be in the future'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organization is required']
  },
  volunteersApplied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxVolunteers: {
    type: Number,
    default: null,
    min: [1, 'Maximum volunteers must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['education', 'healthcare', 'environment', 'community', 'animals', 'other'],
    default: 'other'
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['1-2 hours', '3-5 hours', '6-8 hours', 'Full day', 'Multiple days']
  }
}, {
  timestamps: true
});

// Index for better query performance
opportunitySchema.index({ location: 1, date: 1, isActive: 1 });
opportunitySchema.index({ createdBy: 1 });

// Virtual for checking if opportunity is full
opportunitySchema.virtual('isFull').get(function() {
  if (!this.maxVolunteers) return false;
  return this.volunteersApplied.length >= this.maxVolunteers;
});

// Ensure virtuals are included in JSON output
opportunitySchema.set('toJSON', { virtuals: true });

// Add pagination plugin
opportunitySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Opportunity', opportunitySchema); 
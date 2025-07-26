const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const applicationSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Volunteer ID is required']
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: [true, 'Opportunity ID is required']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewMessage: {
    type: String,
    trim: true,
    maxlength: [300, 'Review message cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Compound index to ensure one application per volunteer per opportunity
applicationSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });

// Index for better query performance
applicationSchema.index({ volunteerId: 1, status: 1 });
applicationSchema.index({ opportunityId: 1, status: 1 });

// Pre-save middleware to check if opportunity exists and is active
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Opportunity = mongoose.model('Opportunity');
    const opportunity = await Opportunity.findById(this.opportunityId);
    
    if (!opportunity) {
      return next(new Error('Opportunity not found'));
    }
    
    if (!opportunity.isActive) {
      return next(new Error('Opportunity is not active'));
    }
    
    if (opportunity.isFull) {
      return next(new Error('Opportunity is full'));
    }
  }
  next();
});

// Method to update review timestamp when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = new Date();
  }
  next();
});

// Add pagination plugin
applicationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Application', applicationSchema); 
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

// Get all opportunities (public)
const getAllOpportunities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      category, 
      date,
      search 
    } = req.query;

    const query = { isActive: true };

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date (opportunities after this date)
    if (date) {
      query.date = { $gte: new Date(date) };
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'createdBy',
        select: 'name location'
      },
      sort: { date: 1 }
    };

    const opportunities = await Opportunity.paginate(query, options);

    res.json({
      opportunities: opportunities.docs,
      pagination: {
        currentPage: opportunities.page,
        totalPages: opportunities.totalPages,
        totalDocs: opportunities.totalDocs,
        hasNextPage: opportunities.hasNextPage,
        hasPrevPage: opportunities.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities' });
  }
};

// Get single opportunity
const getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('createdBy', 'name location bio')
      .populate('volunteersApplied', 'name email');

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ opportunity });
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ message: 'Failed to fetch opportunity' });
  }
};

// Create new opportunity (organizations only)
const createOpportunity = async (req, res) => {
  try {
    const opportunityData = {
      ...req.body,
      createdBy: req.user._id
    };

    const opportunity = new Opportunity(opportunityData);
    await opportunity.save();

    await opportunity.populate('createdBy', 'name location');

    res.status(201).json({
      message: 'Opportunity created successfully',
      opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Failed to create opportunity' });
  }
};

// Update opportunity (organization owner only)
const updateOpportunity = async (req, res) => {
  try {
    const { title, description, location, date, category, duration, maxVolunteers, isActive } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (location) updates.location = location;
    if (date) updates.date = date;
    if (category) updates.category = category;
    if (duration) updates.duration = duration;
    if (maxVolunteers !== undefined) updates.maxVolunteers = maxVolunteers;
    if (isActive !== undefined) updates.isActive = isActive;

    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name location');

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ message: 'Failed to update opportunity' });
  }
};

// Delete opportunity (organization owner only)
const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Delete related applications
    await Application.deleteMany({ opportunityId: req.params.id });

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ message: 'Failed to delete opportunity' });
  }
};

// Get opportunities created by the logged-in organization
const getMyOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const opportunities = await Opportunity.paginate(
      { createdBy: req.user._id },
      options
    );

    res.json({
      opportunities: opportunities.docs,
      pagination: {
        currentPage: opportunities.page,
        totalPages: opportunities.totalPages,
        totalDocs: opportunities.totalDocs,
        hasNextPage: opportunities.hasNextPage,
        hasPrevPage: opportunities.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get my opportunities error:', error);
    res.status(500).json({ message: 'Failed to fetch your opportunities' });
  }
};

// Apply to opportunity (volunteers only)
const applyToOpportunity = async (req, res) => {
  try {
    const { message } = req.body;
    const opportunityId = req.params.id;

    // Check if already applied
    const existingApplication = await Application.findOne({
      volunteerId: req.user._id,
      opportunityId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this opportunity' });
    }

    // Create application
    const application = new Application({
      volunteerId: req.user._id,
      opportunityId,
      message
    });

    await application.save();

    // Add volunteer to opportunity's volunteersApplied array
    await Opportunity.findByIdAndUpdate(
      opportunityId,
      { $addToSet: { volunteersApplied: req.user._id } }
    );

    await application.populate('volunteerId', 'name email');
    await application.populate('opportunityId', 'title');

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply to opportunity error:', error);
    if (error.message.includes('Opportunity not found')) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    if (error.message.includes('not active')) {
      return res.status(400).json({ message: 'Opportunity is not active' });
    }
    if (error.message.includes('full')) {
      return res.status(400).json({ message: 'Opportunity is full' });
    }
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

module.exports = {
  getAllOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  applyToOpportunity
}; 
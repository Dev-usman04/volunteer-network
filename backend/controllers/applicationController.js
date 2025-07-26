const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');

// Get applications for a volunteer
const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { volunteerId: req.user._id };
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'opportunityId',
        select: 'title description location date category duration createdBy',
        populate: {
          path: 'createdBy',
          select: 'name location'
        }
      },
      sort: { appliedAt: -1 }
    };

    const applications = await Application.paginate(query, options);

    res.json({
      applications: applications.docs,
      pagination: {
        currentPage: applications.page,
        totalPages: applications.totalPages,
        totalDocs: applications.totalDocs,
        hasNextPage: applications.hasNextPage,
        hasPrevPage: applications.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Get applications for an opportunity (organization only)
const getOpportunityApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const opportunityId = req.params.opportunityId;

    // Verify the opportunity belongs to the logged-in organization
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view applications for your own opportunities.' });
    }

    const query = { opportunityId };
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'volunteerId',
        select: 'name email location bio'
      },
      sort: { appliedAt: -1 }
    };

    const applications = await Application.paginate(query, options);

    res.json({
      applications: applications.docs,
      pagination: {
        currentPage: applications.page,
        totalPages: applications.totalPages,
        totalDocs: applications.totalDocs,
        hasNextPage: applications.hasNextPage,
        hasPrevPage: applications.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get opportunity applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Review application (organization only)
const reviewApplication = async (req, res) => {
  try {
    const { status, reviewMessage } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId)
      .populate('opportunityId', 'createdBy title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the opportunity belongs to the logged-in organization
    if (application.opportunityId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only review applications for your own opportunities.' });
    }

    // Update application
    application.status = status;
    if (reviewMessage) {
      application.reviewMessage = reviewMessage;
    }
    application.reviewedAt = new Date();

    await application.save();

    await application.populate('volunteerId', 'name email');
    await application.populate('opportunityId', 'title');

    res.json({
      message: 'Application reviewed successfully',
      application
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ message: 'Failed to review application' });
  }
};

// Withdraw application (volunteer only)
const withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the application belongs to the logged-in volunteer
    if (application.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only withdraw your own applications.' });
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw application that has already been reviewed' });
    }

    // Remove volunteer from opportunity's volunteersApplied array
    await Opportunity.findByIdAndUpdate(
      application.opportunityId,
      { $pull: { volunteersApplied: req.user._id } }
    );

    // Delete the application
    await Application.findByIdAndDelete(applicationId);

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Failed to withdraw application' });
  }
};

// Get application statistics for organization
const getApplicationStats = async (req, res) => {
  try {
    const opportunityId = req.params.opportunityId;

    // Verify the opportunity belongs to the logged-in organization
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view stats for your own opportunities.' });
    }

    const stats = await Application.aggregate([
      { $match: { opportunityId: opportunity._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
      statsObject.total += stat.count;
    });

    res.json({ stats: statsObject });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ message: 'Failed to fetch application statistics' });
  }
};

module.exports = {
  getMyApplications,
  getOpportunityApplications,
  reviewApplication,
  withdrawApplication,
  getApplicationStats
}; 
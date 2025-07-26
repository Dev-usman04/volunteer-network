const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { 
  authenticateToken, 
  requireOrganization, 
  requireVolunteer 
} = require('../middleware/auth');
const { validateApplicationReview } = require('../middleware/validation');

// Volunteer routes
// GET /api/applications/my - Get volunteer's applications
router.get('/my', 
  authenticateToken, 
  requireVolunteer, 
  applicationController.getMyApplications
);

// DELETE /api/applications/:id/withdraw - Withdraw application (volunteer only)
router.delete('/:id/withdraw', 
  authenticateToken, 
  requireVolunteer, 
  applicationController.withdrawApplication
);

// Organization routes
// GET /api/applications/opportunity/:opportunityId - Get applications for an opportunity
router.get('/opportunity/:opportunityId', 
  authenticateToken, 
  requireOrganization, 
  applicationController.getOpportunityApplications
);

// PUT /api/applications/:id/review - Review application (organization only)
router.put('/:id/review', 
  authenticateToken, 
  requireOrganization, 
  validateApplicationReview, 
  applicationController.reviewApplication
);

// GET /api/applications/opportunity/:opportunityId/stats - Get application statistics
router.get('/opportunity/:opportunityId/stats', 
  authenticateToken, 
  requireOrganization, 
  applicationController.getApplicationStats
);

module.exports = router; 
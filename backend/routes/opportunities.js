const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { 
  authenticateToken, 
  requireOrganization, 
  requireVolunteer,
  requireOwnership 
} = require('../middleware/auth');
const { validateOpportunity, validateApplication } = require('../middleware/validation');

// Public routes
// GET /api/opportunities - Get all opportunities (public)
router.get('/', opportunityController.getAllOpportunities);

// GET /api/opportunities/:id - Get single opportunity (public)
router.get('/:id', opportunityController.getOpportunity);

// Protected routes
// POST /api/opportunities - Create new opportunity (organizations only)
router.post('/', 
  authenticateToken, 
  requireOrganization, 
  validateOpportunity, 
  opportunityController.createOpportunity
);

// PUT /api/opportunities/:id - Update opportunity (organization owner only)
router.put('/:id', 
  authenticateToken, 
  requireOrganization, 
  requireOwnership, 
  validateOpportunity, 
  opportunityController.updateOpportunity
);

// DELETE /api/opportunities/:id - Delete opportunity (organization owner only)
router.delete('/:id', 
  authenticateToken, 
  requireOrganization, 
  requireOwnership, 
  opportunityController.deleteOpportunity
);

// GET /api/opportunities/my/list - Get opportunities created by organization
router.get('/my/list', 
  authenticateToken, 
  requireOrganization, 
  opportunityController.getMyOpportunities
);

// POST /api/opportunities/:id/apply - Apply to opportunity (volunteers only)
router.post('/:id/apply', 
  authenticateToken, 
  requireVolunteer, 
  validateApplication, 
  opportunityController.applyToOpportunity
);

module.exports = router; 
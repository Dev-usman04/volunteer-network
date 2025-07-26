const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check if user is an organization
const requireOrganization = (req, res, next) => {
  if (req.user.role !== 'organization') {
    return res.status(403).json({ message: 'Access denied. Organization role required.' });
  }
  next();
};

// Middleware to check if user is a volunteer
const requireVolunteer = (req, res, next) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({ message: 'Access denied. Volunteer role required.' });
  }
  next();
};

// Middleware to check if user owns the resource (for opportunities)
const requireOwnership = async (req, res, next) => {
  try {
    const Opportunity = require('../models/Opportunity');
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own opportunities.' });
    }
    
    req.opportunity = opportunity;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authenticateToken,
  requireOrganization,
  requireVolunteer,
  requireOwnership
}; 
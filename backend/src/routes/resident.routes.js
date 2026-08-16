const express = require('express');
const router = express.Router();
const residentController = require('../controllers/resident.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// All resident routes require authentication and the resident role
router.use(authenticate);
router.use(authorizeRoles('resident', 'admin')); // Allow admin for testing/fallback

// Profile
router.put('/profile', residentController.updateProfile);

// Dashboard
router.get('/dashboard', residentController.getDashboard);

// Reports
router.post('/reports', residentController.submitReport);

// Credits
router.get('/credits', residentController.getCredits);
router.post('/credits/redeem', residentController.redeemCredits);

// Learning
router.get('/learning', residentController.getLearning);
router.post('/learning/video', residentController.markVideoWatched);
router.post('/learning/quiz', residentController.markQuizPassed);

module.exports = router;

const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('worker', 'admin'));

router.get('/dashboard', workerController.getDashboard);
router.put('/pickups/:id/status', workerController.updatePickupStatus);
router.put('/pickups/:id/evidence', workerController.updateEvidence);
router.put('/notifications/:id/read', workerController.markNotificationRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);
router.use(authorizeRoles('worker', 'admin'));

router.get('/dashboard', workerController.getDashboard);
router.patch('/pickups/:id/status', upload.single('evidence'), workerController.updatePickupStatus);
router.put('/notifications/:id/read', workerController.markNotificationRead);

module.exports = router;

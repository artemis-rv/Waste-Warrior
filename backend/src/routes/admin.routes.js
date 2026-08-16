const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/ban', adminController.updateUserBan);
router.get('/workers', adminController.getWorkers);
router.get('/reports/pending', adminController.getPendingReports);
router.post('/pickups/assign', adminController.assignPickup);
router.get('/collection-points', adminController.getCollectionPoints);
router.post('/collection-points', adminController.upsertCollectionPoint);
router.put('/collection-points/:id', adminController.upsertCollectionPoint);
router.delete('/collection-points/:id', adminController.deleteCollectionPoint);
router.get('/reports/export', adminController.exportReports);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/verify', adminController.verifyReport);
router.put('/reports/:id/escalate', adminController.escalateReport);
router.get('/kits', adminController.getKits);
router.post('/kits', adminController.createKit);
router.put('/kits/:id/deliver', adminController.markKitDelivered);
router.get('/learning', adminController.getLearningProgress);
router.delete('/learning/:userId/reset', adminController.resetLearningProgress);
router.get('/credits/logs', adminController.getCreditLogs);
router.post('/credits', adminController.addCreditLog);

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const storageService = require('../services/storage.service');

// Protect evidence route
router.get('/evidence/:filename', authenticate, authorizeRoles('worker', 'admin'), async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Admin has full access
    if (req.user.role !== 'admin') {
      const isAuthorized = await storageService.authorizeWorkerEvidence(req.user.id, filename);
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this evidence' });
      }
    }

    const filePath = storageService.getLocalFilePath('evidence', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const workerService = require('../services/worker.service');
const storageService = require('../services/storage.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await workerService.getDashboardData(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.updatePickupStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, segregation_done } = req.body;
    const workerId = req.user.id;

    let updated = await workerService.updatePickupStatus(workerId, id, status, segregation_done);

    if (req.file) {
      const evidenceData = {
        evidence_photo_url: storageService.getFileUrl('evidence', req.file.filename),
        evidence_timestamp: new Date().toISOString(),
        evidence_lat: req.body.evidenceLat ? parseFloat(req.body.evidenceLat) : null,
        evidence_lng: req.body.evidenceLng ? parseFloat(req.body.evidenceLng) : null
      };
      updated = await workerService.updateEvidence(workerId, id, evidenceData);
    }
    
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// updateEvidence has been merged into updatePickupStatus for FormData

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workerService.markNotificationRead(req.user.id, id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

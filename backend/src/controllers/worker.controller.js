const workerService = require('../services/worker.service');

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
    const updated = await workerService.updatePickupStatus(req.user.id, id, status, segregation_done);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evidenceData = req.body;
    const updated = await workerService.updateEvidence(req.user.id, id, evidenceData);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workerService.markNotificationRead(req.user.id, id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

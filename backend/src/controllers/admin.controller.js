const adminService = require('../services/admin.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await adminService.updateUserRole(id, role);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUserBan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_banned } = req.body;
    const updated = await adminService.updateUserBan(id, is_banned);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getWorkers = async (req, res, next) => {
  try {
    const workers = await adminService.getWorkers();
    res.json(workers);
  } catch (error) {
    next(error);
  }
};

exports.getPendingReports = async (req, res, next) => {
  try {
    const reports = await adminService.getPendingReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.assignPickup = async (req, res, next) => {
  try {
    const { reportId, workerId } = req.body;
    if (!reportId || !workerId) throw new Error('reportId and workerId are required');
    const updated = await adminService.assignPickup(reportId, workerId);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCollectionPoints = async (req, res, next) => {
  try {
    const points = await adminService.getCollectionPoints();
    res.json(points);
  } catch (error) {
    next(error);
  }
};

exports.upsertCollectionPoint = async (req, res, next) => {
  try {
    const point = await adminService.upsertCollectionPoint(req.body);
    res.json(point);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCollectionPoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteCollectionPoint(id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.getKits = async (req, res, next) => {
  try {
    const kits = await adminService.getKits();
    res.json(kits);
  } catch (error) {
    next(error);
  }
};

exports.getLearningProgress = async (req, res, next) => {
  try {
    const data = await adminService.getLearningProgress();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.resetLearningProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await adminService.resetLearningProgress(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.escalateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { penaltyAmount } = req.body;
    if (!penaltyAmount) throw new Error('penaltyAmount is required');
    const updated = await adminService.escalateReport(id, parseInt(penaltyAmount));
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.exportReports = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const data = await adminService.getExportData(type, startDate, endDate);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.verifyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_verified, verification_notes } = req.body;
    const updated = await adminService.verifyReport(id, is_verified, verification_notes);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createKit = async (req, res, next) => {
  try {
    const kit = await adminService.createKit(req.body);
    res.json(kit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markKitDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await adminService.markKitDelivered(id);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCreditLogs = async (req, res, next) => {
  try {
    const logs = await adminService.getCreditLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

exports.addCreditLog = async (req, res, next) => {
  try {
    const { userId, amount, reason, type } = req.body;
    const log = await adminService.addCreditLog(userId, parseInt(amount), reason, type);
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

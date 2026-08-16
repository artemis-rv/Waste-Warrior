const residentService = require('../services/resident.service');

const updateProfile = async (req, res) => {
  try {
    const user = await residentService.updateProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const data = await residentService.getDashboard(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await residentService.getNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const data = await residentService.getLeaderboard(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitReport = async (req, res) => {
  try {
    const data = await residentService.submitReport(req.user.id, req.body);
    res.status(201).json({ message: 'Report submitted', ...data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCredits = async (req, res) => {
  try {
    const data = await residentService.getCredits(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const redeemCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    const redeem = await residentService.redeemCredits(req.user.id, amount);
    res.status(201).json({ message: 'Code generated', code: redeem.code, redeem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getLearning = async (req, res) => {
  try {
    const data = await residentService.getLearning(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markVideoWatched = async (req, res) => {
  try {
    const { moduleId } = req.body;
    const progress = await residentService.markVideoWatched(req.user.id, moduleId);
    res.json({ message: 'Video marked as watched', progress });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const markQuizPassed = async (req, res, next) => {
  try {
    const { moduleId, score } = req.body;
    const result = await residentService.markQuizPassed(req.user.id, moduleId, parseInt(score));
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getQuizQuestions = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const questions = await residentService.getQuizQuestions(moduleId);
    res.json(questions.map(q => ({
      ...q,
      module_id: q.moduleId,
      question_text: q.questionText,
      correct_answer: q.correctAnswer
    })));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  getDashboard,
  getNotifications,
  getLeaderboard,
  submitReport,
  getCredits,
  redeemCredits,
  getLearning,
  markVideoWatched,
  markQuizPassed,
  getQuizQuestions
};

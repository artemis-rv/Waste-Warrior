const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// 1. REPORTS ROUTES
// ==========================================

// GET /api/reports - Fetch reports for logged in user or worker or admin
router.get('/reports', authenticate, async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    let reports = [];

    if (role === 'admin') {
      reports = await prisma.report.findMany({
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          assignedWorker: { select: { id: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'worker') {
      reports = await prisma.report.findMany({
        where: { assignedWorkerId: userId },
        include: {
          user: { select: { id: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Resident
      reports = await prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    }

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
});

// POST /api/reports - Create a waste report (Resident)
router.post('/reports', authenticate, async (req, res, next) => {
  try {
    const { title, description, addressText, locationLat, locationLng, photoUrls } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const report = await prisma.$transaction(async (tx) => {
      const createdReport = await tx.report.create({
        data: {
          userId,
          title: title.trim(),
          description: description.trim(),
          addressText: addressText ? addressText.trim() : null,
          locationLat: locationLat ? parseFloat(locationLat) : null,
          locationLng: locationLng ? parseFloat(locationLng) : null,
          photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
          status: 'pending'
        }
      });

      // Award 10 credits for reporting
      await tx.creditsLog.create({
        data: {
          userId,
          amount: 10,
          reason: 'Waste report submitted',
          referenceId: createdReport.id
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: 10 } }
      });

      return createdReport;
    });

    res.status(201).json({ success: true, report, message: 'Report submitted successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reports/:id/status - Update report status (Worker or Admin)
router.patch('/reports/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, segregationDone, evidencePhotoUrl, evidenceLat, evidenceLng, notes } = req.body;

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (segregationDone !== undefined) dataToUpdate.segregationDone = Boolean(segregationDone);
    if (evidencePhotoUrl) {
      dataToUpdate.evidencePhotoUrl = evidencePhotoUrl;
      dataToUpdate.evidenceTimestamp = new Date();
    }
    if (evidenceLat) dataToUpdate.evidenceLat = parseFloat(evidenceLat);
    if (evidenceLng) dataToUpdate.evidenceLng = parseFloat(evidenceLng);
    if (notes) dataToUpdate.workerNotes = notes;
    if (status === 'resolved' || status === 'completed') {
      dataToUpdate.resolvedAt = new Date();
      dataToUpdate.status = 'resolved';
    }

    const updated = await prisma.report.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, report: updated });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. NOTIFICATIONS ROUTES
// ==========================================

// GET /api/notifications
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true }
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. CREDITS & REDEMPTION ROUTES
// ==========================================

// GET /api/credits - History and available balance
router.get('/credits', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [user, logs, redeems] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      }),
      prisma.creditsLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.redeem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    res.json({
      success: true,
      credits: user?.credits || 0,
      logs,
      redeems
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/credits/redeem
router.post('/credits/redeem', authenticate, async (req, res, next) => {
  try {
    const { creditsUsed } = req.body;
    const userId = req.user.id;

    if (!creditsUsed || creditsUsed < 50) {
      return res.status(400).json({ success: false, message: 'Minimum 50 credits required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.credits < creditsUsed) {
        throw new Error('Insufficient credits balance');
      }

      const code = 'WW-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const redeem = await tx.redeem.create({
        data: {
          userId,
          code,
          creditsUsed: parseInt(creditsUsed, 10),
          status: 'active'
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: parseInt(creditsUsed, 10) } }
      });

      await tx.creditsLog.create({
        data: {
          userId,
          amount: -parseInt(creditsUsed, 10),
          reason: `Redeemed ${creditsUsed} credits for discount coupon (${code})`,
          referenceId: redeem.id
        }
      });

      return redeem;
    });

    res.json({ success: true, redeem: result, message: 'Redeem code generated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. LEADERBOARD ROUTES
// ==========================================

// GET /api/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const champions = await prisma.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        fullName: true,
        credits: true,
        role: true,
        isGreenChampion: true,
        createdAt: true,
        _count: {
          select: { reports: true }
        }
      },
      orderBy: { credits: 'desc' },
      take: 20
    });

    const formatted = champions.map((u, idx) => ({
      id: u.id,
      name: u.fullName || 'Anonymous Warrior',
      credits: u.credits,
      rank: idx + 1,
      totalReports: u._count.reports,
      role: u.role,
      isGreenChampion: u.isGreenChampion
    }));

    res.json({ success: true, leaderboard: formatted });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. LEARNING MODULES & CERTIFICATIONS
// ==========================================

// GET /api/learning/modules
router.get('/learning/modules', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [modules, progress, certificates] = await Promise.all([
      prisma.learningModule.findMany({
        orderBy: { orderIndex: 'asc' }
      }),
      prisma.userLearningProgress.findMany({
        where: { userId }
      }),
      prisma.certification.findMany({
        where: { userId }
      })
    ]);

    res.json({ success: true, modules, progress, certificates });
  } catch (err) {
    next(err);
  }
});

// POST /api/learning/progress
router.post('/learning/progress', authenticate, async (req, res, next) => {
  try {
    const { moduleId, isCompleted, progressPercentage } = req.body;
    const userId = req.user.id;

    const result = await prisma.userLearningProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId }
      },
      update: {
        isCompleted: Boolean(isCompleted),
        progressPercentage: progressPercentage || 100,
        completedAt: isCompleted ? new Date() : undefined
      },
      create: {
        userId,
        moduleId,
        isCompleted: Boolean(isCompleted),
        progressPercentage: progressPercentage || 100,
        completedAt: isCompleted ? new Date() : undefined
      }
    });

    res.json({ success: true, progress: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

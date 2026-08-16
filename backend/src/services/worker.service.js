const prisma = require('../config/db');

class WorkerService {
  async getDashboardData(workerId) {
    const [reports, profile, notifications] = await Promise.all([
      prisma.report.findMany({
        where: { assignedWorkerId: workerId },
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.worker.findUnique({
        where: { userId: workerId }
      }),
      prisma.workerNotification.findMany({
        where: { workerId: workerId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    // Map Prisma keys to match frontend expectations (or adjust frontend)
    // Frontend expects `users.full_name`, `users.email`
    const mappedReports = reports.map(r => ({
      ...r,
      users: { full_name: r.user?.fullName, email: r.user?.email }
    }));

    return {
      reports: mappedReports,
      profile,
      notifications
    };
  }

  async updatePickupStatus(workerId, reportId, status, segregationDone) {
    // State machine check
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    if (report.assignedWorkerId !== workerId) {
      throw new Error('Unauthorized: Pickup not assigned to this worker');
    }

    // Allowed transitions: 
    // assigned -> in_progress
    // in_progress -> completed (maps to resolved in Prisma Schema)
    // Wait, the frontend sends 'completed', Prisma schema uses 'resolved'.
    let newStatus = status;
    if (status === 'completed') newStatus = 'resolved';
    
    // Check transitions
    if (report.status === 'resolved' || report.status === 'rejected') {
      throw new Error('Cannot update a completed or rejected pickup');
    }

    const updateData = {
      status: newStatus,
      segregationDone: segregationDone ?? report.segregationDone,
    };

    if (newStatus === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: updateData
    });

    // We must map 'resolved' back to 'completed' for the frontend
    if (updated.status === 'resolved') updated.status = 'completed';

    return updated;
  }

  async updateEvidence(workerId, reportId, evidenceData) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error('Report not found');
    if (report.assignedWorkerId !== workerId) throw new Error('Unauthorized');

    return await prisma.report.update({
      where: { id: reportId },
      data: {
        evidencePhotoUrl: evidenceData.evidence_photo_url,
        evidenceTimestamp: new Date(evidenceData.evidence_timestamp),
        evidenceLat: evidenceData.evidence_lat,
        evidenceLng: evidenceData.evidence_lng,
        status: 'in_progress' // Setting evidence usually moves it to in_progress
      }
    });
  }

  async markNotificationRead(workerId, notificationId) {
    const notification = await prisma.workerNotification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new Error('Notification not found');
    if (notification.workerId !== workerId) throw new Error('Unauthorized');

    return await prisma.workerNotification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }
}

module.exports = new WorkerService();

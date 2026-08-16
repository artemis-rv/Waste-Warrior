const prisma = require('../config/db');

class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalWorkers,
      activeWorkers,
      collectionPoints,
      kitsPending,
      greenChampions,
      reportsPending,
      reportsCompleted,
      totalReports,
      usersForCredits
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'worker' } }),
      prisma.worker.count({ where: { isActive: true } }),
      prisma.collectionPoint.count(),
      prisma.kit.count({ where: { isDelivered: false } }),
      prisma.user.count({ where: { isGreenChampion: true } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.report.count({ where: { status: 'resolved' } }),
      prisma.report.count(),
      prisma.user.aggregate({ _sum: { credits: true } })
    ]);

    return {
      totalUsers,
      totalReports,
      pendingReports: reportsPending,
      completedReports: reportsCompleted,
      totalWorkers,
      activeWorkers,
      collectionPoints,
      totalCredits: usersForCredits._sum.credits || 0,
      greenChampions,
      pendingKits: kitsPending
    };
  }

  async getUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        credits: true,
        isBanned: true,
        createdAt: true
      }
    });
  }

  async updateUserRole(userId, newRole) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
  }

  async updateUserBan(userId, isBanned) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isBanned }
    });
  }

  async getWorkers() {
    // Need users where role = worker, and their active status from `worker` table
    const workers = await prisma.user.findMany({
      where: { role: 'worker' },
      include: {
        worker: true,
        _count: { select: { assignedReports: true } }
      }
    });

    return workers.map(w => ({
      ...w,
      vehicle_id: w.worker?.vehicleId,
      is_active: w.worker?.isActive ?? true,
      current_location_lat: w.worker?.currentLat,
      current_location_lng: w.worker?.currentLng,
      assigned_reports: [{ count: w._count.assignedReports }] // mapping for frontend compatibility
    }));
  }

  async getPendingReports() {
    const reports = await prisma.report.findMany({
      where: { status: { in: ['pending', 'assigned'] } },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    return reports.map(r => ({
      ...r,
      users: { full_name: r.user?.fullName }
    }));
  }

  async assignPickup(reportId, workerId) {
    return await prisma.report.update({
      where: { id: reportId },
      data: {
        assignedWorkerId: workerId,
        status: 'assigned'
      }
    });
  }

  async getCollectionPoints() {
    return await prisma.collectionPoint.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async upsertCollectionPoint(data) {
    if (data.id) {
      return await prisma.collectionPoint.update({
        where: { id: data.id },
        data: {
          name: data.name,
          address: data.address,
          capacity: data.capacity,
          lat: data.location_lat,
          lng: data.location_lng,
          contactPhone: data.contact_phone
        }
      });
    } else {
      return await prisma.collectionPoint.create({
        data: {
          name: data.name,
          address: data.address,
          capacity: data.capacity,
          lat: data.location_lat,
          lng: data.location_lng,
          contactPhone: data.contact_phone
        }
      });
    }
  }

  async deleteCollectionPoint(id) {
    return await prisma.collectionPoint.delete({
      where: { id }
    });
  }

  async getReports() {
    const reports = await prisma.report.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        assignedWorker: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports.map(r => ({
      ...r,
      users: { full_name: r.user?.fullName, email: r.user?.email },
      assigned_worker: { full_name: r.assignedWorker?.fullName }
    }));
  }

  async getKits() {
    return await prisma.kit.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLearningProgress() {
    const [users, modules, progress, certs] = await Promise.all([
      prisma.user.findMany({ select: { id: true, fullName: true, email: true, createdAt: true } }),
      prisma.learningModule.findMany(),
      prisma.userLearningProgress.findMany(),
      prisma.certification.findMany()
    ]);

    // Format for frontend
    const mappedUsers = users.map(u => ({ ...u, full_name: u.fullName }));
    const mappedProgress = progress.map(p => ({ ...p, user_id: p.userId, is_completed: p.isCompleted, updated_at: p.updatedAt }));
    const mappedCerts = certs.map(c => ({ ...c, user_id: c.userId }));

    return { users: mappedUsers, modules, progress: mappedProgress, certs: mappedCerts };
  }

  async resetLearningProgress(userId) {
    return await prisma.userLearningProgress.deleteMany({
      where: { userId }
    });
  }

  async escalateReport(reportId, penaltyAmount) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report || !report.assignedWorkerId) throw new Error('Invalid report or unassigned');

    return await prisma.$transaction(async (tx) => {
      const worker = await tx.user.findUnique({ where: { id: report.assignedWorkerId } });
      const newCredits = Math.max(0, (worker.credits || 0) - penaltyAmount);

      await tx.user.update({
        where: { id: worker.id },
        data: { credits: newCredits }
      });

      await tx.creditAuditLog.create({
        data: {
          userId: worker.id,
          amount: -penaltyAmount,
          reason: `Penalty for failing to complete report: ${report.title}`,
          actionType: 'subtract'
        }
      });

      return await tx.report.update({
        where: { id: reportId },
        data: {
          status: 'escalated',
          assignedWorkerId: null
        }
      });
    });
  }

  async getExportData(type, startDate, endDate) {
    let start = startDate ? new Date(startDate) : new Date('2020-01-01');
    let end = endDate ? new Date(endDate) : new Date();
    // make end date inclusive of the whole day
    end.setHours(23, 59, 59, 999);

    if (type === 'monthly') {
      const reports = await prisma.report.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, title: true, status: true, createdAt: true, resolvedAt: true, user: { select: { fullName: true, email: true } } }
      });
      return reports.map(r => ({
        id: r.id, title: r.title, status: r.status === 'resolved' ? 'completed' : r.status, created_at: r.createdAt, completed_at: r.resolvedAt,
        users: { full_name: r.user?.fullName, email: r.user?.email }
      }));
    } else if (type === 'credits') {
      const logs = await prisma.creditAuditLog.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return logs.map(l => ({
        ...l,
        action_type: l.actionType,
        created_at: l.createdAt,
        users: { full_name: l.user?.fullName, email: l.user?.email }
      }));
    } else if (type === 'resolved') {
      const reports = await prisma.report.findMany({
        where: { status: 'resolved', resolvedAt: { gte: start, lte: end } },
        include: { user: { select: { fullName: true, email: true } }, assignedWorker: { select: { fullName: true } } }
      });
      return reports.map(r => ({
        id: r.id, title: r.title, status: 'completed', created_at: r.createdAt, completed_at: r.resolvedAt, is_verified: r.isVerified,
        users: { full_name: r.user?.fullName, email: r.user?.email },
        worker: { full_name: r.assignedWorker?.fullName }
      }));
    }
    return [];
  }
  async verifyReport(reportId, isVerified, verificationNotes) {
    return await prisma.report.update({
      where: { id: reportId },
      data: {
        isVerified,
        verificationNotes,
        verifiedAt: new Date()
      }
    });
  }

  async createKit(data) {
    return await prisma.kit.create({
      data: {
        name: data.name,
        description: data.description,
        items: data.items,
        assignedTo: data.assigned_to,
        isDelivered: false
      }
    });
  }

  async markKitDelivered(kitId) {
    return await prisma.kit.update({
      where: { id: kitId },
      data: {
        isDelivered: true,
        deliveredAt: new Date()
      }
    });
  }
  async getCreditLogs() {
    return await prisma.creditAuditLog.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    }).then(logs => logs.map(l => ({
      ...l,
      action_type: l.actionType,
      created_at: l.createdAt,
      users: { full_name: l.user?.fullName, email: l.user?.email }
    })));
  }

  async addCreditLog(userId, amount, reason, type) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const newCredits = Math.max(0, (user.credits || 0) + amount);

      await tx.user.update({
        where: { id: userId },
        data: { credits: newCredits }
      });

      return await tx.creditAuditLog.create({
        data: {
          userId,
          amount,
          reason,
          actionType: type
        }
      });
    });
  }
}

module.exports = new AdminService();

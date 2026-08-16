const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ResidentService {
  async updateProfile(userId, data) {
    const { fullName, phone, address } = data;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone,
        address,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        credits: true,
        address: true,
        avatarUrl: true,
        kitReceived: true,
        createdAt: true,
      }
    });
    return user;
  }

  async getDashboard(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const totalReports = await prisma.report.count({ where: { userId } });
    const resolvedReports = await prisma.report.count({ where: { userId, status: 'resolved' } });
    const pendingReports = await prisma.report.count({ where: { userId, status: 'pending' } });

    return {
      stats: {
        totalReports,
        resolvedReports,
        pendingReports,
        totalCredits: user?.credits || 0,
      },
      reports,
      notifications,
    };
  }

  async getNotifications(userId) {
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      count: unreadCount,
      data: notifications,
    };
  }

  async getLeaderboard(userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalReports = await prisma.report.count();
    const totalUsers = await prisma.user.count();
    const monthlyReports = await prisma.report.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    const enrichUsers = async (users) => {
      return Promise.all(
        users.map(async (user) => {
          const reportsCount = await prisma.report.count({ where: { userId: user.id } });
          const userMonthlyReports = await prisma.report.count({
            where: { userId: user.id, createdAt: { gte: startOfMonth } }
          });
          return {
            id: user.id,
            full_name: user.fullName,
            avatar_url: user.avatarUrl,
            credits: user.credits,
            reportsCount,
            monthlyReports: userMonthlyReports,
          };
        })
      );
    };

    const topResidentsRaw = await prisma.user.findMany({
      where: { role: 'resident' },
      orderBy: { credits: 'desc' },
      take: 20,
    });
    const residents = await enrichUsers(topResidentsRaw);

    const topWorkersRaw = await prisma.user.findMany({
      where: { role: 'worker' },
      orderBy: { credits: 'desc' },
      take: 20,
    });
    const workers = await enrichUsers(topWorkersRaw);

    const topChampionsRaw = await prisma.user.findMany({
      orderBy: { credits: 'desc' },
      take: 10,
    });
    const champions = await enrichUsers(topChampionsRaw);

    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
    let currentUserRank = null;
    if (currentUser) {
      const usersWithMoreCredits = await prisma.user.count({
        where: { credits: { gt: currentUser.credits } }
      });
      currentUserRank = usersWithMoreCredits + 1;
    }

    return {
      stats: { totalReports, totalUsers, monthlyReports },
      residents,
      workers,
      champions,
      currentUserRank
    };
  }

  async submitReport(userId, data) {
    const { title, description, address_text, location_lat, location_lng, photo_urls } = data;

    // Use a transaction to create the report, log credits, and update user credits safely
    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          userId,
          title,
          description,
          addressText: address_text,
          locationLat: location_lat,
          locationLng: location_lng,
          photoUrls: photo_urls || [],
          status: 'pending',
        },
      });

      // Award 10 credits for reporting
      const creditLog = await tx.creditsLog.create({
        data: {
          userId,
          amount: 10,
          reason: 'Waste report submitted',
          referenceId: report.id,
        },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: 10 },
        },
      });

      return { report, creditsLog: creditLog, totalCredits: user.credits };
    });

    return result;
  }

  async getCredits(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    const history = await prisma.creditsLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const redeems = await prisma.redeem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      balance: user?.credits || 0,
      history,
      redeems,
    };
  }

  async redeemCredits(userId, amount) {
    if (amount < 50) {
      throw new Error('Minimum 50 credits required for redemption');
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.credits < amount) {
        throw new Error('Insufficient credits');
      }

      const code = `GC${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const redeem = await tx.redeem.create({
        data: {
          userId,
          code,
          creditsUsed: amount,
          status: 'active',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: amount },
        },
      });

      await tx.creditsLog.create({
        data: {
          userId,
          amount: -amount,
          reason: 'Credits redeemed for coupon',
          referenceId: redeem.id,
        },
      });

      return redeem;
    });

    return result;
  }

  async getLearning(userId) {
    const modules = await prisma.learningModule.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    const progress = await prisma.userLearningProgress.findMany({
      where: { userId },
    });

    const certificate = await prisma.certification.findFirst({
      where: { userId },
    });

    return { modules, progress, certificate };
  }

  async markVideoWatched(userId, moduleId) {
    const progress = await prisma.userLearningProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId },
      },
      update: {
        isVideoWatched: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        moduleId,
        isVideoWatched: true,
      },
    });

    return progress;
  }

  async markQuizPassed(userId, moduleId, score) {
    const progress = await prisma.userLearningProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId },
      },
      update: {
        isVideoWatched: true,
        quizScore: score,
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        moduleId,
        isVideoWatched: true,
        quizScore: score,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Check if all modules are complete
    const allModulesCount = await prisma.learningModule.count();
    const completedCount = await prisma.userLearningProgress.count({
      where: { userId, isCompleted: true },
    });

    let certificate = null;
    if (completedCount >= allModulesCount && allModulesCount > 0) {
      const existingCert = await prisma.certification.findFirst({
        where: { userId },
      });
      
      if (!existingCert) {
        certificate = await prisma.certification.create({
          data: {
            userId,
          },
        });
      } else {
        certificate = existingCert;
      }
    }

    return { progress, certificate };
  }
  async getQuizQuestions(moduleId) {
    return await prisma.quizQuestion.findMany({
      where: { moduleId }
    });
  }

  async createCertificate(userId) {
    const allModulesCount = await prisma.learningModule.count();
    const completedCount = await prisma.userLearningProgress.count({
      where: { userId, isCompleted: true },
    });

    if (completedCount >= allModulesCount && allModulesCount > 0) {
      const existingCert = await prisma.certification.findFirst({
        where: { userId },
      });
      
      if (!existingCert) {
        return await prisma.certification.create({
          data: { userId },
        });
      }
      return existingCert;
    }
    throw new Error('Not all modules are completed yet');
  }
}

module.exports = new ResidentService();

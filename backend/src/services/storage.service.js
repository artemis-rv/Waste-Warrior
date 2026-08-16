const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');

class StorageService {
  getFileUrl(category, filename) {
    if (category === 'evidence') {
      return `/api/storage/evidence/${filename}`;
    }
    return `/uploads/${category}/${filename}`;
  }

  getLocalFilePath(category, filename) {
    return path.join(__dirname, `../../uploads/${category}/${filename}`);
  }

  async authorizeWorkerEvidence(workerId, filename) {
    const report = await prisma.report.findFirst({
      where: {
        evidencePhotoUrl: {
          contains: filename
        }
      }
    });

    if (!report) return false;
    return report.assignedWorkerId === workerId;
  }
}

module.exports = new StorageService();

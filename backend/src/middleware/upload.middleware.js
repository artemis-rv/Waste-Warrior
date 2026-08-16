const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const REPORTS_DIR = path.join(UPLOADS_DIR, 'reports');
const EVIDENCE_DIR = path.join(UPLOADS_DIR, 'evidence');

[UPLOADS_DIR, REPORTS_DIR, EVIDENCE_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on the fieldname or the route URL
    if (file.fieldname === 'evidence' || req.originalUrl.includes('/status')) {
      cb(null, EVIDENCE_DIR);
    } else {
      cb(null, REPORTS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    // Format: uuid-timestamp.ext
    cb(null, `${uniqueId}-${timestamp}${ext}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;

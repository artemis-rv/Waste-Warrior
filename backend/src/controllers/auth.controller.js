const { z } = require('zod');
const crypto = require('crypto');
const authService = require('../services/auth.service');
const { generateToken } = require('../utils/jwt');

const COOKIE_NAME = process.env.COOKIE_NAME || 'waste_warrior_token';
const isProduction = process.env.NODE_ENV === 'production';

// Validation Schemas
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().trim().min(1, 'Full name is required'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await authService.findUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await authService.hashPassword(validatedData.password);
    const userId = crypto.randomUUID();

    const user = await authService.createUser({
      id: userId,
      email: validatedData.email,
      passwordHash,
      fullName: validatedData.fullName,
      role: 'resident', // Hardcoded to prevent privilege escalation
    });

    const token = generateToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await authService.findUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await authService.comparePassword(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned or disabled',
      });
    }

    const token = generateToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);

    // Sanitize user before returning
    const { passwordHash, ...sanitizedUser } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: sanitizedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token',
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract email from Google profile',
      });
    }

    const email = payload.email.toLowerCase().trim();
    const fullName = payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Google User';
    const avatarUrl = payload.picture || null;

    const user = await authService.upsertGoogleUser({
      id: crypto.randomUUID(),
      email,
      fullName,
      avatarUrl,
    });

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Please contact support.',
      });
    }

    const token = generateToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  logout,
  getMe,
};

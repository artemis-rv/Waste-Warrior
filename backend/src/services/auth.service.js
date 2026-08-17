const bcrypt = require('bcrypt');
const prisma = require('../config/db');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const createUser = async ({ id, email, passwordHash, fullName, role = 'resident' }) => {
  return prisma.user.create({
    data: {
      id,
      email,
      passwordHash,
      fullName,
      role,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isBanned: true,
    },
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isBanned: true,
      credits: true,
      avatarUrl: true,
    },
  });
};

const upsertGoogleUser = async ({ id, email, fullName, avatarUrl }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { email },
      data: {
        avatarUrl: existingUser.avatarUrl || avatarUrl,
        fullName: existingUser.fullName || fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isBanned: true,
        credits: true,
        avatarUrl: true,
      },
    });
  }

  return prisma.user.create({
    data: {
      id,
      email,
      fullName,
      avatarUrl,
      role: 'resident',
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isBanned: true,
      credits: true,
      avatarUrl: true,
    },
  });
};

module.exports = {
  hashPassword,
  comparePassword,
  createUser,
  findUserByEmail,
  findUserById,
  upsertGoogleUser,
};


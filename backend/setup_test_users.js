const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const testUsers = [
    { email: 'resident@test.com', role: 'resident', fullName: 'Test Resident' },
    { email: 'worker@test.com', role: 'worker', fullName: 'Test Worker' },
    { email: 'admin@test.com', role: 'admin', fullName: 'Test Admin' },
    { email: 'scrap@test.com', role: 'scrap_dealer', fullName: 'Test Scrap Dealer' }
  ];

  for (const u of testUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: u.email },
        data: { passwordHash, role: u.role, fullName: u.fullName }
      });
      console.log(`Updated existing user: ${u.email}`);
    } else {
      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: u.email,
          passwordHash,
          role: u.role,
          fullName: u.fullName
        }
      });
      console.log(`Created new user: ${u.email}`);
    }
  }

  console.log('Test users are ready!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

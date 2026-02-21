import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@safir.com',
      name: 'Admin',
      password: 'admin', // In production, use bcrypt to hash passwords
      whatsapp: '6281234567890', // Example WhatsApp number
    },
  });

  console.log('✅ Admin user created/updated:', admin);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      email: 'user@safir.com',
      name: 'Test User',
      password: 'user', // In production, use bcrypt to hash passwords
      whatsapp: '6289876543210', // Example WhatsApp number
    },
  });

  console.log('✅ Test user created/updated:', testUser);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update admin user with WhatsApp
  const admin = await prisma.user.update({
    where: { username: 'admin' },
    data: {
      whatsapp: '6281234567890',
    },
  });

  console.log('✅ Admin user updated with WhatsApp:', admin);

  // Update test user with WhatsApp
  const testUser = await prisma.user.update({
    where: { username: 'user' },
    data: {
      whatsapp: '6289876543210',
    },
  });

  console.log('✅ Test user updated with WhatsApp:', testUser);
}

main()
  .catch((e) => {
    console.error('❌ Error updating users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

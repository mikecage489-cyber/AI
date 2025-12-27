import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Create sample portal (public)
  const samplePortal = await prisma.portal.upsert({
    where: { id: 'sample-portal-1' },
    update: {},
    create: {
      id: 'sample-portal-1',
      name: 'Sample Government Portal',
      listingUrl: 'https://example.gov/bids',
      description: 'Sample portal for testing',
      isActive: true,
      portalType: 'PUBLIC',
      fieldMapping: {
        requisitionNumber: 'bid_id',
        title: 'bid_title',
        openDate: 'issue_date',
        closeDate: 'due_date',
      },
    },
  });

  console.log({ samplePortal });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

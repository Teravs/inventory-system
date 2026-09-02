import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/inventory_system';
const connectionString = rawUrl.replace(/^mysql:\/\//, 'mariadb://');

const pool = mariadb.createPool(connectionString);
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial system state...');

  const hashedPassword = await bcrypt.hash('AdminDev123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      name: 'System Administrator',
      username: 'superadmin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log(`Created default SUPER_ADMIN user: ${superAdmin.username}`);
  console.log('[SECURITY NOTE]: "AdminDev123!" is a DEV password. Update immediately upon deployment.');

  const categories = [
    'Laptops & Workstations',
    'Monitors & Displays',
    'Networking Hardware',
    'Mobile Devices & Tablets',
    'Office Furniture & Fixtures'
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        status: 'ACTIVE'
      }
    });
  }

  console.log('Seeded baseline categories successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
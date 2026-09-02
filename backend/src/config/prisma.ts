import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ENV } from './env.js';

const connectionString = ENV.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(connectionString);

export const prisma = new PrismaClient({
  adapter,
  log: ENV.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});
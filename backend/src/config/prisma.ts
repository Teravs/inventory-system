import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import { ENV } from './env.js';

const connectionString = ENV.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://');
const pool = mariadb.createPool(connectionString);
const adapter = new PrismaMariaDb(pool);

export const prisma = new PrismaClient({
  adapter,
  log: ENV.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});
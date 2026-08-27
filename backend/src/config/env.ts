import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/inventory_system',
  PORT: parseInt(process.env.PORT || '3000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  AUTH_SECRET: process.env.AUTH_SECRET || 'dev_insecure_auth_secret_key_2026',
  NODE_ENV: process.env.NODE_ENV || 'development',
  COOKIE_NAME: 'auth_token'
};
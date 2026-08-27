import app from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';

// Global serialization support for BigInt in JSON responses
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Connected to MariaDB 10.4.x via Prisma');

    app.listen(ENV.PORT, () => {
      console.log(`Backend server listening on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database connection:', err);
    process.exit(1);
  }
}

bootstrap();
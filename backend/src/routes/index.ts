import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import inventoryRoutes from './inventory.routes.js';
import activityLogRoutes from './activity-log.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/activity-logs', activityLogRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/health', healthRoutes);

export default apiRouter;
import { Router } from 'express';
import { ActivityLogController } from '../controllers/activity-log.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { Role } from '../types/index.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole([Role.SUPER_ADMIN, Role.ADMIN]));

router.get('/', ActivityLogController.list);

export default router;
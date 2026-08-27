import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { Role } from '../types/index.js';

const router = Router();
router.use(requireAuth);

router.get('/', CategoryController.list); // All logged-in roles can read
router.post('/', requireRole([Role.SUPER_ADMIN]), CategoryController.create);
router.put('/:id', requireRole([Role.SUPER_ADMIN]), CategoryController.update);
router.patch('/:id/status', requireRole([Role.SUPER_ADMIN]), CategoryController.setStatus);

export default router;
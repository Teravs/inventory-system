import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { Role } from '../types/index.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole([Role.SUPER_ADMIN]));

router.get('/', UserController.list);
router.get('/:id', UserController.getById);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.patch('/:id/status', UserController.setStatus);
router.patch('/:id/role', UserController.setRole);
router.delete('/:id', UserController.delete);

export default router;
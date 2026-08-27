import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { Role } from '../types/index.js';

const router = Router();
router.use(requireAuth);

router.get('/', InventoryController.list);
router.get('/:assetNumber', InventoryController.getByAsset);
router.post('/', requireRole([Role.SUPER_ADMIN, Role.ADMIN]), InventoryController.create);
router.put('/:assetNumber', requireRole([Role.SUPER_ADMIN, Role.ADMIN]), InventoryController.update);
router.patch('/:assetNumber/status', requireRole([Role.SUPER_ADMIN, Role.ADMIN]), InventoryController.setStatus);
router.delete('/:assetNumber', requireRole([Role.SUPER_ADMIN, Role.ADMIN]), InventoryController.delete);

export default router;
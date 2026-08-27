import { prisma } from '../config/prisma.js';
import { InventoryStatus, CategoryStatus, UserStatus } from '../types/index.js';

export class DashboardService {
  static async getStats() {
    const [totalInventory, activeInventory, inactiveInventory, totalCategories, totalUsers] =
      await Promise.all([
        prisma.inventory.count(),
        prisma.inventory.count({ where: { status: InventoryStatus.ACTIVE } }),
        prisma.inventory.count({ where: { status: InventoryStatus.INACTIVE } }),
        prisma.category.count({ where: { status: CategoryStatus.ACTIVE } }),
        prisma.user.count({ where: { status: UserStatus.ACTIVE } })
      ]);

    const recentItems = await prisma.inventory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } }
      }
    });

    return {
      cards: {
        totalInventory,
        activeInventory,
        inactiveInventory,
        totalCategories,
        totalUsers
      },
      recentItems
    };
  }
}
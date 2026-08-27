import { prisma } from '../config/prisma.js';
import { CategoryStatus } from '../types/index.js';

export class CategoryService {
  static async listCategories(onlyActive = false) {
    return prisma.category.findMany({
      where: onlyActive ? { status: CategoryStatus.ACTIVE } : undefined,
      include: {
        _count: {
          select: { inventories: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createCategory(name: string) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) throw new Error('A category with this name already exists.');

    return prisma.category.create({
      data: { name, status: CategoryStatus.ACTIVE }
    });
  }

  static async updateCategory(id: number | string, name: string) {
    const numericId = Number(id);
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing && existing.id !== numericId) {
      throw new Error('Another category with this name already exists.');
    }

    return prisma.category.update({
      where: { id: numericId },
      data: { name }
    });
  }

  static async setCategoryStatus(id: number | string, status: CategoryStatus) {
    const numericId = Number(id);
    return prisma.category.update({
      where: { id: numericId },
      data: { status }
    });
  }
}
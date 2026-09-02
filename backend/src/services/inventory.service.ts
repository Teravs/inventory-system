import { prisma } from '../config/prisma.js';
import { InventoryStatus, CategoryStatus, ActivityAction, UserRole } from '../types/index.js';
import { ActivityLogService } from './activity-logs.service.js';
import { ENV } from '../config/env.js';

interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | string;
  status?: InventoryStatus;
}

interface CreateInventoryDTO {
  assetNumber: string;
  serialNumber?: string | null;
  name: string;
  brand?: string | null;
  categoryId: number | string;
  assignedTo?: string | null;
  devicePassword?: string | null;
  description?: string | null;
  purchaseMonth: string;
}

export class InventoryService {
  static async list(params: InventoryListParams, userRole: UserRole) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 15));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.categoryId) {
      where.categoryId = Number(params.categoryId);
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { assetNumber: { contains: params.search } },
        { name: { contains: params.search } },
        { brand: { contains: params.search } },
        { serialNumber: { contains: params.search } },
        { assignedTo: { contains: params.search } },
        { description: { contains: params.search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, username: true } },
          updatedBy: { select: { id: true, name: true, username: true } }
        }
      })
    ]);

    // Viewers cannot see device passwords
    const sanitizedItems = items.map((item) => {
      if (userRole === UserRole.VIEWER) {
        const { devicePassword: _pw, ...rest } = item;
        return { ...rest, devicePassword: null };
      }
      return item;
    });

    return {
      items: sanitizedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getByAssetNumber(assetNumber: string, userRole: UserRole) {
    const item = await prisma.inventory.findUnique({
      where: { assetNumber },
      include: {
        category: true,
        createdBy: { select: { id: true, name: true, username: true } },
        updatedBy: { select: { id: true, name: true, username: true } }
      }
    });

    if (!item) throw new Error(`Inventory item ${assetNumber} not found.`);

    if (userRole === UserRole.VIEWER) {
      const { devicePassword: _pw, ...rest } = item;
      return { ...rest, devicePassword: null };
    }

    return item;
  }

  static async create(dto: CreateInventoryDTO, userId: number | string, ip?: string, ua?: string) {
    const numericUserId = Number(userId);
    const numericCategoryId = Number(dto.categoryId);

    const existing = await prisma.inventory.findUnique({ where: { assetNumber: dto.assetNumber } });
    if (existing) throw new Error(`Asset number ${dto.assetNumber} already exists.`);

    const category = await prisma.category.findUnique({ where: { id: numericCategoryId } });
    if (!category || category.status === CategoryStatus.INACTIVE) {
      throw new Error('Specified category is inactive or invalid.');
    }

    // QR Code points to client detail URL
    const qrUrl = `${ENV.FRONTEND_URL}/inventory/${encodeURIComponent(dto.assetNumber)}`;

    const newItem = await prisma.inventory.create({
      data: {
        assetNumber: dto.assetNumber,
        serialNumber: dto.serialNumber || null,
        name: dto.name,
        brand: dto.brand || null,
        categoryId: numericCategoryId,
        assignedTo: dto.assignedTo || null,
        devicePassword: dto.devicePassword || null,
        description: dto.description || null,
        purchaseMonth: dto.purchaseMonth,
        qrCode: qrUrl,
        status: InventoryStatus.ACTIVE,
        createdById: numericUserId,
        updatedById: numericUserId
      },
      include: { category: true }
    });

    await ActivityLogService.log({
      userId: numericUserId,
      action: ActivityAction.CREATE,
      entityType: 'INVENTORY',
      entityId: newItem.assetNumber,
      description: `Created inventory asset ${newItem.assetNumber} (${newItem.name})`,
      newData: newItem as unknown as Record<string, unknown>,
      ipAddress: ip,
      userAgent: ua
    });

    return newItem;
  }

  static async update(
    assetNumber: string,
    dto: Partial<CreateInventoryDTO>,
    userId: number | string,
    ip?: string,
    ua?: string
  ) {
    const numericUserId = Number(userId);

    const oldItem = await prisma.inventory.findUnique({ where: { assetNumber } });
    if (!oldItem) throw new Error(`Inventory item ${assetNumber} not found.`);

    let targetCategoryId = oldItem.categoryId;
    if (dto.categoryId !== undefined) {
      targetCategoryId = Number(dto.categoryId);
      const category = await prisma.category.findUnique({ where: { id: targetCategoryId } });
      if (!category || category.status === CategoryStatus.INACTIVE) {
        throw new Error('Specified category is inactive or does not exist.');
      }
    }

    const updatedItem = await prisma.inventory.update({
      where: { assetNumber },
      data: {
        serialNumber: dto.serialNumber !== undefined ? dto.serialNumber : oldItem.serialNumber,
        name: dto.name || oldItem.name,
        brand: dto.brand !== undefined ? dto.brand : oldItem.brand,
        categoryId: targetCategoryId,
        assignedTo: dto.assignedTo !== undefined ? dto.assignedTo : oldItem.assignedTo,
        devicePassword: dto.devicePassword !== undefined ? dto.devicePassword : oldItem.devicePassword,
        description: dto.description !== undefined ? dto.description : (oldItem as any).description,
        purchaseMonth: dto.purchaseMonth || oldItem.purchaseMonth,
        updatedById: numericUserId
      },
      include: { category: true }
    });

    await ActivityLogService.log({
      userId: numericUserId,
      action: ActivityAction.UPDATE,
      entityType: 'INVENTORY',
      entityId: assetNumber,
      description: `Updated inventory asset ${assetNumber}`,
      oldData: oldItem as unknown as Record<string, unknown>,
      newData: updatedItem as unknown as Record<string, unknown>,
      ipAddress: ip,
      userAgent: ua
    });

    return updatedItem;
  }

  static async changeStatus(assetNumber: string, status: InventoryStatus, userId: number | string, ip?: string, ua?: string) {
    const numericUserId = Number(userId);
    const oldItem = await prisma.inventory.findUnique({ where: { assetNumber } });
    if (!oldItem) throw new Error(`Inventory item ${assetNumber} not found.`);

    const updated = await prisma.inventory.update({
      where: { assetNumber },
      data: { status, updatedById: numericUserId }
    });

    await ActivityLogService.log({
      userId: numericUserId,
      action: status === InventoryStatus.ACTIVE ? ActivityAction.ACTIVATE : ActivityAction.DEACTIVATE,
      entityType: 'INVENTORY',
      entityId: assetNumber,
      description: `Changed status of ${assetNumber} to ${status}`,
      oldData: { status: oldItem.status },
      newData: { status: updated.status },
      ipAddress: ip,
      userAgent: ua
    });

    return updated;
  }

  static async permanentDelete(assetNumber: string, userId: number | string, ip?: string, ua?: string) {
    const numericUserId = Number(userId);
    const oldItem = await prisma.inventory.findUnique({ where: { assetNumber } });
    if (!oldItem) throw new Error(`Inventory item ${assetNumber} not found.`);

    // Log before permanent deletion
    await ActivityLogService.log({
      userId: numericUserId,
      action: ActivityAction.DELETE,
      entityType: 'INVENTORY',
      entityId: assetNumber,
      description: `Permanently deleted inventory asset ${assetNumber} (${oldItem.name})`,
      oldData: oldItem as unknown as Record<string, unknown>,
      ipAddress: ip,
      userAgent: ua
    });

    return prisma.inventory.delete({ where: { assetNumber } });
  }
}
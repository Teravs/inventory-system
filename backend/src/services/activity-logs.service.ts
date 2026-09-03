import { prisma } from '../config/prisma.js';
import { ActivityAction, UserRole } from '../types/index.js';

interface CreateLogParams {
  userId: number;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  description: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityLogService {
  static async log(params: CreateLogParams) {
    try {
      // Passwords are never serialized into logs
      const sanitize = (data?: Record<string, unknown> | null) => {
        if (!data) return undefined;
        const copy = { ...data };
        delete copy.password;
        delete copy.devicePassword;
        return JSON.parse(
          JSON.stringify(copy, (_key, val) => (typeof val === 'bigint' ? val.toString() : val))
        );
      };

      return await prisma.activityLog.create({
        data: {
          userId: Number(params.userId),
          action: params.action,
          entityType: params.entityType,
          entityId: String(params.entityId),
          description: params.description,
          oldData: sanitize(params.oldData),
          newData: sanitize(params.newData),
          ipAddress: params.ipAddress,
          userAgent: params.userAgent ? params.userAgent.substring(0, 255) : undefined
        }
      });
    } catch (error) {
      console.error('Failed to append immutable activity log:', error);
    }
  }

  static async getLogs(
    query: {
      page?: number;
      limit?: number;
      action?: ActivityAction;
      entityType?: string;
      month?: string;
      all?: boolean;
    },
    userRole: UserRole
  ) {
    const isAll = Boolean(query.all) || Number(query.limit) >= 1000;
    const page = isAll ? 1 : Math.max(1, Number(query.page) || 1);
    const limit = isAll ? 5000 : Math.min(500, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Role-based security: ADMIN is restricted to INVENTORY only, SUPER_ADMIN can view all
    if (userRole !== UserRole.SUPER_ADMIN) {
      where.entityType = 'INVENTORY';
      if (query.action && query.action !== ActivityAction.CHANGE_ROLE) {
        where.action = query.action;
      }
    } else {
      if (query.action) where.action = query.action;
      if (query.entityType) where.entityType = query.entityType;
    }

    if (query.month) {
      const parts = query.month.split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        if (!isNaN(year) && !isNaN(month)) {
          const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
          const endDate = new Date(year, month, 1, 0, 0, 0, 0);
          where.createdAt = {
            gte: startDate,
            lt: endDate
          };
        }
      }
    }

    const [total, rawLogs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, username: true, role: true }
          }
        }
      })
    ]);

    const logs = rawLogs.map((log) => ({
      ...log,
      id: log.id.toString()
    }));

    return {
      logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
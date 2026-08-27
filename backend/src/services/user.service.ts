import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { UserRole, UserStatus, ActivityAction } from '../types/index.js';
import { ActivityLogService } from './activity-logs.service.js';

export class UserService {
  static async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getUserById(id: number | string) {
    const numericId = Number(id);
    const user = await prisma.user.findUnique({
      where: { id: numericId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) throw new Error('User not found.');
    return user;
  }

  static async createUser(
    data: { name: string; username: string; passwordPlain: string; role: UserRole },
    actorId: number | string,
    ip?: string,
    ua?: string
  ) {
    const numericActorId = Number(actorId);
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) throw new Error('Username is already taken.');

    const hashedPassword = await bcrypt.hash(data.passwordPlain, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
        status: UserStatus.ACTIVE
      },
      select: { id: true, name: true, username: true, role: true, status: true, createdAt: true }
    });

    await ActivityLogService.log({
      userId: numericActorId,
      action: ActivityAction.CREATE,
      entityType: 'USER',
      entityId: String(newUser.id),
      description: `Created user ${newUser.username} with role ${newUser.role}`,
      newData: newUser as unknown as Record<string, unknown>,
      ipAddress: ip,
      userAgent: ua
    });

    return newUser;
  }

  static async updateUser(
    id: number | string,
    data: { name?: string; username?: string; role?: UserRole; status?: UserStatus; passwordPlain?: string },
    actorId: number | string,
    ip?: string,
    ua?: string
  ) {
    const numericId = Number(id);
    const numericActorId = Number(actorId);
    const oldUser = await this.getUserById(numericId);

    if (data.username && data.username !== oldUser.username) {
      const conflict = await prisma.user.findUnique({ where: { username: data.username } });
      if (conflict) throw new Error('Username is already in use.');
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.name) updatePayload.name = data.name;
    if (data.username) updatePayload.username = data.username;
    if (data.role) updatePayload.role = data.role;
    if (data.status) updatePayload.status = data.status;
    if (data.passwordPlain) {
      updatePayload.password = await bcrypt.hash(data.passwordPlain, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: numericId },
      data: updatePayload,
      select: { id: true, name: true, username: true, role: true, status: true, updatedAt: true }
    });

    await ActivityLogService.log({
      userId: numericActorId,
      action: ActivityAction.UPDATE,
      entityType: 'USER',
      entityId: String(numericId),
      description: `Updated profile for user ${updatedUser.username}`,
      oldData: oldUser as unknown as Record<string, unknown>,
      newData: updatedUser as unknown as Record<string, unknown>,
      ipAddress: ip,
      userAgent: ua
    });

    return updatedUser;
  }

  static async changeUserStatus(id: number | string, status: UserStatus, actorId: number | string, ip?: string, ua?: string) {
    const numericId = Number(id);
    const numericActorId = Number(actorId);
    const oldUser = await this.getUserById(numericId);
    const updatedUser = await prisma.user.update({
      where: { id: numericId },
      data: { status },
      select: { id: true, name: true, username: true, role: true, status: true }
    });

    await ActivityLogService.log({
      userId: numericActorId,
      action: status === UserStatus.ACTIVE ? ActivityAction.ACTIVATE : ActivityAction.DEACTIVATE,
      entityType: 'USER',
      entityId: String(numericId),
      description: `Changed user status for ${updatedUser.username} to ${status}`,
      oldData: { status: oldUser.status },
      newData: { status: updatedUser.status },
      ipAddress: ip,
      userAgent: ua
    });

    return updatedUser;
  }

  static async changeUserRole(id: number | string, role: UserRole, actorId: number | string, ip?: string, ua?: string) {
    const numericId = Number(id);
    const numericActorId = Number(actorId);
    const oldUser = await this.getUserById(numericId);
    const updatedUser = await prisma.user.update({
      where: { id: numericId },
      data: { role },
      select: { id: true, name: true, username: true, role: true, status: true }
    });

    await ActivityLogService.log({
      userId: numericActorId,
      action: ActivityAction.CHANGE_ROLE,
      entityType: 'USER',
      entityId: String(numericId),
      description: `Changed role of user ${updatedUser.username} from ${oldUser.role} to ${role}`,
      oldData: { role: oldUser.role },
      newData: { role: updatedUser.role },
      ipAddress: ip,
      userAgent: ua
    });

    return updatedUser;
  }

  static async deleteUserPermanent(id: number | string, actorId: number | string, ip?: string, ua?: string) {
    const numericId = Number(id);
    const numericActorId = Number(actorId);
    const targetUser = await this.getUserById(numericId);
    if (targetUser.id === numericActorId) {
      throw new Error('Self-deletion is prohibited.');
    }

    await ActivityLogService.log({
      userId: numericActorId,
      action: ActivityAction.DELETE,
      entityType: 'USER',
      entityId: String(numericId),
      description: `Permanently deleted user account ${targetUser.username}`,
      oldData: targetUser as unknown as Record<string, unknown>,
      ipAddress: ip,
      userAgent: ua
    });

    return prisma.user.delete({ where: { id: numericId } });
  }
}
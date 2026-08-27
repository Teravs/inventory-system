import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { signToken } from '../utils/token.js';
import { UserStatus } from '../types/index.js';

export class AuthService {
  static async login(username: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.status === UserStatus.INACTIVE) {
      throw new Error('Invalid credentials or account is deactivated.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials.');
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status
      }
    };
  }

  static async getProfile(userId: number | string) {
    const numericId = Number(userId);
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

    if (!user || user.status === UserStatus.INACTIVE) {
      throw new Error('User not found or inactive.');
    }

    return user;
  }
}
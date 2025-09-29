import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUserParent(userId: string): Promise<void> {
    await this.prisma.user.create({
      data: {
        user_id: userId,
        name: 'Default Name',
        email: 'default@example.com',
        password: 'defaultPassword',
        user_type: 'parent',
        profile_picture: '',
      },
    });
  }
}

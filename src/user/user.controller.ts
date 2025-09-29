import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { User } from '@prisma/client';

@ApiTags('User')
@ApiBearerAuth('Authorization')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async create(@Body() userDto: User, @Headers('x-user-id') userId: string) {
    return await this.userService.createUserParent(userId);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto } from './dtos/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async create(
    @Body() createUserDto: Omit<CreateUserDto, 'module_id'>,
  ): Promise<UserResponseDto> {
    return await this.userService.create(createUserDto);
  }
}

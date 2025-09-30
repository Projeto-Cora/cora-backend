import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HashService } from 'src/auth/hash.service';

@Module({
  controllers: [UserController],
  providers: [UserService, HashService],
})
export class UserModule {}

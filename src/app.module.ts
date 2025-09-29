import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BoilerplateModule } from './boilerplates/boilerplate.module';
import { ModuleModule } from './module/module.module';
import { ModuleUser } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BoilerplateModule,
    ModuleModule,
    ModuleUser,
  ],
})
export class AppModule {}

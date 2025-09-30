import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload } from '../auth/auth.guard';
import { LoginDTO } from './dtos/login.dto';
import { AccessTokenDTO, AuthenticatedUserDTO } from './dtos/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as dotenv from 'dotenv';
import { HashService } from './hash.service';
import { IsPublic } from './decorators/isPublic.decorator';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  @IsPublic()
  async validateUser({
    email,
    password,
    user_type,
  }: LoginDTO): Promise<AccessTokenDTO> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase(), user_type: user_type.toLowerCase() },
    });

    if (!user) {
      throw new HttpException(
        'Incorrect login credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await this.hashService.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException(
        'Incorrect login credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload: AuthPayload = {
      userId: user.user_id,
      userType: user.user_type,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '3h',
    });

    return { accessToken };
  }

  async validateToken(userId: string): Promise<AuthenticatedUserDTO> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    return {
      userId: user.user_id,
      userName: user.name,
      userType: user.user_type,
    };
  }
}

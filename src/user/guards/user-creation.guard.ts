import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../enum/user-type-enum';

@Injectable()
export class UserCreationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { body } = request;

    if (body.user_type === UserType.SPECIALIST || body.user_type === UserType.ADMIN) {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('É necessário um token de admin para criar este tipo de usuário.');
      }

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });

        if (payload.userType !== UserType.ADMIN) {
          throw new ForbiddenException('Apenas administradores podem criar especialistas.');
        }
        
        request['payload'] = payload;

      } catch (error) {
        if (error instanceof ForbiddenException) throw error;
        throw new UnauthorizedException('Token inválido ou expirado.');
      }
    
    } 
    return true;
  }

  private extractTokenFromHeader(request: { headers: { authorization?: string } }): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

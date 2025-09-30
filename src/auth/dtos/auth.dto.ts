import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthPayload } from '../auth.guard';

export type AuthenticatedRequest = Request & {
  payload: AuthPayload;
};

export class AccessTokenDTO {
  @ApiProperty({
    description: 'Access token for authentication',
    example:
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzA4MzQ1MTIzLCJleHAiOjE3MDgzNTUxMjN9',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: 'Type of user',
    example: 'parent',
  })
  @IsString()
  @IsNotEmpty()
  userType: string;
}

export class AuthenticatedUserDTO {
  userId: string;
  userName: string;
  userType: string;
}

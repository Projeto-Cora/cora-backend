import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserType } from '../enum/user-type-enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChildDto {
  @ApiProperty({
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '2018-05-15',
  })
  @IsDateString()
  @IsNotEmpty()
  birth_date: Date;

  @ApiProperty({
    example: '6-8 anos',
  })
  @IsString()
  @IsNotEmpty()
  age_group: string;
}

export class CreateSpecialistProfileDto {
  @ApiProperty({
    example: 'Psicologia Infantil',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({
    example:
      'Especialista em desenvolvimento infantil com 10 anos de experiência',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'CRP 12345',
  })
  @IsString()
  @IsNotEmpty()
  council_number: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'enzo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'enzo@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123@password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'parent',
    enum: UserType,
    enumName: 'UserType',
  })
  @IsEnum(UserType, {
    message: 'user_type deve ser: admin, parent ou specialist',
  })
  @IsNotEmpty()
  user_type: UserType;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profile_picture?: string;

  @ApiProperty({
    type: [CreateChildDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChildDto)
  @IsOptional()
  children?: CreateChildDto[];

  @ApiProperty({
    type: CreateSpecialistProfileDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateSpecialistProfileDto)
  @IsOptional()
  specialist_profile?: CreateSpecialistProfileDto;
}

export class UserResponseDto {
  user_id: string;
  name: string;
  email: string;
  user_type: string;
  profile_picture?: string;
  children?: ChildrenResponseDto[];
  specialist_profile?: SpecialistProfileResponseDto | null;
}

export class ChildrenResponseDto {
  child_id: string;
  name: string;
  birth_date: Date;
  age_group: string;
  parent_id: string;
}

export class SpecialistProfileResponseDto {
  specialist_id: string;
  specialty: string;
  description: string;
  council_number: string;
}

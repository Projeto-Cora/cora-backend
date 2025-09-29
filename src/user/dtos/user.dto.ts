import { Child, SpecialistProfile } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserType } from 'src/module/enum/user-type-enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  user_type: UserType;

  @IsString()
  @IsOptional()
  profile_picture?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChildDto)
  @IsOptional()
  children?: CreateChildDto[];

  @ValidateNested()
  @Type(() => CreateSpecialistProfileDto)
  @IsOptional()
  specialist_profile?: CreateSpecialistProfileDto;
}

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  birth_date: Date;

  @IsString()
  @IsNotEmpty()
  age_group: string;
}

export class CreateSpecialistProfileDto {
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  council_number: string;
}

export class UserResponseDto {
  user_id: string;
  name: string;
  email: string;
  user_type: string;
  profile_picture?: string;
  children?: Child[];
  specialist_profile?: SpecialistProfile | null;
}

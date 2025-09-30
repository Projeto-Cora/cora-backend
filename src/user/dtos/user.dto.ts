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
import { UserType } from '../enum/user-type-enum';

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

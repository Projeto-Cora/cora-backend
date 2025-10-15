import { IsString, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { ContentResponseDto } from '../../content/dtos/content.dto';
import { Type } from 'class-transformer';

export class ModuleResponseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  contents: ContentResponseDto[];
}

export class ModuleCardResponseDto {
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  synopsis: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  age_group: string[];
}

export class ModuleFullResponseDto {
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  synopsis: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  age_group: string[];

  @ValidateNested({ each: true })
  @Type(() => ContentResponseDto)
  contents: ContentResponseDto[];
}

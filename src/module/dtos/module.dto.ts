import { IsString, IsNotEmpty } from 'class-validator';
import { ContentResponseDto } from '../../content/dtos/content.dto';

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

  @IsString()
  @IsNotEmpty()
  age_group: string;
}

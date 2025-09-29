import { IsString, IsNotEmpty } from 'class-validator';
import { ContentResponseDto } from '../../content/dtos/content.dto';

export class ModuleResponseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  contents: ContentResponseDto[];
}

export class ModuleResponseDto2 {
  @IsString()
  @IsNotEmpty()
  title: string;
  module_id: string;
  sinopsys: string;
  thumbnail: string;
  age_group: string;
  user_id: string;


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

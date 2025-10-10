import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsBoolean,
  isString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';
export class CreateForumDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(16)
    @MaxLength(4096)
    texto: string;

    @IsString()
    @IsNotEmpty()
    keywords: string[];

    @IsBoolean()
    @IsNotEmpty()
    anonymous: boolean;
}

    export class ForumResponseDto {
      question_id: string;
      title: string;
      text: string;
      creation_date: string; 
      keywords: string[];
      is_anonymous: boolean;
    }

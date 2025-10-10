import { ConflictException, Injectable } from '@nestjs/common';
import { CreateForumDto, ForumResponseDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

@Injectable()
export class ForumService {
  constructor(
      private prisma: PrismaService,
    ) {}
  async create(createForumDto: CreateForumDto, userId: string): Promise<ForumResponseDto> {
    
//por que question n ta funcionando? perguntar na daily de sabado ou pra alguem no whatsapp.

    const {title,...is_anonymous } = createForumDto;

    const existingPost = await this.prisma.question.findUnique({
          where: { text: question.text },
        });
        if (existingPost) {
          throw new ConflictException('Post already exists.');
        }
    
    const result = await this.prisma.$transaction(async (prisma) => {
      const question = await prisma.question.create({
        data: {
          question_id: question.question_id,
          title: question.title,
          text: question.text,
          creation_date: new Date(dateTimestampProvider.now()),
        },
      });
    return result;
  });
}

  findAll() {
    return `This action returns all forum`;
  }

  findOne(id: number) {
    return `This action returns a #${id} forum`;
  }

  update(id: number, updateForumDto: UpdateForumDto) {
    return `This action updates a #${id} forum`;
  }

  remove(id: number) {
    return `This action removes a #${id} forum`;
  }
}

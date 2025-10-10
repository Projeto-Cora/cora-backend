import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import type { AuthenticatedRequest } from 'src/auth/dtos/auth.dto';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('posts')
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createForumDto: CreateForumDto
  ) {
    return this.forumService.create(createForumDto, req.payload.userId);

  }

  @Get()
  findAll() {
    return this.forumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateForumDto: UpdateForumDto) {
    return this.forumService.update(+id, updateForumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forumService.remove(+id);
  }
}

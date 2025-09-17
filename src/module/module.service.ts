import { Injectable, BadRequestException } from '@nestjs/common';
import { ModuleCardResponseDto, ModuleResponseDto } from './dtos/module.dto';
import { PrismaService } from '../prisma/prisma.service';

interface RandomModuleResult {
  module_id: string;
  title: string;
  synopsis: string;
  thumbnail: string;
  age_group: string;
}

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async create(
    createModuleDto: Omit<ModuleCardResponseDto, 'module_id'>,
    userId: string,
  ): Promise<ModuleCardResponseDto> {
    // Verify if user exists
    const userExists = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!userExists) {
      throw new BadRequestException(`User with ID ${userId} does not exist`);
    }

    const module = await this.prisma.module.create({
      data: {
        title: createModuleDto.title,
        synopsis: createModuleDto.synopsis,
        thumbnail: createModuleDto.thumbnail,
        age_group: createModuleDto.age_group,
        user_id: userId,
      },
    });
    return module;
  }

  async getModuleById(moduleId: string): Promise<ModuleResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { module_id: moduleId },
    });

    if (!module) {
      throw new BadRequestException('Module not found');
    }

    const contents = await this.prisma.content.findMany({
      where: { module_id: module.module_id },
    });

    const moduleResponse: ModuleResponseDto = {
      title: module.title,
      contents: contents.map((content) => ({
        content_id: content.content_id,
        text: content.text ?? '',
        image: content.image ?? '',
        template: content.template ?? '',
        video_link: content.video_link ?? '',
        module_id: content.module_id,
      })),
    };

    return moduleResponse;
  }

  async getRecentModules(): Promise<ModuleCardResponseDto[]> {
    const modules = await this.prisma.module.findMany({
      orderBy: { creation_date: 'desc' },
    });

    if (!modules || modules.length === 0) {
      throw new BadRequestException('No recent modules found');
    }

    return modules.map((module) => ({
      module_id: module.module_id,
      title: module.title,
      synopsis: module.synopsis,
      thumbnail: module.thumbnail,
      age_group: module.age_group,
    }));
  }

  async getPopularModules(): Promise<ModuleCardResponseDto[]> {
    const modules = await this.prisma.module.findMany({
      orderBy: { views: 'desc' },
    });

    if (!modules || modules.length === 0) {
      throw new BadRequestException('No popular modules found');
    }

    return modules.map((module) => ({
      module_id: module.module_id,
      title: module.title,
      synopsis: module.synopsis,
      thumbnail: module.thumbnail,
      age_group: module.age_group,
    }));
  }

  async getRecommendedModules(): Promise<ModuleCardResponseDto[]> {
    const modules = await this.prisma.$queryRaw<RandomModuleResult[]>`
      SELECT module_id, title, synopsis, thumbnail, age_group 
      FROM "Module" 
      ORDER BY RANDOM()
    `;

    if (!modules || modules.length === 0) {
      throw new BadRequestException('No recommended modules found');
    }

    return modules.map((module) => ({
      module_id: module.module_id,
      title: module.title,
      synopsis: module.synopsis,
      thumbnail: module.thumbnail,
      age_group: module.age_group,
    }));
  }

  async searchModuleByKeyword(
    keyword: string,
  ): Promise<ModuleCardResponseDto[]> {
    const modulos = await this.prisma.module.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { synopsis: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        module_id: true,
        title: true,
        thumbnail: true,
        synopsis: true,
        age_group: true,
      },
    });

    const moduleCards: ModuleCardResponseDto[] = modulos.map((module) => ({
      module_id: module.module_id,
      title: module.title,
      synopsis: module.synopsis,
      thumbnail: module.thumbnail,
      age_group: module.age_group,
    }));
    return moduleCards;
  }
}

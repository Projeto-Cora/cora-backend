import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ModuleCardResponseDto,
  ModuleFullResponseDto,
  ModuleResponseDto,
} from './dtos/module.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
      where: { module_id: moduleId, deletedAt: null },
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

  async getRecentModules(
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    const where: Prisma.ModuleWhereInput = {
      deletedAt: null,
    };

    if (ageGroups && ageGroups.length > 0) {
      where.age_group = { in: ageGroups };
    }

    const modules = await this.prisma.module.findMany({
      where,
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

  async getPopularModules(
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    const where: Prisma.ModuleWhereInput = {
      deletedAt: null,
    };

    if (ageGroups && ageGroups.length > 0) {
      where.age_group = { in: ageGroups };
    }

    const modules = await this.prisma.module.findMany({
      where,
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

  async getRecommendedModules(
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    const ageGroupFilter =
      ageGroups && ageGroups.length > 0
        ? Prisma.sql`AND "age_group" IN (${Prisma.join(ageGroups)})`
        : Prisma.empty;

    const modules = await this.prisma.$queryRaw<RandomModuleResult[]>`
      SELECT module_id, title, synopsis, thumbnail, age_group 
      FROM "Module"
      WHERE "deletedAt" IS NULL
      ${ageGroupFilter}
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
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    const searchCondition: Prisma.ModuleWhereInput = {
      deletedAt: null,
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { synopsis: { contains: keyword, mode: 'insensitive' } },
      ],
    };

    let where: Prisma.ModuleWhereInput = searchCondition;
    if (ageGroups && ageGroups.length > 0) {
      where = {
        AND: [searchCondition, { age_group: { in: ageGroups } }],
      };
    }

    const modulos = await this.prisma.module.findMany({
      where,
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

  async updateModule(
    moduleId: string,
    updateModuleDto: Partial<Omit<ModuleFullResponseDto, 'module_id'>>,
    userId: string,
  ): Promise<ModuleFullResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(`User with ID ${userId} does not exist`);
    }

    if (user.user_type !== 'admin') {
      throw new UnauthorizedException(`User ${userId} is not authorized`);
    }

    const existingModule = await this.prisma.module.findUnique({
      where: { module_id: moduleId, deletedAt: null },
    });

    if (!existingModule) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.module.update({
        where: { module_id: moduleId },
        data: {
          title: updateModuleDto.title ?? existingModule.title,
          synopsis: updateModuleDto.synopsis ?? existingModule.synopsis,
          thumbnail: updateModuleDto.thumbnail ?? existingModule.thumbnail,
          age_group: updateModuleDto.age_group ?? existingModule.age_group,
        },
      });

      if (updateModuleDto.contents && updateModuleDto.contents.length > 0) {
        const contentUpdates = updateModuleDto.contents.map((contentDto) =>
          tx.content.update({
            where: { content_id: contentDto.content_id },
            data: {
              text: contentDto.text,
              image: contentDto.image,
              template: contentDto.template,
              video_link: contentDto.video_link,
            },
          }),
        );

        await Promise.all(contentUpdates);
      }

      return await tx.module.findUnique({
        where: { module_id: moduleId },
        include: { contents: true },
      });
    });

    if (!result) {
      throw new NotFoundException(
        `Module with ID ${moduleId} not found after update`,
      );
    }

    return {
      module_id: result.module_id,
      title: result.title,
      synopsis: result.synopsis,
      thumbnail: result.thumbnail,
      age_group: result.age_group,
      contents: result.contents.map((content) => ({
        content_id: content.content_id,
        text: content.text ?? '',
        image: content.image ?? '',
        template: content.template ?? '',
        video_link: content.video_link ?? '',
        module_id: content.module_id,
      })),
    };
  }

  async deleteModule(moduleId: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(`User with ID ${userId} does not exist`);
    }

    if (user.user_type !== 'admin') {
      throw new ForbiddenException(`User ${userId} is not authorized`);
    }

    const existingModule = await this.prisma.module.findUnique({
      where: { module_id: moduleId },
    });

    if (!existingModule) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    await this.prisma.module.update({
      where: { module_id: moduleId },
      data: { deletedAt: new Date() },
    });
  }
}

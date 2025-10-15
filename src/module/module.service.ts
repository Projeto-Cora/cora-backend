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
  age_group: string[]; 
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

    console.log(createModuleDto)

    const mod = await this.prisma.module.create({
      data: {
        title: createModuleDto.title,
        synopsis: createModuleDto.synopsis,
        thumbnail: createModuleDto.thumbnail,
        age_group: createModuleDto.age_group, 
        user_id: userId,
      },
    });

    return {
      module_id: mod.module_id,
      title: mod.title,
      synopsis: mod.synopsis,
      thumbnail: mod.thumbnail,
      age_group: mod.age_group,
    };
  }

  async getModuleById(moduleId: string): Promise<ModuleResponseDto> {
    // findUnique cannot include non-unique filters; use findFirst or findUnique then check deletedAt
    const mod = await this.prisma.module.findFirst({
      where: { module_id: moduleId, deletedAt: null },
    });
    if (!mod) throw new BadRequestException('Module not found');

    const contents = await this.prisma.content.findMany({
      where: { module_id: mod.module_id },
    });

    return {
      title: mod.title,
      contents: contents.map((c) => ({
        content_id: c.content_id,
        text: c.text ?? '',
        image: c.image ?? '',
        template: c.template ?? '',
        video_link: c.video_link ?? '',
        module_id: c.module_id,
      })),
    };
  }

  async getRecentModules(ageGroups?: string[]): Promise<ModuleCardResponseDto[]> {
    const where: Prisma.ModuleWhereInput = { deletedAt: null };
    if (ageGroups?.length) {
      // text[] overlap
      where.age_group = { hasSome: ageGroups };
    }

    const modules = await this.prisma.module.findMany({
      where,
      orderBy: { creation_date: 'desc' },
    });
    if (!modules.length) throw new BadRequestException('No recent modules found');

    return modules.map((m) => ({
      module_id: m.module_id,
      title: m.title,
      synopsis: m.synopsis,
      thumbnail: m.thumbnail,
      age_group: m.age_group,
    }));
  }

  async getPopularModules(ageGroups?: string[]): Promise<ModuleCardResponseDto[]> {
    const where: Prisma.ModuleWhereInput = { deletedAt: null };
    if (ageGroups?.length) {
      where.age_group = { hasSome: ageGroups };
    }

    const modules = await this.prisma.module.findMany({
      where,
      orderBy: { views: 'desc' },
    });
    if (!modules.length) throw new BadRequestException('No popular modules found');

    return modules.map((m) => ({
      module_id: m.module_id,
      title: m.title,
      synopsis: m.synopsis,
      thumbnail: m.thumbnail,
      age_group: m.age_group,
    }));
  }

  async getRecommendedModules(ageGroups?: string[]): Promise<ModuleCardResponseDto[]> {
    // Use raw SQL for ORDER BY RANDOM() and text[] overlap (&&)
    const ageGroupFilter =
      ageGroups && ageGroups.length > 0
        ? Prisma.sql`AND "age_group" && ARRAY[${Prisma.join(ageGroups)}]::text[]`
        : Prisma.empty;

    const modules = await this.prisma.$queryRaw<RandomModuleResult[]>`
      SELECT "module_id", "title", "synopsis", "thumbnail", "age_group"
      FROM "Module"
      WHERE "deletedAt" IS NULL
      ${ageGroupFilter}
      ORDER BY RANDOM()
    `;
    if (!modules.length) throw new BadRequestException('No recommended modules found');

    return modules.map((m) => ({
      module_id: m.module_id,
      title: m.title,
      synopsis: m.synopsis,
      thumbnail: m.thumbnail,
      age_group: m.age_group,
    }));
  }

  async searchModuleByKeyword(
    keyword: string,
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    const base: Prisma.ModuleWhereInput = {
      deletedAt: null,
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { synopsis: { contains: keyword, mode: 'insensitive' } },
      ],
    };

    const where: Prisma.ModuleWhereInput =
      ageGroups && ageGroups.length > 0
        ? { AND: [base, { age_group: { hasSome: ageGroups } }] }
        : base;

    const modules = await this.prisma.module.findMany({
      where,
      select: {
        module_id: true,
        title: true,
        thumbnail: true,
        synopsis: true,
        age_group: true,
      },
    });

    return modules.map((m) => ({
      module_id: m.module_id,
      title: m.title,
      synopsis: m.synopsis,
      thumbnail: m.thumbnail,
      age_group: m.age_group,
    }));
  }

  async updateModule(
    moduleId: string,
    updateModuleDto: Partial<Omit<ModuleFullResponseDto, 'module_id'>>,
    userId: string,
  ): Promise<ModuleFullResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new UnauthorizedException(`User with ID ${userId} does not exist`);
    if (user.user_type !== 'admin')
      throw new UnauthorizedException(`User ${userId} is not authorized`);

    const existingModule = await this.prisma.module.findFirst({
      where: { module_id: moduleId, deletedAt: null },
    });
    if (!existingModule) throw new NotFoundException(`Module with ID ${moduleId} not found`);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.module.update({
        where: { module_id: moduleId },
        data: {
          title: updateModuleDto.title ?? existingModule.title,
          synopsis: updateModuleDto.synopsis ?? existingModule.synopsis,
          thumbnail: updateModuleDto.thumbnail ?? existingModule.thumbnail,
          age_group: updateModuleDto.age_group ?? existingModule.age_group, // string[]
        },
      });

      if (updateModuleDto.contents?.length) {
        await Promise.all(
          updateModuleDto.contents.map((c) =>
            tx.content.update({
              where: { content_id: c.content_id },
              data: {
                text: c.text,
                image: c.image,
                template: c.template,
                video_link: c.video_link,
              },
            }),
          ),
        );
      }

      return tx.module.findUnique({
        where: { module_id: moduleId },
        include: { contents: true },
      });
    });

    if (!result) {
      throw new NotFoundException(`Module with ID ${moduleId} not found after update`);
    }

    return {
      module_id: result.module_id,
      title: result.title,
      synopsis: result.synopsis,
      thumbnail: result.thumbnail,
      age_group: result.age_group,
      contents: result.contents.map((c) => ({
        content_id: c.content_id,
        text: c.text ?? '',
        image: c.image ?? '',
        template: c.template ?? '',
        video_link: c.video_link ?? '',
        module_id: c.module_id,
      })),
    };
  }

  async deleteModule(moduleId: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new UnauthorizedException(`User with ID ${userId} does not exist`);
    if (user.user_type !== 'admin')
      throw new ForbiddenException(`User ${userId} is not authorized`);

    const existingModule = await this.prisma.module.findUnique({
      where: { module_id: moduleId },
    });
    if (!existingModule) throw new NotFoundException(`Module with ID ${moduleId} not found`);

    await this.prisma.module.update({
      where: { module_id: moduleId },
      data: { deletedAt: new Date() },
    });
  }
}

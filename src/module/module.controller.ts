import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Param,
  Query,
  UnauthorizedException,
  Put,
  Patch,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import {
  ModuleCardResponseDto,
  ModuleFullResponseDto,
  ModuleResponseDto,
} from './dtos/module.dto';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('/create')
  async create(
    @Body() moduleDto: Omit<ModuleCardResponseDto, 'module_id'>,
    @Headers('x-user-id') userId: string,
  ): Promise<ModuleCardResponseDto> {
    if (!userId) {
      throw new UnauthorizedException(
        'User ID is required in x-user-id header',
      );
    }

    return await this.moduleService.create(moduleDto, userId);
  }

  @Get('/id/:id')
  async getModuleById(@Param('id') id: string): Promise<ModuleResponseDto> {
    return await this.moduleService.getModuleById(id);
  }

  @Get('recents')
  async getRecentModules(): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.getRecentModules();
  }

  @Get('popular')
  async getPopularModules(): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.getPopularModules();
  }

  @Get('recommended')
  async getRecommendedModules(): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.getRecommendedModules();
  }

  @Get('search')
  async searchModules(
    @Query('keyword') keyword: string,
  ): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.searchModuleByKeyword(keyword);
  }

  @Put('/id/:id')
  async updateModule(
    @Param('id') id: string,
    @Body() updateModuleDto: Partial<Omit<ModuleFullResponseDto, 'module_id'>>,
    @Headers('x-user-id') userId: string,
  ): Promise<ModuleFullResponseDto> {
    return await this.moduleService.updateModule(id, updateModuleDto, userId);
  }

  @Patch('/id/:id/delete')
  async softDeleteModule(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<{ message: string }> {
    return await this.moduleService.softDeleteModule(id, userId);
  }
}

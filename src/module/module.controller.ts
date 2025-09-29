import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Param,
  Query,
  UnauthorizedException,
  ParseArrayPipe,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleCardResponseDto, ModuleResponseDto, ModuleResponseDto2 } from './dtos/module.dto';

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
  async getRecentModules(
    @Query(
      'age_group',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.getRecentModules(ageGroups);
  }

  @Get('popular')
  async getPopularModules(
    @Query(
      'age_group',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.getPopularModules(ageGroups);
  }

  @Get('recommended')
  async getRecommendedModules(
    @Query(
      'age_group',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.getRecommendedModules(ageGroups);
  }

  @Get('search')
  async searchModules(
    @Query('keyword') keyword: string,
    @Query(
      'age_group',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    ageGroups?: string[],
  ): Promise<ModuleCardResponseDto[]> {
    return await this.moduleService.searchModuleByKeyword(keyword, ageGroups);
  }
  @Get('/id2/:id')
  async getModuleById2(@Param('id') id: string): Promise<ModuleResponseDto2> {
    return await this.moduleService.getModuleById2(id);
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  HttpStatus,
  HttpCode,
  Put,
  ParseArrayPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import {
  ModuleCardResponseDto,
  ModuleFullResponseDto,
  ModuleResponseDto,
} from './dtos/module.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/dtos/auth.dto';

import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../user/enum/user-type-enum';

@ApiTags('Module')
@ApiBearerAuth('Authorization')
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('/create')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() moduleDto: Omit<ModuleCardResponseDto, 'module_id'>,
  ): Promise<ModuleCardResponseDto> {
    return await this.moduleService.create(moduleDto, req.payload.userId);
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

  @Put('/id/:id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async updateModule(
    @Param('id') id: string,
    @Body() updateModuleDto: Partial<Omit<ModuleFullResponseDto, 'module_id'>>,
    @Req() req: AuthenticatedRequest,
  ): Promise<ModuleFullResponseDto> {
    return await this.moduleService.updateModule(
      id,
      updateModuleDto,
      req.payload.userId,
    );
  }

  @Patch('/id/:id/delete')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async deleteModule(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ message: string; statusCode: number }> {
    await this.moduleService.deleteModule(id, req.payload.userId);
    return {
      message: 'Module successfully deleted',
      statusCode: HttpStatus.OK,
    };
  }
}

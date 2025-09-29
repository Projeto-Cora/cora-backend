import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from './module.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  mockModule,
  mockModule2,
  mockModuleCardResponseDto,
  mockModuleResponseDto,
  mockModuleResponseNoContentsDto,
  mockModulesCardResponseDto,
  mockModuleResponseDtoADM,
  mockModuleResponseNoContentsDtoADM,
} from './module.mock';
import { mockContentResponseDto } from '../content/content.mock';

describe('ModuleService', () => {
  let service: ModuleService;

  const mockPrismaService = {
    module: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    content: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getModuleById', () => {
    it('should return a module with contents if it exists', async () => {
      const moduleId = 'test-module-id';
      mockPrismaService.module.findUnique.mockResolvedValue(mockModule);
      mockPrismaService.content.findMany.mockResolvedValue([
        mockContentResponseDto,
      ]);
      const result = await service.getModuleById(moduleId);
      expect(result).toEqual(mockModuleResponseDto);
      expect(mockPrismaService.module.findUnique).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
    });

    it('should return a module with empty contents array when no contents exist', async () => {
      const moduleId = 'test-module-id';
      mockPrismaService.module.findUnique.mockResolvedValue(mockModule);
      mockPrismaService.content.findMany.mockResolvedValue([]);
      const result = await service.getModuleById(moduleId);
      expect(result).toEqual(mockModuleResponseNoContentsDto);
    });

    it('should throw when module does not exist', async () => {
      const moduleId = 'non-existent';
      mockPrismaService.module.findUnique.mockResolvedValue(null);
      await expect(service.getModuleById(moduleId)).rejects.toThrow(
        'Module not found',
      );
    });
  });

  describe('searchModuleByKeyword', () => {
    it('should return modules matching keyword without ageGroups', async () => {
      const keyword = 'criatividade';
      mockPrismaService.module.findMany.mockResolvedValue([
        {
          module_id: mockModule.module_id,
          title: mockModule.title,
          synopsis: mockModule.synopsis,
          thumbnail: mockModule.thumbnail,
          age_group: mockModule.age_group,
        },
      ]);
      const result = await service.searchModuleByKeyword(keyword);
      expect(result).toEqual([mockModuleCardResponseDto]);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
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
    });

    it('should apply ageGroups filter when provided', async () => {
      const keyword = 'criatividade';
      const ageGroups = ['5-7', '8-10'];
      mockPrismaService.module.findMany.mockResolvedValue([
        {
          module_id: mockModule.module_id,
          title: mockModule.title,
          synopsis: mockModule.synopsis,
          thumbnail: mockModule.thumbnail,
          age_group: mockModule.age_group,
        },
      ]);
      const result = await service.searchModuleByKeyword(keyword, ageGroups);
      expect(result).toEqual([mockModuleCardResponseDto]);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { synopsis: { contains: keyword, mode: 'insensitive' } },
              ],
            },
            { age_group: { in: ageGroups } },
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
    });
  });

  describe('getRecentModules', () => {
    it('should return recent modules filtered by ageGroups', async () => {
      const ageGroups = ['5-7', '8-10'];
      mockPrismaService.module.findMany.mockResolvedValue([
        mockModule,
        mockModule2,
      ]);
      const result = await service.getRecentModules(ageGroups);
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: { age_group: { in: ageGroups } },
        orderBy: { creation_date: 'desc' },
      });
    });

    it('should return recent modules without ageGroups filter', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([
        mockModule,
        mockModule2,
      ]);
      const result = await service.getRecentModules();
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { creation_date: 'desc' },
      });
    });

    it('should throw BadRequestException if no recent modules are found', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([]);

      await expect(service.getRecentModules()).rejects.toThrow(
        'No recent modules found',
      );
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { creation_date: 'desc' },
      });
    });
  });

  describe('getPopularModules', () => {
    it('should return popular modules filtered by ageGroups', async () => {
      const ageGroups = ['5-7'];
      mockPrismaService.module.findMany.mockResolvedValue([mockModule]);
      const result = await service.getPopularModules(ageGroups);
      expect(result).toEqual([mockModuleCardResponseDto]);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: { age_group: { in: ageGroups } },
        orderBy: { views: 'desc' },
      });
    });

    it('should return popular modules without ageGroups filter', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([
        mockModule,
        mockModule2,
      ]);
      const result = await service.getPopularModules();
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { views: 'desc' },
      });
    });

    it('should throw BadRequestException if no popular modules are found', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([]);

      await expect(service.getPopularModules()).rejects.toThrow(
        'No popular modules found',
      );
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { views: 'desc' },
      });
    });
  });

  describe('getRecommendedModules', () => {
    it('should return recommended modules', async () => {
      const mockRandomModules = [
        {
          module_id: '1',
          title: 'Module 1',
          synopsis: 'Synopsis 1',
          thumbnail: 'thumb1.jpg',
          age_group: '5-7',
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (mockPrismaService.$queryRaw as jest.Mock).mockResolvedValue(
        mockRandomModules,
      );

      const result = await service.getRecommendedModules();

      expect(result).toEqual(mockRandomModules);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no recommended modules are found', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      await expect(service.getRecommendedModules()).rejects.toThrow(
        'No recommended modules found',
      );
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
  
   describe('getModuleByIdADM', () => {
    it('should return a complete module with contents if it exists', async () => {
      const moduleId = 'test-module-id';
      mockPrismaService.module.findUnique.mockResolvedValue(mockModule);
      mockPrismaService.content.findMany.mockResolvedValue([
        mockContentResponseDto,
      ]);
      const result = await service.getModuleByIdADM(moduleId);
      expect(result).toEqual(mockModuleResponseDtoADM);
      expect(mockPrismaService.module.findUnique).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
    });
    it('should return a module with empty contents array when no contents exist', async () => {
      const moduleId = 'test-module-id';
      mockPrismaService.module.findUnique.mockResolvedValue(mockModule);
      mockPrismaService.content.findMany.mockResolvedValue([]);
      const result = await service.getModuleByIdADM(moduleId);
      expect(result).toEqual(mockModuleResponseNoContentsDtoADM);
    });

    it('should throw when module does not exist', async () => {
      const moduleId = 'non-existent';
      mockPrismaService.module.findUnique.mockResolvedValue(null);
      await expect(service.getModuleByIdADM(moduleId)).rejects.toThrow(
        'Module not found',
      );
    });
  });
});

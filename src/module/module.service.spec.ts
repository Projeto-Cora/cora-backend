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
      expect(mockPrismaService.module.findUnique).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
    });

    it('should return BadRequestException when module does not exist', async () => {
      const moduleId = 'non-existent-module-id';

      mockPrismaService.module.findUnique.mockResolvedValue(null);

      await expect(service.getModuleById(moduleId)).rejects.toThrow(
        'Module not found',
      );
      expect(mockPrismaService.module.findUnique).toHaveBeenCalledWith({
        where: { module_id: moduleId },
      });
      expect(mockPrismaService.content.findMany).not.toHaveBeenCalled();
    });
  });
  describe('searchModuleByKeyword', () => {
    it('should return all modules that contain the keyword', async () => {
      const keyword = 'criatividade';
      const mockModules = [
        {
          module_id: mockModule.module_id,
          title: mockModule.title,
          synopsis: mockModule.synopsis,
          thumbnail: mockModule.thumbnail,
          age_group: mockModule.age_group,
        },
      ];
      const expectedResponse = [mockModuleCardResponseDto];

      mockPrismaService.module.findMany.mockResolvedValue(mockModules);

      const result = await service.searchModuleByKeyword(keyword);

      expect(result).toEqual(expectedResponse);
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

    it('should return an empty array if no modules match the keyword', async () => {
      const keyword = 'nonexistent';
      mockPrismaService.module.findMany.mockResolvedValue([]);

      const result = await service.searchModuleByKeyword(keyword);

      expect(result).toEqual([]);
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
  });

  describe('getRecentModules', () => {
    it('should return an array of recent modules', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([
        mockModule,
        mockModule2,
      ]);

      const result = await service.getRecentModules();

      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        orderBy: { creation_date: 'desc' },
      });
    });

    it('should throw BadRequestException if no recent modules are found', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([]);

      await expect(service.getRecentModules()).rejects.toThrow(
        'No recent modules found',
      );
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        orderBy: { creation_date: 'desc' },
      });
    });

    it('should return modules ordered by creation_date desc', async () => {
      const olderModule = {
        ...mockModule,
        creation_date: new Date('2023-01-01'),
      };
      const newerModule = {
        ...mockModule2,
        creation_date: new Date('2023-12-31'),
      };

      mockPrismaService.module.findMany.mockResolvedValue([
        newerModule,
        olderModule,
      ]);

      const result = await service.getRecentModules();

      expect(result[0]).toEqual(
        expect.objectContaining({
          title: newerModule.title,
        }),
      );
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        orderBy: { creation_date: 'desc' },
      });
    });
  });

  describe('getPopularModules', () => {
    it('should return an array of popular modules', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([
        mockModule,
        mockModule2,
      ]);

      const result = await service.getPopularModules();

      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        orderBy: { views: 'desc' },
      });
    });

    it('should throw BadRequestException if no popular modules are found', async () => {
      mockPrismaService.module.findMany.mockResolvedValue([]);

      await expect(service.getPopularModules()).rejects.toThrow(
        'No popular modules found',
      );
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        orderBy: { views: 'desc' },
      });
    });

    it('should return modules ordered by views desc', async () => {
      const olderModule = {
        ...mockModule,
        views: 5,
      };
      const newerModule = {
        ...mockModule2,
        views: 10,
      };

      mockPrismaService.module.findMany.mockResolvedValue([
        newerModule,
        olderModule,
      ]);

      const result = await service.getPopularModules();

      expect(result[0]).toEqual(
        expect.objectContaining({
          title: newerModule.title,
        }),
      );
      expect(mockPrismaService.module.findMany).toHaveBeenCalledWith({
        orderBy: { views: 'desc' },
      });
    });
  });

  describe('getRecommendedModules', () => {
    it('should return an array of recommended modules', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue(mockModulesCardResponseDto);

      const result = await service.getRecommendedModules();

      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if no recommended modules are found', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      await expect(service.getRecommendedModules()).rejects.toThrow(
        'No recommended modules found',
      );
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});

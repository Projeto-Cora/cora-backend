import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import {
  mockCreateModuleDto,
  mockModule,
  mockModuleResponseDto,
  mockModulesCardResponseDto,
} from './module.mock';
import { AuthenticatedRequest } from '../auth/dtos/auth.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('ModuleController', () => {
  let controller: ModuleController;

  const mockModuleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getModuleById: jest.fn(),
    getRecentModules: jest.fn(),
    searchModuleByKeyword: jest.fn(),
    getPopularModules: jest.fn(),
    getRecommendedModules: jest.fn(),
    updateModule: jest.fn(),
    deleteModule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuleController],
      providers: [
        {
          provide: ModuleService,
          useValue: mockModuleService,
        },
        AuthGuard,
        RolesGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ModuleController>(ModuleController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const userId = 'test-user-id';
    const mockRequest = {
      payload: { userId: userId, userType: 'parent' },
    } as AuthenticatedRequest;

    it('should create a module successfully', async () => {
      mockModuleService.create.mockResolvedValue(mockModule);
      const result = await controller.create(mockRequest, mockCreateModuleDto);
      expect(result).toEqual(mockModule);
      expect(mockModuleService.create).toHaveBeenCalledWith(
        mockCreateModuleDto,
        userId,
      );
    });

    it('should throw HttpException if service create fails', async () => {
      const HTTP_SERVER_ERROR = 500;
      const serviceError = new HttpException(
        'Service error',
        HTTP_SERVER_ERROR,
      );
      mockModuleService.create.mockRejectedValue(serviceError);
      await expect(
        controller.create(mockRequest, mockCreateModuleDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getModuleById', () => {
    const returnModuleId = 'test-mock-response-id';

    it('should return a module if it exists', async () => {
      mockModuleService.getModuleById.mockResolvedValue(mockModuleResponseDto);
      const result = await controller.getModuleById(returnModuleId);
      expect(result).toEqual(mockModuleResponseDto);
    });

    it('should throw BadRequestException if no module is found', async () => {
      mockModuleService.getModuleById.mockRejectedValue(
        new BadRequestException('Module not found'),
      );
      await expect(controller.getModuleById(returnModuleId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockModuleService.getModuleById).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecentModules', () => {
    it('should return an array of recent modules without ageGroups', async () => {
      mockModuleService.getRecentModules.mockResolvedValue(
        mockModulesCardResponseDto,
      );
      const result = await controller.getRecentModules();
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockModuleService.getRecentModules).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should return an array of recent modules with ageGroups', async () => {
      const ageGroups = ['5-7', '8-10'];
      mockModuleService.getRecentModules.mockResolvedValue(
        mockModulesCardResponseDto,
      );
      const result = await controller.getRecentModules(ageGroups);
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockModuleService.getRecentModules).toHaveBeenCalledWith(
        ageGroups,
      );
    });

    it('should return an empty array if no recent modules are found', async () => {
      mockModuleService.getRecentModules.mockResolvedValue([]);
      const result = await controller.getRecentModules();
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException if service throws', async () => {
      mockModuleService.getRecentModules.mockRejectedValue(
        new BadRequestException('No recent modules found'),
      );
      await expect(controller.getRecentModules()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPopularModules', () => {
    it('should return popular modules without ageGroups', async () => {
      mockModuleService.getPopularModules.mockResolvedValue(
        mockModulesCardResponseDto,
      );
      const result = await controller.getPopularModules();
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockModuleService.getPopularModules).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should return popular modules with ageGroups', async () => {
      const ageGroups = ['5-7'];
      mockModuleService.getPopularModules.mockResolvedValue(
        mockModulesCardResponseDto,
      );
      const result = await controller.getPopularModules(ageGroups);
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockModuleService.getPopularModules).toHaveBeenCalledWith(
        ageGroups,
      );
    });

    it('should return an empty array if no popular modules are found', async () => {
      mockModuleService.getPopularModules.mockResolvedValue([]);
      const result = await controller.getPopularModules();
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException if service throws', async () => {
      mockModuleService.getPopularModules.mockRejectedValue(
        new BadRequestException('No popular modules found'),
      );
      await expect(controller.getPopularModules()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRecommendedModules', () => {
    it('should return recommended modules without ageGroups', async () => {
      mockModuleService.getRecommendedModules.mockResolvedValue(
        mockModulesCardResponseDto,
      );
      const result = await controller.getRecommendedModules();
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockModuleService.getRecommendedModules).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should return recommended modules with ageGroups', async () => {
      const ageGroups = ['8-10'];
      mockModuleService.getRecommendedModules.mockResolvedValue(
        mockModulesCardResponseDto,
      );
      const result = await controller.getRecommendedModules(ageGroups);
      expect(result).toEqual(mockModulesCardResponseDto);
      expect(mockModuleService.getRecommendedModules).toHaveBeenCalledWith(
        ageGroups,
      );
    });

    it('should return an empty array if no recommended modules are found', async () => {
      mockModuleService.getRecommendedModules.mockResolvedValue([]);
      const result = await controller.getRecommendedModules();
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException if service throws', async () => {
      mockModuleService.getRecommendedModules.mockRejectedValue(
        new BadRequestException('No recommended modules found'),
      );
      await expect(controller.getRecommendedModules()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('searchModules', () => {
    const keyword = 'test';

    it('should return modules matching keyword without ageGroups', async () => {
      mockModuleService.searchModuleByKeyword.mockResolvedValue([mockModule]);
      const result = await controller.searchModules(keyword);
      expect(result).toEqual([mockModule]);
      expect(mockModuleService.searchModuleByKeyword).toHaveBeenCalledWith(
        keyword,
        undefined,
      );
    });

    it('should return modules matching keyword with ageGroups', async () => {
      const ageGroups = ['5-7', '8-10'];
      mockModuleService.searchModuleByKeyword.mockResolvedValue([mockModule]);
      const result = await controller.searchModules(keyword, ageGroups);
      expect(result).toEqual([mockModule]);
      expect(mockModuleService.searchModuleByKeyword).toHaveBeenCalledWith(
        keyword,
        ageGroups,
      );
    });

    it('should return empty array if no modules match keyword', async () => {
      mockModuleService.searchModuleByKeyword.mockResolvedValue([]);
      const result = await controller.searchModules(keyword);
      expect(result).toEqual([]);
    });
  });
});

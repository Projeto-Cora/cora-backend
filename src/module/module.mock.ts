import { Module } from '@prisma/client';
import { ModuleResponseDto, ModuleCardResponseDto } from './dtos/module.dto';
import { mockContentResponseDto } from '../content/content.mock';

export const mockModule: Module = {
  module_id: 'test-module-id',
  title: 'Module Title',
  synopsis: 'This is a test module synopsis.',
  thumbnail: 'image.jpg',
  age_group: '5-7',
  views: 4,
  creation_date: new Date(),
  updatedAt: new Date(),
  user_id: '',
};

export const mockModule2: Module = {
  module_id: 'test-module-id-2',
  title: 'Module Title 2',
  synopsis: 'This is another test module synopsis.',
  thumbnail: 'another-image.jpg',
  age_group: '8-10',
  views: 2,
  creation_date: new Date(),
  updatedAt: new Date(),
  user_id: '',
};

export const mockCreateModuleDto: ModuleCardResponseDto = {
  module_id: 'test-module-id',
  title: 'Module Title',
  synopsis: 'This is a test module synopsis.',
  thumbnail: 'image.jpg',
  age_group: '5-7',
};

export const mockModuleResponseDto: ModuleResponseDto = {
  title: 'Module Title',
  contents: [mockContentResponseDto],
};

export const mockModuleResponseNoContentsDto: ModuleResponseDto = {
  title: 'Module Title',
  contents: [],
};

export const mockModuleCardResponseDto = {
  module_id: 'test-module-id',
  title: 'Module Title',
  synopsis: 'This is a test module synopsis.',
  thumbnail: 'image.jpg',
  age_group: '5-7',
};

export const mockModulesCardResponseDto = [
  {
    module_id: 'test-module-id',
    title: 'Module Title',
    synopsis: 'This is a test module synopsis.',
    thumbnail: 'image.jpg',
    age_group: '5-7',
  },
  {
    module_id: 'test-module-id-2',
    title: 'Module Title 2',
    synopsis: 'This is another test module synopsis.',
    thumbnail: 'another-image.jpg',
    age_group: '8-10',
  },
];

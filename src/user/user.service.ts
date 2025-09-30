import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChildrenResponseDto,
  CreateUserDto,
  UserResponseDto,
  SpecialistProfileResponseDto,
} from './dtos/user.dto';
import { UserType } from 'src/user/enum/user-type-enum';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { children, specialist_profile, ...userData } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    if (!Object.values(UserType).includes(userData.user_type)) {
      throw new BadRequestException('User type invalid.');
    }

    if (
      userData.user_type === UserType.PARENT &&
      (!children || children.length === 0)
    ) {
      throw new BadRequestException('Parent must have at least one child');
    }

    if (userData.user_type === UserType.SPECIALIST && !specialist_profile) {
      throw new BadRequestException(
        'Specialist must have a specialist profile',
      );
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          user_type: userData.user_type,
          profile_picture: userData.profile_picture ?? '',
        },
      });

      let createdChildren: ChildrenResponseDto[] = [];
      let createdSpecialistProfile: SpecialistProfileResponseDto | null = null;

      if (userData.user_type === UserType.PARENT && children?.length) {
        const childCreationPromises = children.map((child) =>
          prisma.child.create({
            data: {
              name: child.name,
              birth_date: new Date(child.birth_date),
              age_group: child.age_group,
              parent_id: user.user_id,
            },
          }),
        );

        createdChildren = await Promise.all(childCreationPromises);
      }

      if (userData.user_type === UserType.SPECIALIST && specialist_profile) {
        createdSpecialistProfile = await prisma.specialistProfile.create({
          data: {
            specialist_id: user.user_id,
            specialty: specialist_profile.specialty,
            description: specialist_profile.description,
            council_number: specialist_profile.council_number,
          },
        });
      }

      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        children: createdChildren,
        specialist_profile: createdSpecialistProfile,
      };
    });

    return result;
  }
}

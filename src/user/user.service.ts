import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/user.dto';
import { Child, SpecialistProfile } from '@prisma/client';
import { UserType } from 'src/module/enum/user-type-enum';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { children, specialist_profile, ...userData } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
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

      let createdChildren: Child[] = [];
      let createdSpecialistProfile: SpecialistProfile | null = null;

      if (userData.user_type === UserType.RESPONSIBLE && children?.length) {
        const childrenData = children.map((child) => ({
          name: child.name,
          birth_date: child.birth_date,
          age_group: child.age_group,
          parent_id: user.user_id,
        }));

        await prisma.child.createMany({
          data: childrenData,
          skipDuplicates: true,
        });

        createdChildren = await prisma.child.findMany({
          where: { parent_id: user.user_id },
        });
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

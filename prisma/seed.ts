/* eslint-disable no-magic-numbers */
import { PrismaClient } from '@prisma/client';
import { HashService } from '../src/auth/hash.service';

const prisma = new PrismaClient();
const hashService = new HashService();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        user_id: '1e7b8f8e-8f8e-4f8e-8f8e-1e7b8f8e8f8e',
        name: 'Thiago Defini',
        email: 'thiago@example.com',
        password: await hashService.hash('123@password'),
        user_type: 'admin',
        profile_picture: 'profile1.jpg',
        creation_date: new Date(),
      },
      {
        user_id: '2a7b8f8e-8f8e-4f8e-8f8e-2a7b8f8e8f8e',
        name: 'Francisco Coronel Pippi',
        email: 'francisco@example.com',
        password: await hashService.hash('123@password'),
        user_type: 'parent',
        profile_picture: 'profile1.jpg',
        creation_date: new Date(),
      },
      {
        user_id: '3b7b8f8e-8f8e-4f8e-8f8e-3b7b8f8e8f8e',
        name: 'Maria Eduarda Wendel Maia',
        email: 'maria@example.com',
        password: await hashService.hash('123@password'),
        user_type: 'specialist',
        profile_picture: 'profile1.jpg',
        creation_date: new Date(),
      },
    ],
  });

  const user = await prisma.user.findUnique({
    where: {
      email: 'thiago@example.com',
    },
  });
  if (!user) {
    throw new Error('Usuário não encontrado!');
  }

  const user2 = await prisma.user.findUnique({
    where: {
      email: 'francisco@example.com',
    },
  });
  if (!user2) {
    throw new Error('Usuário não encontrado!');
  }

  const user3 = await prisma.user.findUnique({
    where: {
      email: 'maria@example.com',
    },
  });
  if (!user3) {
    throw new Error('Usuário não encontrado!');
  }

  await prisma.specialistProfile.create({
    data: {
      specialist_id: user3.user_id,
      specialty: 'Psicologia infantil',
      description:
        'Especialista em criatividade e inovação, com 10 anos de experiência ajudando pessoas a desbloquear seu potencial criativo.',
      council_number: 'CRP 12345',
    },
  });

  const specialistProfile = await prisma.specialistProfile.findUnique({
    where: {
      specialist_id: user3.user_id,
    },
  });
  if (!specialistProfile) {
    throw new Error('Perfil de especialista não encontrado!');
  }

  await prisma.child.createMany({
    data: [
      {
        child_id: '4c7b8f8e-8f8e-4f8e-8f8e-4c7b8f8e8f8e',
        name: 'Ana Clara',
        birth_date: new Date('2020-06-15'),
        age_group: '5-7',
        parent_id: user2.user_id,
      },
      {
        child_id: '5d7b8f8e-8f8e-4f8e-8f8e-5d7b8f8e8f8e',
        name: 'João Pedro',
        birth_date: new Date('2016-09-20'),
        age_group: '8-10',
        parent_id: user2.user_id,
      },
    ],
  });

  const child1 = await prisma.child.findUnique({
    where: {
      child_id: '4c7b8f8e-8f8e-4f8e-8f8e-4c7b8f8e8f8e',
    },
  });
  if (!child1) {
    throw new Error('Criança não encontrada!');
  }

  const child2 = await prisma.child.findUnique({
    where: {
      child_id: '5d7b8f8e-8f8e-4f8e-8f8e-5d7b8f8e8f8e',
    },
  });
  if (!child2) {
    throw new Error('Criança não encontrada!');
  }

  await prisma.module.createMany({
    data: [
      {
        module_id: '6e7b8f8e-8f8e-4f8e-8f8e-6e7b8f8e8f8e',
        title: 'Módulo 1',
        synopsis:
          'Explore o mundo da criatividade e descubra como ela pode transformar sua vida.',
        thumbnail: 'module1.jpg',
        age_group: ["5-7"],
        user_id: user3.user_id,
      },
      {
        module_id: '7f7b8f8e-8f8e-4f8e-8f8e-7f7b8f8e8f8e',
        title: 'Módulo 2',
        synopsis:
          'Aprenda técnicas práticas para estimular sua criatividade diariamente.',
        thumbnail: 'module2.jpg',
        age_group: ["8-10"],
        user_id: user3.user_id,
      },
    ],
  });

  const module1 = await prisma.module.findUnique({
    where: {
      module_id: '6e7b8f8e-8f8e-4f8e-8f8e-6e7b8f8e8f8e',
    },
  });

  if (!module1) {
    throw new Error('Módulo 1 não encontrado!');
  }

  const module2 = await prisma.module.findUnique({
    where: {
      module_id: '7f7b8f8e-8f8e-4f8e-8f8e-7f7b8f8e8f8e',
    },
  });

  if (!module2) {
    throw new Error('Módulo 2 não encontrado!');
  }

  await prisma.content.createMany({
    data: [
      {
        content_id: '8g7b8f8e-8f8e-4f8e-8f8e-8g7b8f8e8f8e',
        text: 'Bem-vindo ao Módulo 1! Neste módulo, você aprenderá sobre a importância da criatividade.',
        image: 'content1.jpg',
        template: 'text-image',
        video_link: null,
        module_id: module1.module_id,
      },
      {
        content_id: '9h7b8f8e-8f8e-4f8e-8f8e-9h7b8f8e8f8e',
        text: 'Bem-vindo ao Módulo 2! Neste módulo, você aprenderá técnicas para estimular sua criatividade.',
        image: 'content2.jpg',
        template: 'text-image',
        video_link: null,
        module_id: module2.module_id,
      },
    ],
  });

  const content1 = await prisma.content.findUnique({
    where: {
      content_id: '8g7b8f8e-8f8e-4f8e-8f8e-8g7b8f8e8f8e',
    },
  });

  if (!content1) {
    throw new Error('Conteúdo 1 não encontrado!');
  }

  const content2 = await prisma.content.findUnique({
    where: {
      content_id: '9h7b8f8e-8f8e-4f8e-8f8e-9h7b8f8e8f8e',
    },
  });

  if (!content2) {
    throw new Error('Conteúdo 2 não encontrado!');
  }

  await prisma.question.create({
    data: {
      question_id: '0i7b8f8e-8f8e-4f8e-8f8e-0i7b8f8e8f8e',
      title: 'Pergunta sobre Módulo 1',
      text: 'Quando começar a falar sobre sexualidade com meu filho(a)?',
      keywords: ['sexualidade', 'filho', 'conversa'],
      user_id: user2.user_id,
    },
  });

  const question = await prisma.question.findUnique({
    where: {
      question_id: '0i7b8f8e-8f8e-4f8e-8f8e-0i7b8f8e8f8e',
    },
  });

  if (!question) {
    throw new Error('Pergunta não encontrada!');
  }

  await prisma.reply.createMany({
    data: [
      {
        reply_id: '1j7b8f8e-8f8e-4f8e-8f8e-1j7b8f8e8f8e',
        text: 'Você pode começar a falar sobre sexualidade desde cedo, adaptando a conversa à idade da criança.',
        is_anonymous: false,
        user_id: user2.user_id,
        question_id: question.question_id,
      },
      {
        reply_id: '2k7b8f8e-8f8e-4f8e-8f8e-2k7b8f8e8f8e',
        text: 'É importante criar um ambiente aberto e seguro para que seu filho(a) se sinta confortável para fazer perguntas.',
        is_anonymous: true,
        user_id: user3.user_id,
        question_id: question.question_id,
      },
    ],
  });

  const reply1 = await prisma.reply.findUnique({
    where: {
      reply_id: '1j7b8f8e-8f8e-4f8e-8f8e-1j7b8f8e8f8e',
    },
  });

  if (!reply1) {
    throw new Error('Resposta 1 não encontrada!');
  }

  const reply2 = await prisma.reply.findUnique({
    where: {
      reply_id: '2k7b8f8e-8f8e-4f8e-8f8e-2k7b8f8e8f8e',
    },
  });

  if (!reply2) {
    throw new Error('Resposta 2 não encontrada!');
  }
}

main()
  .catch(() => {
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });

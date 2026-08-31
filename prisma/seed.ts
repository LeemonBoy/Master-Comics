import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosmicreader.local' },
    update: {},
    create: {
      email: 'admin@cosmicreader.local',
      username: 'admin',
      passwordHash,
      displayName: 'Administrador',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: 'creator@cosmicreader.local' },
    update: {},
    create: {
      email: 'creator@cosmicreader.local',
      username: 'creator',
      passwordHash,
      displayName: 'Creador',
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@cosmicreader.local' },
    update: {},
    create: {
      email: 'reader@cosmicreader.local',
      username: 'reader',
      passwordHash,
      displayName: 'Lector',
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  });

  const genres = await Promise.all(
    ['Terror', 'Ciencia ficción', 'Fantasía', 'Aventura', 'Misterio'].map((name) =>
      prisma.genre.upsert({
        where: { slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') },
        update: {},
        create: { name, slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') },
      }),
    ),
  );

  const comic = await prisma.comic.create({
    data: {
      title: 'El eco de las estrellas',
      description: 'Una aventura cósmica donde el horror se esconde entre las nebulosas.',
      authorId: creator.id,
      artistId: creator.id,
      status: 'PUBLISHED',
      ageRating: '13+',
      language: 'es',
      coverImage: 'https://placehold.co/400x600/0a0a0f/c9a227?text=Eco+de+estrellas',
      views: 142,
      genres: { create: genres.slice(0, 2).map((g) => ({ genreId: g.id })) },
      tags: {
        create: [
          { tag: { connectOrCreate: { where: { slug: 'cosmico' }, create: { name: 'cósmico', slug: 'cosmico' } } } },
          { tag: { connectOrCreate: { where: { slug: 'lovecraft' }, create: { name: 'lovecraftiano', slug: 'lovecraft' } } } },
        ],
      },
      chapters: {
        create: [
          {
            title: 'El sueño del abismo',
            chapterNumber: 1,
            coverImage: 'https://placehold.co/400x600/0a0a0f/c9a227?text=Cap+1',
            isPublished: true,
            pages: {
              create: [
                { pageNumber: 1, imageUrl: 'https://placehold.co/800x1200/0a0a0f/c9a227?text=Pag+1' },
                { pageNumber: 2, imageUrl: 'https://placehold.co/800x1200/0a0a0f/c9a227?text=Pag+2' },
                { pageNumber: 3, imageUrl: 'https://placehold.co/800x1200/0a0a0f/c9a227?text=Pag+3' },
              ],
            },
          },
        ],
      },
    },
    include: { genres: true, tags: true, chapters: true },
  });

  await prisma.userFavorite.create({
    data: { userId: reader.id, comicId: comic.id },
  });

  await prisma.readingHistory.create({
    data: { userId: reader.id, comicId: comic.id, chapterId: comic.chapters[0].id, lastPageNumber: 2, progress: 2 / 3 },
  });

  await prisma.advertisement.create({
    data: {
      name: 'Banner prueba home',
      placement: 'HOME',
      imageUrl: 'https://placehold.co/728x90/0a0a0f/c9a227?text=Ad+Home',
      linkUrl: 'https://example.com',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2030-01-01'),
      isActive: true,
    },
  });

  await prisma.advertisement.create({
    data: {
      name: 'Banner prueba reader',
      placement: 'READER',
      imageUrl: 'https://placehold.co/728x90/0a0a0f/c9a227?text=Ad+Reader',
      linkUrl: 'https://example.com',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2030-01-01'),
      isActive: true,
    },
  });

  console.log('Seed ejecutado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());

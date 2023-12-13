import { Prisma } from '~/prisma/generated/mysql';

const mediaPublished: Prisma.MediaWhereInput = {
  OR: [
    {
      publishedAt: {
        gte: new Date(),
      },
    },
    {
      publishedAt: null,
    },
  ],
  viewMode: 'PUBLIC',
};

export default {
  published: mediaPublished,
};
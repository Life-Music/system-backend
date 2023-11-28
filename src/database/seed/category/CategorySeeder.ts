import { Prisma } from '~/prisma/generated/mysql';
import BaseSeeder from '../BaseSeeder';
import elasticSearch from '@src/services/ElasticSearch';

export default class CategorySeeder extends BaseSeeder {

  public async up(): Promise<void> {
    const data = this.factory();
    for (const row of data) {
      await this.prisma.$transaction(async (ctx) => {
        const category = await ctx.category.create({
          data: row,
        });
        await elasticSearch.index({
          index: 'category',
          id: category.id,
          document: {
            name: category.name,
            id: category.id,
          },
        });
      });
    }
  }

  public async down(): Promise<void> {
    await this.prisma.$transaction(async (ctx) => {
      await ctx.category.deleteMany({
        where: {},
      });
      await elasticSearch.indices.delete({
        index: 'category',

      });
    });
  }

  public factory() {
    const data: Prisma.CategoryCreateInput[] = [
      {
        name: 'Nhạc trung',
      },
      {
        name: 'Nhạc Việt',
      },
      {
        name: 'Nhạc Âu Mỹ',
      },
      {
        name: 'Nhạc EDM',
      },
    ];
    return data;
  }
}
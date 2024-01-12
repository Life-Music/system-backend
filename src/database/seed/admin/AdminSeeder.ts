import { Prisma } from '~/prisma/generated/mysql';
import BaseSeeder from '../BaseSeeder';
import md5 from 'md5';

export default class AdminSeeder extends BaseSeeder {

  public async up(): Promise<void> {
    const data = this.factory();
    for (const row of data) {
      await this.prisma.admin.create({
        data: row,
      });
    }
  }

  public async down(): Promise<void> {
    await this.prisma.admin.deleteMany({
      where: {},
    });
  }

  public factory() {
    const data: Prisma.AdminCreateInput[] = [
      {
        username: 'Ily1606',
        password: md5('Cunguyen9001'),
      },
    ];
    return data;
  }
}
import { PrismaClient } from '~/prisma/generated/mysql';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class BaseSeeder {

  public prisma = new PrismaClient();

  public async up() {

  }

  public async down() {

  }

  public factory(): any {
    return [];
  }
}
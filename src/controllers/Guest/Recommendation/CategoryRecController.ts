import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';
import { Prisma } from '~/prisma/generated/mysql';

class CategoryRecController extends BaseController {

  public getCategoryRec = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
    };

    const categoryRec = await globalThis.prisma.category.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where: {},
    });

    const totalRecords = await globalThis.prisma.category.count({
      where: {},
    });

    return res.json(
      this.successWithMeta(
        categoryRec,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };

  public getMediaInCategoryRec = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
    };

    const where: Prisma.CategoryWhereInput = {
      categoryOnMedia: {
        some: {
          media: MediaScoped.published,
        },
      },
      hot: true,
    };

    const categoryRec = await globalThis.prisma.category.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      select: {
        name: true,
        id: true,
        categoryOnMedia: {
          select: {
            media: {
              include: {
                owner: true,
                thumbnails: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            media: {
              createdAt: 'desc',
            },
          },
          take: 10,
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      where,
    });

    const totalRecords = await globalThis.prisma.category.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        categoryRec,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };
}

const controller = new CategoryRecController();

const getCategoryRec = controller.getCategoryRec;
const getMediaInCategoryRec = controller.getMediaInCategoryRec;

export {
  getCategoryRec,
  getMediaInCategoryRec,
};
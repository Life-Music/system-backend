import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import { Request, Response } from 'express';
import { Prisma } from '~/prisma/generated/mysql';

class CategoryRecController extends BaseController {
  public getCategoryRec = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
    };

    const where: Prisma.CategoryWhereInput = {
      categoryOnMedia: {
        some: {
          media: {
            viewMode: 'PUBLIC',
          },
        },
      },
    };

    const categoryRec = await globalThis.prisma.category.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      select: {
        categoryOnMedia: {
          select: {
            media: {
              include: {
                owner: true,
                thumbnails: {
                  where: {
                    isPrimary: true,
                  },
                },
              },
            },
          },
        },
      },
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

export {
  getCategoryRec,
};
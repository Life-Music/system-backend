import { Request, Response } from 'express';
import AdminBaseController from './AdminBaseController';
import UnexpectedException from '@src/exception/UnexpectedException';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import { Prisma } from '~/prisma/generated/mysql';
import elasticSearch from '@src/services/ElasticSearch';

class CategoryManagementController extends AdminBaseController {

  public list = async (req: Request, res: Response) => {
    if (!req.adminInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      page: number,
      take: number,
      name: string,
      id: string,
    };

    const where: Prisma.CategoryWhereInput = {};
    if (fields.name) where.name = { contains: fields.name };
    if (fields.id) where.id = fields.id;

    const users = await globalThis.prisma.category.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            categoryOnMedia: true,
          },
        },
      },
      skip: fields.take * fields.page - fields.take,
      take: fields.take,
    });

    const totalObject = await globalThis.prisma.category.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        users,
        this.buildMetaPagination(totalObject, fields.page, fields.take, Math.ceil(totalObject / fields.take)),
      ),
    );
  };

  public update = async (req: Request, res: Response) => {
    if (!req.adminInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      name: string,
      hot: boolean,
    };

    const category = await globalThis.prisma.$transaction(async (ctx) => {
      const category = await ctx.category.update({
        where: {
          id: req.params.categoryId,
        },
        data: {
          name: fields.name,
          hot: fields.hot,
        },
      });

      try {
        await elasticSearch.update({
          index: 'category',
          id: req.params.categoryId,
          doc: {
            id: req.params.categoryId,
            name: fields.name,
          },
        });
      }
      catch (e) {
        console.error(e);
        throw e;
      }
      return category;

    });


    return res.json(this.success(category));
  };

  public create = async (req: Request, res: Response) => {
    if (!req.adminInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      name: string,
      hot: boolean,
    };

    const category = await globalThis.prisma.$transaction(async (ctx) => {
      const category = await ctx.category.create({
        data: {
          name: fields.name,
          hot: fields.hot,
        },
      });

      try {
        await elasticSearch.create({
          index: 'category',
          id: category.id,
          document: {
            name: category.name,
            id: category.id,
          },
        });
      }
      catch (e) {
        console.error(e);
        throw e;
      }
      return category;

    });


    return res.json(this.success(category));
  };

  public delete = async (req: Request, res: Response) => {
    if (!req.adminInfo) throw new UnexpectedException();

    const category = await globalThis.prisma.$transaction(async (ctx) => {
      const category = await ctx.category.delete({
        where: {
          id: req.params.categoryId,
        },
      });

      try {
        await elasticSearch.delete({
          index: 'category',
          id: category.id,
        });
      }
      catch (e) {
        console.error(e);
        throw e;
      }
      return category;

    });


    return res.json(this.success(category));
  };
}

const controller = new CategoryManagementController();
const adminListCategory = controller.list;
const adminUpdateCategory = controller.update;
const adminDeleteCategory = controller.delete;
const adminCreateCategory = controller.create;

export {
  adminListCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminCreateCategory,
};
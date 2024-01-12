import { Request, Response } from 'express';
import AdminBaseController from './AdminBaseController';
import UnexpectedException from '@src/exception/UnexpectedException';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import { Prisma } from '~/prisma/generated/mysql';

class UserManagementController extends AdminBaseController {

  public list = async (req: Request, res: Response) => {
    if (!req.adminInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      page: number,
      take: number,
      email: string,
      username: string,
      id: string,
    };

    const where: Prisma.UserWhereInput = {};
    if (fields.email) where.email = { contains: fields.email };
    if (fields.username) where.username = { contains: fields.username };
    if (fields.id) where.id = fields.id;

    const users = await globalThis.prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: fields.take * fields.page - fields.take,
      take: fields.take,
    });

    const totalObject = await globalThis.prisma.user.count({
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
      email: string,
      username: string,
      firstName: string,
      lastName: string,
    };

    const user = await globalThis.prisma.user.update({
      where: {
        id: req.params.userId,
      },
      data: {
        email: fields.email,
        username: fields.username,
        firstName: fields.firstName,
        lastName: fields.lastName,
      },
    });

    return res.json(
      this.success(
        user,
      ),
    );
  };
}

const controller = new UserManagementController();
const adminListUser = controller.list;
const adminUpdateUser = controller.update;

export {
  adminListUser,
  adminUpdateUser,
};
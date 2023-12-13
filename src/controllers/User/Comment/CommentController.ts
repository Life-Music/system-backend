import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';
import { Prisma } from '~/prisma/generated/mysql';

class CommentController extends BaseController {

  public saveComment = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const mediaId = req.params.mediaId;
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      content: string
    };

    const comment = await globalThis.prisma.comment.create({
      data: {
        userId,
        mediaId: mediaId,
        comment: fields.content,
      },
      include: {
        user: true,
      },
    });

    return res.json(
      this.success(comment),
    );
  };

  public deleteComment = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const commentId = req.params.commentId;

    try {
      const comment = await globalThis.prisma.comment.delete({
        where: {
          userId: userId,
          id: commentId,
        },
      });

      return res.json(
        this.success(comment),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public getComments = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const mediaId = req.params.mediaId;
    const fields = req.fields as {
      page: number,
      take: number,
    };

    const where: Prisma.CommentWhereInput = {
      media: MediaScoped.published,
      mediaId,
    };

    const comments = await globalThis.prisma.comment.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where,
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    const totalRecords = await globalThis.prisma.comment.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        comments,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };

}

const controllers = new CommentController();
const saveComment = controllers.saveComment;
const deleteComment = controllers.deleteComment;
const getComments = controllers.getComments;

export {
  saveComment,
  deleteComment,
  getComments,
};
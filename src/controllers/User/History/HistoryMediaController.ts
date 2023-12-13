import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';
import { Prisma } from '~/prisma/generated/mysql';

class HistoryMediaController extends BaseController {

  public getHistoryMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
    };

    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const where: Prisma.HistoryWhereInput = {
      userId,
      media: MediaScoped.published,
    };

    const history = await globalThis.prisma.history.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where,
      include: {
        media: {
          include: {
            owner: true,
            thumbnails: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const totalRecords = await globalThis.prisma.history.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        history,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };

  public saveHistoryMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      mediaId: string,
    };

    await globalThis.prisma.media.update({
      where: {
        id: fields.mediaId,
      },
      data: {
        plays: {
          increment: 1,
        },
      },
    });

    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }

    const history = await globalThis.prisma.history.upsert({
      where: {
        onlyOne: {
          userId: req.userInfo.id,
          mediaId: fields.mediaId,
        },
      },
      create: {
        userId: req.userInfo.id,
        mediaId: fields.mediaId,
      },
      update: {
        mediaId: fields.mediaId,
      },
    });

    return res.json(
      this.success(history),
    );
  };
}

const historyMediaController = new HistoryMediaController();
const getHistoryMedia = historyMediaController.getHistoryMedia;
const saveHistoryMedia = historyMediaController.saveHistoryMedia;

export {
  getHistoryMedia,
  saveHistoryMedia,
};

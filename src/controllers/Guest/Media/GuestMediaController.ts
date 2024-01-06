import { Request, Response } from 'express';
import BaseController from '../../BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import { Prisma } from '~/prisma/generated/mysql';
import MediaScoped from '@src/scopes/MediaScoped';


class GuestMediaController extends BaseController {
  public listMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
      q: string | undefined,
    };

    let where: Prisma.MediaWhereInput = {
      ...MediaScoped.published,
    };

    if (fields.q) {
      where = {
        ...where,
        title: {
          contains: fields.q,
        },
      };
    }

    const media = await globalThis.prisma.media.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where,
      include: {
        detail: true,
        thumbnails: true,
        audioResources: true,
        videoResources: true,
        owner: true,
        _count: {
          select: {
            comment: true,
            mediaReaction: {
              where: {
                isLike: true,
              },
            },
          },
        },
        mediaOnAlbum: {
          select: {
            album: true,
          },
        },
        mediaOnCategory: {
          select: {
            category: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });

    const totalObject = await globalThis.prisma.media.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        media,
        this.buildMetaPagination(totalObject, fields.page, fields.take, Math.ceil(totalObject / fields.take)),
      ),
    );
  };
}

const controller = new GuestMediaController();
const guestListMedia = controller.listMedia;

export {
  guestListMedia,
};
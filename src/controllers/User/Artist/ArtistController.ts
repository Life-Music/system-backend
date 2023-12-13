import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import UnexpectedException from '@src/exception/UnexpectedException';
import { Request, Response } from 'express';
import { Prisma } from '~/prisma/generated/mysql';

class ArtistController extends BaseController {

  public getArtist = async (req: Request, res: Response) => {
    const artistId = req.params.artistId;
    const artist = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: artistId,
      },
      include: {
        _count: {
          select: {
            subscribers: true,
            media: true,
          },
        },
        media: {
          include: {
            thumbnails: true,
            owner: true,
          },
          take: 10,
          orderBy: [
            {
              mediaReaction: {
                _count: 'desc',
              },
            },
            {
              createdAt: 'desc',
            },
          ],
        },
      },
    });

    let subscribe;
    if (req.userInfo) {
      subscribe = await globalThis.prisma.subscriber.findUnique({
        where: {
          userId_channelId: {
            channelId: artistId,
            userId: req.userInfo.id,
          },
        },
      });
    }

    return res.json(
      this.success({
        artist,
        subscribe,
      }),
    );
  };

  public subscribeArtist = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    const userId = req.userInfo.id;
    const artistId = req.params.artistId;

    const current = await globalThis.prisma.subscriber.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId: artistId,
        },
      },
    });

    let result;
    if (!current) {
      result = await globalThis.prisma.subscriber.create({
        data: {
          userId,
          channelId: artistId,
        },
      });
    }
    else {
      result = await globalThis.prisma.subscriber.delete({
        where: {
          userId_channelId: {
            userId,
            channelId: artistId,
          },
        },
      });
    }

    return res.json(
      this.success(result),
    );
  };

  public listArtist = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
      isSubscribed: boolean,
      q: string | undefined,
    };

    let where: Prisma.UserWhereInput = {
      media: {
        some: {},
      },
    };

    if (fields.isSubscribed) {
      where = {
        ...where,
        channel: {
          some: {},
        },
      };
    }

    if (fields.q) {
      where = {
        ...where,
        OR: [
          {
            firstName: {
              contains: fields.q,
            },
          },
          {
            lastName: {
              contains: fields.q,
            },
          },
          {
            id: fields.q,
          },
        ],
      };
    }
    const artists = await globalThis.prisma.user.findMany({
      where,
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      include: {
        _count: {
          select: {
            subscribers: true,
            media: true,
          },
        },
      },
      orderBy: [
        {
          subscribers: {
            _count: 'desc',
          },
        },
        {
          media: {
            _count: 'desc',
          },
        },
      ],
    });

    const totalRecords = await globalThis.prisma.user.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        artists,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };
}

const controller = new ArtistController();
const listArtist = controller.listArtist;
const getArtist = controller.getArtist;
const subscribeArtist = controller.subscribeArtist;

export {
  listArtist,
  getArtist,
  subscribeArtist,
};
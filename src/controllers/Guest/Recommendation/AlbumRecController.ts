import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';
import { Prisma } from '~/prisma/generated/mysql';

class AlbumRecController extends BaseController {

  public getAlbumRec = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
    };

    const albumRec = await globalThis.prisma.album.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where: {},
      include: {
        owner: true,
      },
    });

    const totalRecords = await globalThis.prisma.album.count({
      where: {},
    });

    return res.json(
      this.successWithMeta(
        albumRec,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };

  public getMediaInAlbumRec = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      page: number,
      take: number,
    };

    const where: Prisma.AlbumWhereInput = {
      mediaOnAlbum: {
        some: {
          media: MediaScoped.published,
        },
      },
    };

    const albumRec = await globalThis.prisma.album.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      select: {
        name: true,
        mediaOnAlbum: {
          orderBy: {
            media: {
              createdAt: 'desc',
            },
          },
          where: {
            media: MediaScoped.published,
          },
          select: {
            media: {
              include: {
                owner: true,
                thumbnails: true,
              },
            },
          },
        },
      },
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRecords = await globalThis.prisma.album.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        albumRec,
        this.buildMetaPagination(totalRecords, fields.page, fields.take, Math.ceil(totalRecords / fields.take)),
      ),
    );
  };

}

const controller = new AlbumRecController();
const getAlbumRec = controller.getAlbumRec;
const getMediaInAlbumRec = controller.getMediaInAlbumRec;

export {
  getAlbumRec,
  getMediaInAlbumRec,
};
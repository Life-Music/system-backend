import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';

class GuestAlbumController extends BaseController {
  public getAlbum = async (req: Request, res: Response) => {
    const albumId = req.params.albumId;
    try {
      const album = await globalThis.prisma.album.findUnique({
        where: {
          id: albumId,
        },
        include: {
          owner: true,
          mediaOnAlbum: {
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
              album: true,
              albumId: true,
            },
          },
        },
      });
      return res.json(
        this.success(album),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public listAlbum = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      q: string | undefined,
    };

    const albums = await globalThis.prisma.album.findMany({
      where: {
        name: {
          contains: fields.q,
        },
      },
      include: {
        mediaOnAlbum: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(
      this.success(albums),
    );
  };
}

const controller = new GuestAlbumController();
const getAlbum = controller.getAlbum;
const listAlbum = controller.listAlbum;

export {
  getAlbum,
  listAlbum,
};
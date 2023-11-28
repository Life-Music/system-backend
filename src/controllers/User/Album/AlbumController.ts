import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import { Request, Response } from 'express';
import { TBasePaginationRequest } from '@src/requests/BasePaginationRequest';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import elasticSearch from '@src/services/ElasticSearch';

class AlbumController extends BaseController {
  public createAlbum = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const fields = req.fields as {
      name: string
      description: string
    };
    const album = await globalThis.prisma.$transaction(async (ctx) => {
      const album = await ctx.album.create({
        data: {
          name: fields.name,
          userId,
          description: fields.description,
        },
      });
      await elasticSearch.index({
        index: 'album',
        id: album.id.toString(),
        document: {
          id: album.id.toString(),
          name: album.name,
          description: album.description,
          userId: album.userId,
        },
      });
      return album;
    });

    return res.json(
      this.success(album),
    );
  };
  public listAlbum = async (req: Request, res: Response) => {
    const userId = req.userInfo?.id as number;
    const fields = req.fields as TBasePaginationRequest;
    const where = {
      userId,
    };
    const albums = await globalThis.prisma.album.findMany({
      where,
      include: {
        _count: {
          select: {
            mediaOnAlbum: true,
          },
        },
      },
    });

    const totalObject = await globalThis.prisma.album.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        albums,
        this.buildMetaPagination(totalObject, fields.page, fields.take, Math.ceil(totalObject / fields.take)),
      ),
    );
  };

  public editAlbum = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const fields = req.fields as {
      name: string
      description: string
    };
    const albumId = req.params.albumId;
    try {
      const album = await globalThis.prisma.$transaction(async (ctx) => {
        const album = await ctx.album.update({
          where: {
            id: albumId,
            userId,
          },
          data: {
            name: fields.name,
            description: fields.description,
          },
        });

        await elasticSearch.update({
          id: album.id.toString(),
          index: 'album',
          doc: {
            id: album.id.toString(),
            name: album.name,
            description: album.description,
            userId: album.userId,
          },
        });
        return album;
      });
      return res.json(
        this.success(album),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public deleteAlbum = async (req: Request, res: Response) => {
    const userId = req.userInfo?.id as number;
    const albumId = req.params.albumId;

    try {
      const album = await globalThis.prisma.album.delete({
        where: {
          id: albumId,
          userId,
        },
      });
      await elasticSearch.delete({
        index: 'album',
        id: album.id,
      });

      return res.json(
        this.success(album),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  //TODO: Check role
  public getAlbum = async (req: Request, res: Response) => {
    // const userId = req.userInfo?.id as number;
    const albumId = req.params.albumId;
    try {
      const album = await globalThis.prisma.mediaOnAlbum.findMany({
        where: {
          albumId,
        },
        select: {
          media: true,
          albumId: true,
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

  //TODO: Check roles
  public unAssignMediaOnAlbum = async (req: Request, res: Response) => {
    const mediaId = req.params.mediaId;
    // const userId = req.userInfo?.id as number;
    const albumId = req.params.albumId;

    const mediaOnAlbum = await globalThis.prisma.mediaOnAlbum.delete({
      where: {
        mediaId_albumId: {
          albumId,
          mediaId,
        },
      },
    });

    return res.json(
      this.success(mediaOnAlbum),
    );
  };

}

const controller = new AlbumController();

const createAlbum = controller.createAlbum;
const listAlbum = controller.listAlbum;
const deleteAlbum = controller.deleteAlbum;
const editAlbum = controller.editAlbum;
const getAlbum = controller.getAlbum;
const unAssignMediaOnAlbum = controller.unAssignMediaOnAlbum;

export {
  createAlbum,
  listAlbum,
  deleteAlbum,
  editAlbum,
  getAlbum,
  unAssignMediaOnAlbum,
};
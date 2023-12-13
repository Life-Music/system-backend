import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';

class PlaylistController extends BaseController {

  public createPlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;

    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      title: string
    };

    const playlist = await globalThis.prisma.playlist.create({
      data: {
        title: fields.title,
        userId,
      },
    });

    return res.json(
      this.success(playlist),
    );
  };

  public updatePlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;

    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      title: string
    };

    try {
      const playlist = await globalThis.prisma.playlist.update({
        where: {
          id: req.params.playlistId,
          userId,
        },
        data: {
          title: fields.title,
        },
      });

      return res.json(
        this.success(playlist),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public deletePlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const playlistId = req.params.playlistId;
    try {
      const playlist = await globalThis.prisma.playlist.delete({
        where: {
          id: playlistId,
          userId,
        },
      });
      return res.json(
        this.success(playlist),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public getPlaylists = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;

    try {
      const playlists = await globalThis.prisma.playlist.findMany({
        where: {
          userId,
        },
      });

      return res.json(
        this.success(playlists),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public getPlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const playlistId = req.params.playlistId;

    try {
      const playlist = await globalThis.prisma.playlist.findUnique({
        where: {
          id: playlistId,
          userId,
        },
        include: {
          MediaOnPlaylist: {
            where: {
              media: MediaScoped.published,
            },
            select: {
              media: {
                include: {
                  audioResources: true,
                  owner: true,
                  thumbnails: true,
                },
              },
              createdAt: true,
            },
            orderBy: [
              {
                sortNo: 'desc',
              },
              {
                createdAt: 'desc',
              },
            ],
          },
        },
      });

      return res.json(
        this.success(playlist),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public assignMediaToPlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const playlistId = req.params.playlistId;
    const mediaId = req.params.mediaId;

    try {
      const result = await globalThis.prisma.playlist.update({
        where: {
          id: playlistId,
          userId,
        },
        data: {
          MediaOnPlaylist: {
            upsert: {
              create: {
                mediaId,
              },
              update: {
                mediaId,
              },
              where: {
                playlistId_mediaId: {
                  mediaId,
                  playlistId,
                },
              },
            },
          },
        },
      });

      return res.json(
        this.success(result),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public unassignMediaFromPlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const playlistId = req.params.playlistId;
    const mediaId = req.params.mediaId;

    try {
      const result = await globalThis.prisma.playlist.update({
        where: {
          id: playlistId,
          userId,
        },
        data: {
          MediaOnPlaylist: {
            delete: {
              playlistId_mediaId: {
                mediaId,
                playlistId: playlistId,
              },
            },
          },
        },
      });

      return res.json(
        this.success(result),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }

  };

  public updateSortNoMediaInPlaylist = async (req: Request, res: Response) => {
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    const playlistId = req.params.playlistId;
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      list: [
        {
          mediaId: string,
          sortNo: number,
        }
      ]
    };

    try {
      const result = await globalThis.prisma.playlist.update({
        where: {
          id: playlistId,
          userId,
        },
        data: {
          MediaOnPlaylist: {
            updateMany: fields.list.map((item) => {
              return {
                data: {
                  sortNo: item.sortNo,
                },
                where: {
                  mediaId: item.mediaId,
                },
              };
            }),
          },
        },
      });

      return res.json(
        this.success(result),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };
}

const controllers = new PlaylistController();
const createPlaylist = controllers.createPlaylist;
const updatePlaylist = controllers.updatePlaylist;
const deletePlaylist = controllers.deletePlaylist;
const getPlaylists = controllers.getPlaylists;
const getPlaylist = controllers.getPlaylist;
const assignMediaOnPlaylist = controllers.assignMediaToPlaylist;
const unassignMediaFromPlaylist = controllers.unassignMediaFromPlaylist;
const updateSortNoMediaInPlaylist = controllers.updateSortNoMediaInPlaylist;

export {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  assignMediaOnPlaylist,
  unassignMediaFromPlaylist,
  updateSortNoMediaInPlaylist,
};
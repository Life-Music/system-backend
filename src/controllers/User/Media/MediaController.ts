import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import Jenkins from '@src/util/jenkins';
import { Request, Response } from 'express';
import { Media, Status, Prisma } from 'prisma/generated/mysql';
import elasticSearch from '@src/services/ElasticSearch';
import MediaScoped from '@src/scopes/MediaScoped';
import UnexpectedException from '@src/exception/UnexpectedException';
import queue from '@src/services/queue';
import { error } from 'console';

class MediaController extends BaseController {
  public createMedia = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as Media;
    const userId = req.userInfo.id;

    const media = await globalThis.prisma.$transaction(async (ctx) => {
      const media = await ctx.media.create({
        data: {
          ...fields,
          userId: userId,
          detail: {
            create: {
              description: '',
            },
          },
        },
        include: {
          detail: true,
          thumbnails: true,
          audioResources: true,
          videoResources: true,
          owner: true,
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
      });
      await elasticSearch.index({
        index: 'media',
        id: media.id.toString(),
        document: {
          id: media.id.toString(),
          name: media.title,
          status: media.status,
          published_at: media.publishedAt,
          locked_at: media.lockedAt,
          view_mode: media.viewMode,
        },
      });
      return media;
    });

    queue.create('new_media', media).removeOnComplete(true).save();

    return res.json(
      this.success(
        media,
      ),
    );
  };

  public listMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id;
    const fields = req.fields as {
      page: number,
      take: number,
      q: string | undefined,
    };

    let where: Prisma.MediaWhereInput = {
      OR: [
        {
          userId: userId,
        },
        {
          AND: MediaScoped.published,
        },
      ],
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

  public listMediaLiked = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id;
    const fields = req.fields as {
      page: number,
      take: number,
      isLike?: boolean,
      q: string | undefined,
    };

    const where: Prisma.MediaReactionWhereInput = {
      userId,
      media: MediaScoped.published,
    };

    const media = await globalThis.prisma.mediaReaction.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where,
      select: {
        media: {
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
        },
        createdAt: true,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });

    const totalObject = await globalThis.prisma.mediaReaction.count({
      where,
    });

    return res.json(
      this.successWithMeta(
        media,
        this.buildMetaPagination(totalObject, fields.page, fields.take, Math.ceil(totalObject / fields.take)),
      ),
    );
  };

  public deleteMedia = async (req: Request, res: Response) => {
    const userId = req.userInfo?.id;
    const mediaId = req.params.mediaId;

    try {
      console.log(mediaId);

      const media = await globalThis.prisma.$transaction(async (ctx) => {
        const media = await ctx.media.delete({
          where: {
            // userId,
            id: mediaId,
          },
        });
        try {
          await elasticSearch.delete({
            index: 'media',
            id: media.id,
          });
        }
        catch (e) {
          error(e);
        }
        // try {
        //   await oneDrive.deleteItem(mediaId);
        // }
        // catch (error) {
        //   console.error(error);
        //   throw new UnexpectedException();
        // }
        return media;

      });


      return res.json(
        this.success(media),
      );
    }
    catch (e) {
      error(e);
      throw new ResourceNotFound();
    }
  };

  public getMedia = async (req: Request, res: Response) => {
    const userId = req.userInfo?.id;
    const mediaId = req.params.mediaId;

    try {
      const media = await globalThis.prisma.media.findUniqueOrThrow({
        where: {
          id: mediaId,
          AND: MediaScoped.published,
        },
        include: {
          detail: true,
          audioResources: true,
          thumbnails: true,
          owner: true,
          videoResources: true,
          _count: {
            select: {
              mediaReaction: true,
            },
          },
        },
      });

      const mediaCountReaction = await globalThis.prisma.mediaReaction.count({
        where: {
          mediaId,
          isLike: true,
        },
      });

      let currentReaction = null;

      if (userId) {
        currentReaction = await globalThis.prisma.mediaReaction.findUnique({
          where: {
            onlyReaction: {
              userId,
              mediaId,
            },
          },
        });
      }

      return res.json(
        this.success({
          media,
          reaction: {
            total: mediaCountReaction,
            current: currentReaction,
          },
        }),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public updateMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id;
    const mediaId = req.params.mediaId;
    const fields = req.fields as {
      title?: string
      description?: string
      viewMode: Status,
      thumbnailId?: string,
      albumId?: string,
      categoryIds: string[],
    };

    const data: Prisma.MediaUpdateInput = {
      title: fields.title,
      viewMode: fields.viewMode,
      detail: {
        update: {
          description: fields.description,
        },
      },
    };

    if (fields.albumId) {
      data.mediaOnAlbum = {
        upsert: {
          where: {
            mediaId_albumId: {
              albumId: fields.albumId,
              mediaId: mediaId,
            },
          },
          create: {
            albumId: fields.albumId,
          },
          update: {
          },
        },
      };
    }

    if (fields.thumbnailId) {
      data.thumbnails = {
        updateMany: {
          where: {},
          data: {
            isPrimary: false,
          },
        },
        update: {
          where: {
            id: fields.thumbnailId,
          },
          data: {
            isPrimary: true,
          },
        },
      };
    }

    if (fields.categoryIds) {
      data.mediaOnCategory = {
        deleteMany: {
          mediaId,
        },
        createMany: {
          data: fields.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
      };
    }

    try {
      const media = await globalThis.prisma.$transaction(async (ctx) => {
        const media = await ctx.media.update({
          where: {
            userId,
            id: mediaId,
          },
          include: {
            thumbnails: true,
          },
          data,
        });

        try {
          await elasticSearch.update({
            index: 'media',
            id: media.id.toString(),
            doc: {
              id: media.id.toString(),
              name: media.title,
              status: media.status,
              published_at: media.publishedAt,
              locked_at: media.lockedAt,
              view_mode: media.viewMode,
            },
          });
        }
        catch (e) {
          error(e);
        }
        return media;
      });

      return res.json(
        this.success(media),
      );
    }
    catch (e) {
      console.error(e);
      throw new ResourceNotFound();
    }
  };

  public uploadDone = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id;
    const mediaId = req.params.mediaId;
    const fields = req.fields as {
      fileId: string
    };

    const media = await globalThis.prisma.media.update({
      where: {
        id: mediaId,
        userId,
      },
      data: {
        status: 'PROCESSING',
      },
    });

    if (!media) throw new ResourceNotFound();

    await globalThis.prisma.sessionUpload.deleteMany({
      where: {
        mediaId: media.id,
      },
    });

    const audioResource = await globalThis.prisma.audioResource.create({
      data: {
        mediaId: media.id,
        label: 'LOSSLESS',
        fileId: fields.fileId,
      },
    });

    const jenkins = new Jenkins();
    await jenkins.processAudio(audioResource.id);

    return res.json(
      this.success(audioResource),
    );
  };

}

const controller = new MediaController();
const createMedia = controller.createMedia;
const listMedia = controller.listMedia;
const listMediaLiked = controller.listMediaLiked;
const deleteMedia = controller.deleteMedia;
const getMedia = controller.getMedia;
const updateMedia = controller.updateMedia;
const uploadMediaDone = controller.uploadDone;

export {
  createMedia,
  listMedia,
  deleteMedia,
  getMedia,
  updateMedia,
  uploadMediaDone,
  listMediaLiked,
};
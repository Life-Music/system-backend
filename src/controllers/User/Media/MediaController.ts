import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import Jenkins from '@src/util/jenkins';
import { Request, Response } from 'express';
import { Media, Status, Prisma } from 'prisma/generated/mysql';
import elasticSearch from '@src/services/ElasticSearch';

class MediaController extends BaseController {
  public createMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as Media;
    const userId = req.userInfo?.id as number;

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


    return res.json(
      this.success(
        media,
      ),
    );
  };

  public listMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const fields = req.fields as {
      take: number,
      page: number
    };

    const where = {
      userId,
    };

    const media = await globalThis.prisma.media.findMany({
      take: fields.take,
      skip: fields.take * fields.page - fields.take,
      where,
      include: {
        detail: true,
        thumbnails: true,
        audioResources: true,
        videoResources: true,
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

  public deleteMedia = async (req: Request, res: Response) => {
    const userId = req.userInfo?.id as number;
    const mediaId = req.params.mediaId;

    try {
      const media = await globalThis.prisma.$transaction(async (ctx) => {
        const media = await ctx.media.delete({
          where: {
            userId,
            id: mediaId,
          },
        });

        await elasticSearch.delete({
          index: 'media',
          id: media.id,
        });
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
      throw new ResourceNotFound();
    }
  };

  public getMedia = async (req: Request, res: Response) => {
    const mediaId = req.params.mediaId;

    try {
      const media = await globalThis.prisma.media.findUniqueOrThrow({
        where: {
          id: mediaId,
        },
      });

      return res.json(
        this.success(media),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public updateMedia = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const mediaId = req.params.mediaId;
    const fields = req.fields as {
      title?: string
      description?: string
      viewMode: Status,
      thumbnailId?: string
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
        return media;
      });

      return res.json(
        this.success(media),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

  public uploadDone = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
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
};
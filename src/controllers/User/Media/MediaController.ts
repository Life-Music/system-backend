import BaseController from '@src/controllers/BaseController';
import DataBaseNotReadyException from '@src/exception/DataBaseNotReadyException';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import Jenkins from '@src/util/jenkins';
import { Request, Response } from 'express';
import { Media, Status, Prisma } from 'prisma/generated/mysql';

class MediaController extends BaseController {
  public createMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException();
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as Media;
    const userId = req.userInfo?.id as number;

    const media = await req.database.media.create({
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

    return res.json(
      this.success(
        media,
      ),
    );
  };

  public listMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException();
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const fields = req.fields as {
      take: number,
      page: number
    };

    const where = {
      userId,
    };

    const media = await req.database.media.findMany({
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
            Comment: true,
            MediaReaction: {
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

    const totalObject = await req.database.media.count({
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
    if (!req.database) throw new DataBaseNotReadyException();
    const userId = req.userInfo?.id as number;
    const mediaId = req.params.mediaId;

    try {
      const media = await req.database.$transaction(async (ctx) => {
        const media = await ctx.media.delete({
          where: {
            userId,
            id: mediaId,
          },
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
    if (!req.database) throw new DataBaseNotReadyException();
    const mediaId = req.params.mediaId;

    try {
      const media = await req.database.media.findUniqueOrThrow({
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
    if (!req.database) throw new DataBaseNotReadyException();
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
      const media = await req.database.media.update({
        where: {
          userId,
          id: mediaId,
        },
        data,
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
    if (!req.database) throw new DataBaseNotReadyException();
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const mediaId = req.params.mediaId;
    const fields = req.fields as {
      fileId: string
    };

    const media = await req.database.media.update({
      where: {
        id: mediaId,
        userId,
      },
      data: {
        status: 'PROCESSING',
      },
    });

    if (!media) throw new ResourceNotFound();

    await req.database.sessionUpload.deleteMany({
      where: {
        mediaId: media.id,
      },
    });

    const audioResource = await req.database.audioResource.create({
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
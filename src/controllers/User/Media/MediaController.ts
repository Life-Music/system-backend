import BaseController from "@src/controllers/BaseController";
import DataBaseNotReadyException from "@src/exception/DataBaseNotReadyException";
import NoFieldsInitException from "@src/exception/NoFieldsInitException";
import ResourceNotFound from "@src/exception/ResourceNotFound";
import { Request, Response } from "express";
import { Media, Status } from "prisma/generated/mysql";

class MediaController extends BaseController {
  createMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException()
    if (!req.fields) throw new NoFieldsInitException()
    const fields = req.fields as Media
    const userId = req.userInfo?.id as number

    const media = await req.database.media.create({
      data: {
        ...fields,
        userId: userId,
        detail: {
          create: {
            description: ""
          }
        }
      }
    })

    return res.json(
      this.success(
        media
      )
    )
  }

  public listMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException()
    if (!req.fields) throw new NoFieldsInitException()
    const userId = req.userInfo?.id as number
    const fields = req.fields as {
      take: number,
      page: number
    }

    const where = {
      userId,
    }

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
                isLike: true
              },
            }
          }
        }
      },
      orderBy: [
        {
          createdAt: "desc"
        }
      ],
    })

    const totalObject = await req.database.media.count({
      where,
    })

    return res.json(
      this.successWithMeta(
        media,
        this.buildMetaPagination(totalObject, fields.page, fields.take, Math.ceil(totalObject / fields.take))
      )
    )
  }

  deleteMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException()
    const userId = req.userInfo?.id as number
    const mediaId = req.params.mediaId

    try {
      const media = await req.database.media.delete({
        where: {
          userId,
          id: mediaId,
        }
      })

      return res.json(
        this.success(media)
      )
    }
    catch (e) {
      throw new ResourceNotFound()
    }
  }

  getMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException()
    const mediaId = req.params.mediaId

    try {
      const media = await req.database.media.findUniqueOrThrow({
        where: {
          id: mediaId,
        }
      })

      return res.json(
        this.success(media)
      )
    }
    catch (e) {
      throw new ResourceNotFound()
    }
  }

  updateMedia = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException()
    if (!req.fields) throw new NoFieldsInitException()
    const userId = req.userInfo?.id as number
    const mediaId = req.params.mediaId
    const fields = req.fields as {
      title?: string
      description?: string
      view_mode: Status,
      thumbnailId: string
    }

    try {
      const media = await req.database.media.update({
        where: {
          userId,
          id: mediaId,
        },
        data: {
          title: fields.title,
          viewMode: fields.view_mode,
          detail: {
            update: {
              description: fields.description
            }
          },
          thumbnails: {
            updateMany: {
              where: {},
              data: {
                isPrimary: false
              }
            },
            update: {
              where: {
                id: fields.thumbnailId
              },
              data: {
                isPrimary: true
              }
            }
          }
        }
      })

      return res.json(
        this.success(media)
      )
    }
    catch (e) {
      throw new ResourceNotFound()
    }
  }

}

const controller = new MediaController()
const createMedia = controller.createMedia
const listMedia = controller.listMedia
const deleteMedia = controller.deleteMedia
const getMedia = controller.getMedia
const updateMedia = controller.updateMedia

export {
  createMedia,
  listMedia,
  deleteMedia,
  getMedia,
  updateMedia,
}
import { Request, Response } from 'express';
import BaseController from '../BaseController';
import MediaScoped from '@src/scopes/MediaScoped';

class HomeController extends BaseController {

  public mediaNewest = async (req: Request, res: Response) => {
    const media = await globalThis.prisma.media.findMany({
      take: 10,
      where: MediaScoped.published,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: true,
        thumbnails: true,
        audioResources: true,
      },
    });

    return res.json(
      this.success(media),
    );
  };

  public mediaRelated = async (req: Request, res: Response) => {
    const mediaId = req.params.mediaId;
    const media = await globalThis.prisma.category.findMany({
      include: {
        categoryOnMedia: {
          select: {
            media: {
              include: {
                owner: true,
                thumbnails: true,
              },
            },
          },
          where: {
            media: MediaScoped.published,
          },
          take: 10,
        },
      },
      where: {
        categoryOnMedia: {
          some: {
            mediaId,
            media: MediaScoped.published,
          },
        },
      },
    });

    return res.json(
      this.success(media),
    );
  };
}


const homeController = new HomeController();
const mediaNewest = homeController.mediaNewest;
const mediaRelated = homeController.mediaRelated;

export {
  mediaNewest,
  mediaRelated,
};
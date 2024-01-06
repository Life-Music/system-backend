import BaseController from '@src/controllers/BaseController';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import MediaScoped from '@src/scopes/MediaScoped';
import { Request, Response } from 'express';

class GuestCategoryController extends BaseController {
  public getMedia = async (req: Request, res: Response) => {
    const categoryId = req.params.categoryId;
    try {
      const category = await globalThis.prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        include: {
          categoryOnMedia: {
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
      });
      return res.json(
        this.success(category),
      );
    }
    catch (e) {
      throw new ResourceNotFound();
    }
  };

}

const controller = new GuestCategoryController();
const getMediaInCategory = controller.getMedia;

export {
  getMediaInCategory,
};
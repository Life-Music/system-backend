import { Request, Response } from 'express';
import MediaScoped from '@src/scopes/MediaScoped';
import BaseController from '../BaseController';

class TrendingController extends BaseController {
  public markTime = 1000 * 60 * 60 * 24 * 30; // 30 days
  public limit = 10;

  public trending = async (req: Request, res: Response) => {
    const trending = await globalThis.prisma.media.findMany({
      where: {
        ...MediaScoped.published,
        createdAt: {
          gte: new Date(new Date().getTime() - this.markTime),
        },
      },
      include: {
        thumbnails: true,
        owner: true,
      },
    });

    const result = trending
      .map((media) => {
        const score = (media.plays * 1000) / media.createdAt.getTime();
        return {
          media,
          score,
        };
      })
      .sort((a, b) => b.score - a.score).splice(0, this.limit);

    return res.json(this.success(result));
  };
}

const controller = new TrendingController();
const trending = controller.trending;

export { trending };

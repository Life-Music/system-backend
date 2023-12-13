import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import { Request, Response } from 'express';

class MediaReactionController extends BaseController {

  public saveReaction = async (req: Request, res: Response) => {
    const mediaId = req.params.mediaId;
    if (!req.userInfo) {
      return res.json(
        this.success({}),
      );
    }
    const userId = req.userInfo.id;
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      type: string,
    };
    try {
      const reaction = await globalThis.prisma.mediaReaction.delete({
        where: {
          onlyReaction: {
            userId: userId,
            mediaId: mediaId,
          },
          isLike: fields.type === 'like',
        },
      });

      if (reaction) {
        return res.json(
          this.success(reaction),
        );
      }
    }
    catch (e) {
      //
    }

    const reaction = await globalThis.prisma.mediaReaction.upsert({
      where: {
        onlyReaction: {
          userId,
          mediaId,
        },
      },
      create: {
        userId,
        mediaId,
        isLike: fields.type === 'like',
      },
      update: {
        isLike: fields.type === 'like',
      },
    });

    const mediaCountReaction = await globalThis.prisma.mediaReaction.count({
      where: {
        mediaId,
      },
    });

    const mediaCountReactionLike = await globalThis.prisma.mediaReaction.count({
      where: {
        mediaId,
        isLike: true,
      },
    });

    return res.json(
      this.success({
        current: reaction,
        total: mediaCountReaction,
        like: mediaCountReactionLike,
      }),
    );
  };
}

const controller = new MediaReactionController();
const saveMediaReaction = controller.saveReaction;

export {
  saveMediaReaction,
};
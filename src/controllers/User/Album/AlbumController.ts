import BaseController from '@src/controllers/BaseController';
import { Request, Response } from 'express';

class AlbumController extends BaseController {
  createAlbum = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const userId = req.userInfo?.id as number;
    const fields = req.fields as {
      name: string
    };

    const album = await globalThis.prisma.album.create({
      data: {
        name: fields.name,
        userId,
      },
    });

    return res.json(
      this.success(album),
    );
  };
}

const controller = new AlbumController();

const createAlbum = controller.createAlbum;

export {
  createAlbum,
};
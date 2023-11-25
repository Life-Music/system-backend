import { Request, Response } from 'express';
import BaseController from '../../BaseController';
import OneDrive from '@src/services/OneDrive';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
const oneDrive = new OneDrive();

class ResumableUploadController extends BaseController {
  public createLink = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      id: string,
      mediaId: string
    };

    let sessionUpload = await globalThis.prisma.sessionUpload.findUnique({
      where: {
        id: fields.id,
        expired_at: {
          gte: new Date(),
        },
      },
    });

    if (!sessionUpload) {
      const folderMediaId = await oneDrive.createFolder(fields.mediaId);
      const folderRawId = await oneDrive.createFolder('RAW', folderMediaId);
      const oneDriveUploadSession = await oneDrive.createUploadSession(folderRawId, fields.id);
      sessionUpload = await globalThis.prisma.sessionUpload.upsert({
        where: {
          id: fields.id,
        },
        create: {
          sessionUploadUrl: oneDriveUploadSession.uploadUrl,
          expired_at: new Date(oneDriveUploadSession.expirationDateTime),
          mediaId: fields.mediaId,
          id: fields.id,
        },
        update: {
          sessionUploadUrl: oneDriveUploadSession.uploadUrl,
          expired_at: new Date(oneDriveUploadSession.expirationDateTime),
        },
      });
    }

    return res.json(
      this.success(
        sessionUpload,
      ),
    );
  };
}

const controller = new ResumableUploadController();

const createResumableUploadController = controller.createLink;

export {
  createResumableUploadController,
};
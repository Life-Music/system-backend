import { PutObjectCommand } from '@aws-sdk/client-s3';
import EnvVars from '@src/constants/EnvVars';
import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import UnexpectedException from '@src/exception/UnexpectedException';
import type { Request, Response } from 'express';
import type { UploadedFile } from 'express-fileupload';

class UploadController extends BaseController {
  public uploadThumbnail = async (req: Request, res: Response) => {
    if (!req.files?.file) throw new NoFieldsInitException();
    const mediaId = req.params.mediaId;
    const targetFile = req.files.file as UploadedFile;
    const fileName = `${targetFile.md5}.${targetFile.name.split('.').at(-1)}`;
    const params = {
      'Body': targetFile.data,
      'Bucket': EnvVars.AWS.BucketImage,
      'Key': fileName,
    };
    const command = new PutObjectCommand(params);
    await globalThis.s3Client.send(command)
      .then(() => {
        const url = new URL(EnvVars.AWS.ObjectUrl);
        url.pathname = fileName;
        return globalThis.prisma.thumbnail.create({
          data: {
            url: url.href,
            mediaId,
          },
        });
      })
      .then((thumbnail => {
        res.json(
          this.success(thumbnail),
        );
      }))
      .catch((e) => {
        console.error(e);
        throw new UnexpectedException();
      });

  };
}

const controller = new UploadController();
const uploadThumbnail = controller.uploadThumbnail;

export {
  uploadThumbnail,
};
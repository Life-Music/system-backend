import BaseController from '@src/controllers/BaseController';
import DataBaseNotReadyException from '@src/exception/DataBaseNotReadyException';
import ResourceNotFound from '@src/exception/ResourceNotFound';
import OneDrive from '@src/services/OneDrive';
import { Request, RequestHandler } from 'express';

const oneDrive = new OneDrive();
class AudioController extends BaseController {

  public getLinkStream: RequestHandler = async (req: Request, res) => {
    if (!req.database || !req.redis) throw new DataBaseNotReadyException();
    const resourceId = req.params.resourceId;
    const dataCached = await req.redis.get(resourceId);
    if (dataCached) {

      const [timeExpired, link] = dataCached.split('|');
      if (Date.now() - Number(timeExpired) < 1000 * 60 * 50) {
        return res.redirect(link);
      }
    }
    const audioResource = await req.database.audioResource.findUnique({
      where: {
        id: resourceId,
      },
    });
    if (!audioResource) throw new ResourceNotFound();
    const itemInfo = await oneDrive.getFileInfo(audioResource.fileId);

    await req.redis.set(resourceId, `${new Date().getTime()}|${itemInfo['@microsoft.graph.downloadUrl']}`);


    return res.redirect(itemInfo['@microsoft.graph.downloadUrl']);
  };

}

const audioController = new AudioController();

export const getLinkStream = audioController.getLinkStream;

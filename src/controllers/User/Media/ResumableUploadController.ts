import { Request, Response } from "express";
import BaseController from "../../BaseController";
import OneDrive from "@src/services/OneDrive";
import EnvVars from "@src/constants/EnvVars";
import DataBaseNotReadyException from "@src/exception/DataBaseNotReadyException";
import NoFieldsInitException from "@src/exception/NoFieldsInitException";
const oneDrive = new OneDrive({
  client_id: EnvVars.OneDrive.ClientId,
  folder_root_id: EnvVars.OneDrive.FolderRoot,
  username: EnvVars.OneDrive.Email,
  password: EnvVars.OneDrive.Password,
})

class ResumableUploadController extends BaseController {
  createLink = async (req: Request, res: Response) => {
    if (!req.database) throw new DataBaseNotReadyException()
    if (!req.fields) throw new NoFieldsInitException()
    const fields = req.fields as {
      id: string,
      mediaId: string
    }

    const folderMediaId = await oneDrive.createFolder(fields.mediaId)
    const folderRawId = await oneDrive.createFolder("RAW", folderMediaId)
    const oneDriveUploadSession = await oneDrive.createUploadSession(folderRawId, fields.id)

    const sessionUpload = await req.database.sessionUpload.upsert({
      where: {
        id: fields.id,
        expired_at: {
          gte: new Date()
        }
      },
      create: {
        sessionUploadUrl: oneDriveUploadSession.uploadUrl,
        expired_at: new Date(oneDriveUploadSession.expirationDateTime),
        mediaId: fields.mediaId
      },
      update: {
        sessionUploadUrl: oneDriveUploadSession.uploadUrl,
        expired_at: new Date(oneDriveUploadSession.expirationDateTime),
      }
    })

    return res.json(
      this.success(
        sessionUpload
      )
    )
  }
}

const controller = new ResumableUploadController()

const createResumableUploadController = controller.createLink

export {
  createResumableUploadController,
}
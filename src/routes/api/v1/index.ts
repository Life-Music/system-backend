import { registerController } from '@src/controllers/Guest/Auth/RegisterController';
import { RouterOptions } from '@src/global';
import { onlyAuth, onlyGuest, setUserInfo } from '@src/middleware/auth';
import RegisterRequest from '@src/requests/RegisterRequest';
import LoginRequest from '@src/requests/LoginRequest';
import { loginController } from '@src/controllers/Guest/Auth/LoginController';
import { userInfoController } from '@src/controllers/BaseController';
import { createResumableUploadController } from '@src/controllers/User/Media/ResumableUploadController';
import { CreateResumableUploadRequest } from '@src/requests/CreateResumableUploadRequest';
import {
  createMedia,
  deleteMedia,
  getMedia,
  listMedia,
  updateMedia,
  uploadMediaDone,
} from '@src/controllers/User/Media/MediaController';
import {
  createAlbum,
  deleteAlbum,
  editAlbum,
  getAlbum,
  listAlbum,
  unAssignMediaOnAlbum,
} from '@src/controllers/User/Album/AlbumController';
import CreateMediaRequest from '@src/requests/CreateMediaRequest';
import BasePaginationRequest from '@src/requests/BasePaginationRequest';
import UpdateMediaRequest from '@src/requests/UpdateMediaRequest';
import MediaUploadDoneRequest from '@src/requests/MediaUploadDoneRequest';
import CreateAlbumRequest from '@src/requests/CreateAlbumRequest';
import BaseSearchRequest from '@src/requests/BaseSearchRequest';
import { getLinkStream } from '@src/controllers/Guest/Audio/AudioController';
import { searchAlbum, searchCategory } from '@src/controllers/Guest/Search/SearchController';
import { uploadThumbnail } from '@src/controllers/User/Upload/UploadController';
import { getCategoryRec } from '@src/controllers/Guest/Recommendation/CategoryRecController';

const registerRequest = new RegisterRequest();
const loginRequest = new LoginRequest();
const createResumableUploadRequest = new CreateResumableUploadRequest();
const createMediaRequest = new CreateMediaRequest();
const basePaginationRequest = new BasePaginationRequest();
const updateMediaRequest = new UpdateMediaRequest();
const mediaUploadDoneRequest = new MediaUploadDoneRequest();
const createAlbumRequest = new CreateAlbumRequest();
const baseSearchRequest = new BaseSearchRequest();

export const router: RouterOptions = {
  'path': '/api/v1',
  children: [
    {
      path: '/auth',
      middleware: [
        onlyGuest,
      ],
      children: [
        {
          method: 'post',
          path: '/login',
          controller: loginController,
          request: loginRequest.validation,
        },
        {
          path: '/register',
          method: 'post',
          controller: registerController,
          request: registerRequest.validation,
        },
      ],
    },
    {
      'path': '',
      middleware: [
        setUserInfo,
      ],
      children: [
        {
          path: '/me',
          method: 'get',
          controller: userInfoController,
        },
      ],

    },
    {
      path: '/studio',
      middleware: [
        onlyAuth,
        setUserInfo,
      ],
      children: [
        {
          path: '/media',
          children: [
            {
              path: '/create-resumable-upload',
              controller: createResumableUploadController,
              method: 'post',
              request: createResumableUploadRequest.validation,
            },
            {
              path: '',
              method: 'post',
              controller: createMedia,
              request: createMediaRequest.validation,
            },
            {
              path: '',
              method: 'get',
              controller: listMedia,
              request: basePaginationRequest.validation,
            },
            {
              path: '/:mediaId',
              method: 'delete',
              controller: deleteMedia,
            },
            {
              path: '/:mediaId',
              method: 'get',
              controller: getMedia,
            },
            {
              path: '/:mediaId',
              method: 'patch',
              request: updateMediaRequest.validation,
              controller: updateMedia,
            },
            {
              path: '/:mediaId/upload-done',
              method: 'post',
              request: mediaUploadDoneRequest.validation,
              controller: uploadMediaDone,
            },
            {
              path: '/:mediaId/thumbnail',
              children: [
                {
                  path: '/upload',
                  method: 'post',
                  controller: uploadThumbnail,
                },
              ],
            },
          ],
        },
        {
          path: '/album',
          children: [
            {
              path: '',
              method: 'post',
              controller: createAlbum,
              request: createAlbumRequest.validation,
            },
            {
              path: '',
              method: 'get',
              controller: listAlbum,
              request: basePaginationRequest.validation,
            },
            {
              path: '/:albumId',
              method: 'patch',
              controller: editAlbum,
              request: createAlbumRequest.validation,
            },
            {
              path: '/:albumId',
              method: 'delete',
              controller: deleteAlbum,
            },
            {
              path: '/:albumId',
              method: 'get',
              controller: getAlbum,
            },
            {
              path: '/:albumId/:mediaId',
              method: 'delete',
              controller: unAssignMediaOnAlbum,
            },
          ],
        },
      ],
    },
    {
      path: '',
      children: [
        {
          path: '/audio',
          children: [
            {
              path: '/:resourceId/stream',
              method: 'get',
              controller: getLinkStream,
            },
          ],
        },
        {
          path: '/album',
          children: [
            {
              path: '/search',
              method: 'get',
              controller: searchAlbum,
              request: baseSearchRequest.validation,
            },
          ],
        },
        {
          path: '/category',
          children: [
            {
              path: '/search',
              method: 'get',
              controller: searchCategory,
              request: baseSearchRequest.validation,
            },
          ],
        },
        {
          path: '/recommendation',
          children: [
            {
              path: '/category',
              method: 'get',
              request: basePaginationRequest.validation,
              controller: getCategoryRec,
            },
          ],
        },
      ],
    },
  ],
};
import { registerController } from '@src/controllers/Guest/Auth/RegisterController';
import { RouterOptions } from '@src/global';
import { onlyAuth, onlyGuest, setUserInfo } from '@src/middleware/auth';
import RegisterRequest from '@src/requests/RegisterRequest';
import LoginRequest from '@src/requests/LoginRequest';
import { loginController } from '@src/controllers/Guest/Auth/LoginController';
import { userInfoController } from '@src/controllers/BaseController';
import { createResumableUploadController } from '@src/controllers/User/Media/ResumableUploadController';
import { CreateResumableUploadRequest } from '@src/requests/CreateResumableUploadRequest';
import { createMedia, deleteMedia, getMedia, listMedia, updateMedia } from '@src/controllers/User/Media/MediaController';
import CreateMediaRequest from '@src/requests/CreateMediaRequest';
import ListMediaRequest from '@src/requests/ListMediaRequest';
import UpdateMediaRequest from '@src/requests/UpdateMediaRequest';

const registerRequest = new RegisterRequest();
const loginRequest = new LoginRequest();
const createResumableUploadRequest = new CreateResumableUploadRequest()
const createMediaRequest = new CreateMediaRequest()
const listMediaRequest = new ListMediaRequest()
const updateMediaRequest = new UpdateMediaRequest()

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
              method: "post",
              request: createResumableUploadRequest.validation
            },
            {
              path: '',
              method: "post",
              controller: createMedia,
              request: createMediaRequest.validation,
            },
            {
              path: '',
              method: "get",
              controller: listMedia,
              request: listMediaRequest.validation,
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
            }
          ]
        }
      ]
    }
  ],
};
import { registerController } from '@src/controllers/Guest/Auth/RegisterController';
import { RouterOptions } from '@src/global';
import { onlyAuth, onlyGuest, setUserInfo } from '@src/middleware/auth';
import RegisterRequest from '@src/requests/RegisterRequest';
import LoginRequest from '@src/requests/LoginRequest';
import { loginController } from '@src/controllers/Guest/Auth/LoginController';
import { saveWebPushSubscription, userInfoController } from '@src/controllers/BaseController';
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
import { getCategoryRec, getMediaInCategoryRec } from '@src/controllers/Guest/Recommendation/CategoryRecController';
import { mediaNewest, mediaRelated } from '@src/controllers/Guest/HomeController';
import { getAlbumRec, getMediaInAlbumRec } from '@src/controllers/Guest/Recommendation/AlbumRecController';
import { getHistoryMedia, saveHistoryMedia } from '@src/controllers/User/History/HistoryMediaController';
import CreateHistoryMediaRequest from '@src/requests/CreateHistoryMediaRequest';
import { deleteComment, getComments, saveComment } from '@src/controllers/User/Comment/CommentController';
import CreateCommentRequest from '@src/requests/CreateCommentRequest';
import { saveMediaReaction } from '@src/controllers/User/Reaction/MediaReactionController';
import UpdateReactionMediaRequest from '@src/requests/UpdateReactionMediaRequest';
import {
  assignMediaOnPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  unassignMediaFromPlaylist,
  updatePlaylist,
  updateSortNoMediaInPlaylist,
} from '@src/controllers/User/Playlist/PlaylistController';
import CreatePlayListRequest from '@src/requests/CreatePlaylistRequest';
import UpdateSortNoMediaInPlaylistRequest from '@src/requests/UpdateSortNoMediaInPlaylistRequest';
import ListMediaRequest from '@src/requests/ListMediaRequest';
import { getArtist, listArtist, subscribeArtist } from '@src/controllers/User/Artist/ArtistController';
import ListArtistRequest from '@src/requests/ListArtistRequest';
import CreateWebPushSubscriptionRequest from '@src/requests/CreateWebPushSubscriptionRequest';

const registerRequest = new RegisterRequest();
const loginRequest = new LoginRequest();
const createResumableUploadRequest = new CreateResumableUploadRequest();
const createMediaRequest = new CreateMediaRequest();
const basePaginationRequest = new BasePaginationRequest();
const updateMediaRequest = new UpdateMediaRequest();
const mediaUploadDoneRequest = new MediaUploadDoneRequest();
const createAlbumRequest = new CreateAlbumRequest();
const createHistoryMediaRequest = new CreateHistoryMediaRequest();
const createCommentRequest = new CreateCommentRequest();
const updateReactionMediaRequest = new UpdateReactionMediaRequest();
const createPlayListRequest = new CreatePlayListRequest();
const updateSortNoMediaInPlaylistRequest = new UpdateSortNoMediaInPlaylistRequest();
const listMediaRequest = new ListMediaRequest();
const listArtistRequest = new ListArtistRequest();
const createWebPushSubscriptionRequest = new CreateWebPushSubscriptionRequest();
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
        {
          path: '/history',
          children: [
            {
              path: '/media',
              method: 'get',
              request: basePaginationRequest.validation,
              controller: getHistoryMedia,
            },
            {
              path: '/media',
              method: 'post',
              request: createHistoryMediaRequest.validation,
              controller: saveHistoryMedia,
            },
          ],
        },
        {
          path: '/notification/subscribe',
          method: 'post',
          controller: saveWebPushSubscription,
          request: createWebPushSubscriptionRequest.validation,
        },
        {
          path: '/playlist',
          middleware: [
            onlyAuth,
          ],
          children: [
            {
              path: '',
              method: 'get',
              controller: getPlaylists,
            },
            {
              path: '',
              method: 'post',
              request: createPlayListRequest.validation,
              controller: createPlaylist,
            },
            {
              path: '/:playlistId',
              request: createPlayListRequest.validation,
              controller: updatePlaylist,
              method: 'patch',
            },
            {
              path: '/:playlistId',
              controller: deletePlaylist,
              method: 'delete',
            },
            {
              path: '/:playlistId',
              method: 'get',
              controller: getPlaylist,
            },
            {
              path: '/:playlistId/sort_no',
              method: 'put',
              request: updateSortNoMediaInPlaylistRequest.validation,
              controller: updateSortNoMediaInPlaylist,
            },
            {
              path: '/:playlistId/:mediaId',
              method: 'post',
              controller: assignMediaOnPlaylist,
            },
            {
              path: '/:playlistId/:mediaId',
              method: 'delete',
              controller: unassignMediaFromPlaylist,
            },
          ],
        },
        {
          path: '/media',
          children: [
            {
              path: '',
              method: 'get',
              controller: listMedia,
              request: listMediaRequest.validation,
            },
            {
              path: '/:mediaId',
              method: 'get',
              controller: getMedia,
              children: [
                {
                  path: '/comment',
                  children: [
                    {
                      path: '',
                      method: 'post',
                      middleware: [
                        onlyAuth,
                      ],
                      request: createCommentRequest.validation,
                      controller: saveComment,
                    },
                    {
                      path: '',
                      method: 'get',
                      request: basePaginationRequest.validation,
                      controller: getComments,
                    },
                    {
                      path: '/:commentId',
                      middleware: [
                        onlyAuth,
                      ],
                      method: 'delete',
                      controller: deleteComment,
                    },
                  ],
                },
                {
                  path: '/reaction',
                  children: [
                    {
                      path: '',
                      method: 'post',
                      middleware: [
                        onlyAuth,
                      ],
                      request: updateReactionMediaRequest.validation,
                      controller: saveMediaReaction,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: '/artist',
          request: listArtistRequest.validation,
          controller: listArtist,
          method: 'get',
          children: [
            {
              path: '/:artistId',
              method: 'get',
              controller: getArtist,
              children: [
                {
                  path: '/subscribe',
                  method: 'post',
                  controller: subscribeArtist,
                },
              ],
            },
          ],
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
              children: [
                {
                  path: '/media',
                  method: 'get',
                  request: basePaginationRequest.validation,
                  controller: getMediaInCategoryRec,
                },
              ],
            },
            {
              path: '/album',
              method: 'get',
              request: basePaginationRequest.validation,
              controller: getAlbumRec,
              children: [
                {
                  path: '/media',
                  method: 'get',
                  request: basePaginationRequest.validation,
                  controller: getMediaInAlbumRec,
                },
              ],
            },
            {
              path: '/media',
              children: [
                {
                  path: '/newest',
                  method: 'get',
                  controller: mediaNewest,
                },
                {
                  path: '/:mediaId',
                  method: 'get',
                  controller: mediaRelated,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
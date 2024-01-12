import { RouterOptions } from '@src/global';
import AdminLoginRequest from '@src/requests/admin/AdminLoginRequest';
import { adminLoginController } from '@src/controllers/Admin/Auth/AdminLoginController';
import { adminListUser, adminUpdateUser } from '@src/controllers/Admin/UserManagementController';
import { onlyAdmin, setAdminInfo } from '@src/middleware/auth';
import UserSearchRequest from '@src/requests/admin/UserSearchRequest';
import CategorySearchRequest from '@src/requests/admin/CategorySearchRequest';
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategory,
  adminUpdateCategory,
} from '@src/controllers/Admin/CategoryManagementController';
import { adminGetInvoices } from '@src/controllers/Admin/InvoiceManagementController';
import InvoiceSearchRequest from '@src/requests/admin/InvoiceSearchRequest';
import CreateCategoryRequest from '@src/requests/payment/CreateCategoryRequest';
import UserUpdateRequest from '@src/requests/admin/UserUpdateRequest';

const userSearchRequest = new UserSearchRequest();
const userUpdateRequest = new UserUpdateRequest();
const categorySearchRequest = new CategorySearchRequest();
const adminLoginRequest = new AdminLoginRequest();
const invoiceSearchRequest = new InvoiceSearchRequest();
const createCategoryRequest = new CreateCategoryRequest();

export const adminRoute: RouterOptions = {
  path: '/admin',
  children: [
    {
      path: '/login',
      method: 'post',
      controller: adminLoginController,
      request: adminLoginRequest.validation,
    },
    {
      path: '/management',
      middleware: [
        onlyAdmin,
        setAdminInfo,
      ],
      children: [
        {
          path: '/user',
          method: 'get',
          request: userSearchRequest.validation,
          controller: adminListUser,
          children: [
            {
              path: '/:userId',
              method: 'patch',
              request: userUpdateRequest.validation,
              controller: adminUpdateUser,
            },
          ],
        },
        {
          path: '/category',
          method: 'get',
          request: categorySearchRequest.validation,
          controller: adminListCategory,
          children: [
            {
              path: '/:categoryId',
              method: 'patch',
              request: createCategoryRequest.validation,
              controller: adminUpdateCategory,
            },
            {
              path: '/:categoryId',
              method: 'delete',
              controller: adminDeleteCategory,
            },
            {
              path: '/',
              method: 'post',
              request: createCategoryRequest.validation,
              controller: adminCreateCategory,
            },
          ],
        },
        {
          path: '/invoices',
          method: 'get',
          request: invoiceSearchRequest.validation,
          controller: adminGetInvoices,
        },
      ],
    },
  ],
};
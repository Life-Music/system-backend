import {
  cancelSubscription,
  createPaymentMethod,
  createSubscription,
  deletePaymentMethod,
  getInvoices,
  getPaymentIntent,
  getPaymentMethod,
  setDefaultPaymentMethod,
} from '@src/controllers/User/Payment/PaymentController';
import { RouterOptions } from '@src/global';
import { onlyAuth, setUserInfo } from '@src/middleware/auth';

import CreatePaymentRequest from '@src/requests/payment/CreatePaymentRequest';
import DeletePaymentRequest from '@src/requests/payment/DeletePaymentRequest';
import SetDefaultPaymentRequest from '@src/requests/payment/SetDefaultPaymentRequest';
import CreateSubscriptionRequest from '@src/requests/payment/CreateSubscriptionRequest';

const createPaymentRequest = new CreatePaymentRequest();
const setDefaultPaymentRequest = new SetDefaultPaymentRequest();
const deletePaymentRequest = new DeletePaymentRequest();
const createSubscriptionRequest = new CreateSubscriptionRequest();

export const paymentRoute: RouterOptions = {
  path: '/payment',
  middleware: [
    onlyAuth,
    setUserInfo,
  ],
  children: [
    {
      path: '/intent',
      method: 'post',
      controller: getPaymentIntent,
    },
    {
      path: '/methods',
      method: 'get',
      controller: getPaymentMethod,
    },
    {
      path: '/methods',
      method: 'post',
      request: createPaymentRequest.validation,
      controller: createPaymentMethod,
    },
    {
      path: '/methods',
      method: 'patch',
      request: setDefaultPaymentRequest.validation,
      controller: setDefaultPaymentMethod,
    },
    {
      path: '/methods',
      method: 'delete',
      request: deletePaymentRequest.validation,
      controller: deletePaymentMethod,
    },
    {
      path: '/subscription',
      method: 'post',
      request: createSubscriptionRequest.validation,
      controller: createSubscription,
    },
    {
      path: '/subscription',
      method: 'delete',
      controller: cancelSubscription,
    },
    {
      path: '/invoices',
      method: 'get',
      controller: getInvoices,
    },
  ],
};
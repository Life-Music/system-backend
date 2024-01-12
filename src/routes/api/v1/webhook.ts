import { stripeWebhook } from '@src/controllers/Webhook/WebhookController';
import { RouterOptions } from '@src/global';

export const webhookRoute: RouterOptions = {
  path: '/webhook',
  method: 'post',
  controller: stripeWebhook,
};
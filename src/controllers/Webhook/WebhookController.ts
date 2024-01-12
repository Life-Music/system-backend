import { Request, Response } from 'express';
import BaseController from '../BaseController';
import stripe from '@src/services/Stripe';
import UnexpectedException from '@src/exception/UnexpectedException';

class WebhookController extends BaseController {
  public stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) throw new UnexpectedException();
    const endpointSecret = 'whsec_c32965f376a75ececf11c438531327251e58cfda53e806d044eecc666035bebe';

    // @ts-ignore
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

    if (event.type === 'payment_intent.succeeded') {
      // Then define and call a function to handle the event payment_intent.succeeded
    }
    else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      if (event.data.object.status === 'canceled' ||
        event.data.object.status === 'incomplete_expired' ||
        event.data.object.status === 'unpaid') {
        const customerId = event.data.object.customer;
        if (typeof customerId === 'string') {
          await globalThis.prisma.user.update({
            where: {
              customerId,
            },
            data: {
              productId: null,
              subscriptionId: null,
            },
          });
        }
      }
    }
    else {
      console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({});
  };
}


const controller = new WebhookController();
const stripeWebhook = controller.stripeWebhook;

export {
  stripeWebhook,
};
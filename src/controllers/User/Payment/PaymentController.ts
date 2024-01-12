import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import UnexpectedException from '@src/exception/UnexpectedException';
import stripe from '@src/services/Stripe';
import dayjs from 'dayjs';
import { Request, Response } from 'express';
import type Stripe from 'stripe';
import { Prisma } from '~/prisma/generated/mysql';

class PaymentController extends BaseController {

  public getPaymentIntent = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();

    const paymentIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
    });

    return res.json(this.success(
      paymentIntent,
    ));
  };

  public getPaymentMethod = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();

    const user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    if (user.customerId) {
      const paymentMethods = await stripe.customers.listPaymentMethods(user.customerId, {
        type: 'card',
      });

      const customer = await stripe.customers.retrieve(user.customerId);

      return res.json(
        this.success({
          methods: paymentMethods,
          customer,
        }),
      );
    }

    return res.json(
      this.success(
        null,
      ),
    );
  };

  public createPaymentMethod = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      token: string
    };

    let user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    let customer;
    const paymentIntent = await stripe.setupIntents.retrieve(fields.token);
    let isCustomCreated = false;

    if (user.customerId) {
      customer = await stripe.customers.retrieve(user.customerId);
      isCustomCreated = true;
    }
    else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      user = await globalThis.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          customerId: customer.id,
        },
      });
    }

    await stripe.paymentMethods.attach(paymentIntent.payment_method as string, {
      customer: customer.id,
    });

    if (!isCustomCreated) {

      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentIntent.payment_method as string,
        },
      });
    }

    return res.json(
      this.success(
        user,
      ),
    );
  };

  public setDefaultPaymentMethod = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      paymentMethodId: string
    };

    const user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    if (!user.customerId) throw new UnexpectedException();

    const customer = await stripe.customers.update(user.customerId, {
      invoice_settings: {
        default_payment_method: fields.paymentMethodId,
      },
    });

    return res.json(
      this.success(
        customer,
      ),
    );
  };

  public deletePaymentMethod = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      paymentMethodId: string
    };

    const user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    if (!user.customerId) throw new UnexpectedException();

    const paymentMethod = await stripe.paymentMethods.detach(fields.paymentMethodId, {
    });

    return res.json(
      this.success(
        paymentMethod,
      ),
    );
  };

  private _cancelSubscription = async (subscriptionId: string) => {

    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    return subscription;
  };

  public cancelSubscription = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();

    const user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    if (!user.subscriptionId) throw new UnexpectedException();

    const subscription = await this._cancelSubscription(user.subscriptionId);

    await globalThis.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        subscriptionId: null,
        productId: null,
      },
    });

    return res.json(
      this.success(
        subscription,
      ),
    );
  };

  public createSubscription = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();

    const fields = req.fields as {
      productId: string
    };

    let user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    if (!user.customerId) throw new UnexpectedException();

    const product = await stripe.products.retrieve(fields.productId);

    if (!product.default_price) throw new UnexpectedException();

    let priceId = '';
    if (typeof product.default_price === 'string') priceId = product.default_price;
    else priceId = product.default_price.id;

    const params: Stripe.SubscriptionCreateParams = {
      customer: user.customerId,
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    };

    let trialEnd: Date | null = null;

    if (!user.trialEnd) {
      const price = await stripe.prices.retrieve(priceId);
      if (price.recurring?.interval === 'month') {
        trialEnd = dayjs().endOf('month').hour(23).minute(59).toDate();
        params.trial_end = Math.round(trialEnd.getTime() / 1000);
      }
    }

    if (user.subscriptionId) {
      await this._cancelSubscription(user.subscriptionId);
    }

    const subscription = await stripe.subscriptions.create(params);
    const dataUser: Prisma.UserUpdateInput = {
      productId: fields.productId,
      subscriptionId: subscription.id,
    };
    if (trialEnd) {
      dataUser.trialEnd = trialEnd;
    }
    user = await globalThis.prisma.user.update({
      where: {
        id: user.id,
      },
      data: dataUser,
    });

    return res.json(
      this.success(
        subscription,
      ),
    );
  };

  public getInvoices = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();

    const user = await globalThis.prisma.user.findUniqueOrThrow({
      where: {
        id: req.userInfo.id,
      },
    });

    if (!user.customerId) throw new UnexpectedException();

    const invoices = await stripe.invoices.list({
      customer: user.customerId,
      limit: 100,
    });

    return res.json(
      this.success(
        invoices,
      ),
    );
  };
}

const controller = new PaymentController();
const getPaymentIntent = controller.getPaymentIntent;
const getPaymentMethod = controller.getPaymentMethod;
const createPaymentMethod = controller.createPaymentMethod;
const setDefaultPaymentMethod = controller.setDefaultPaymentMethod;
const deletePaymentMethod = controller.deletePaymentMethod;
const createSubscription = controller.createSubscription;
const cancelSubscription = controller.cancelSubscription;
const getInvoices = controller.getInvoices;

export {
  getPaymentIntent,
  getPaymentMethod,
  createPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  createSubscription,
  cancelSubscription,
  getInvoices,
};
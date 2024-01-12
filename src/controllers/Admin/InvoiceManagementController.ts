import UnexpectedException from '@src/exception/UnexpectedException';
import AdminBaseController from './AdminBaseController';
import { Request, Response } from 'express';
import stripe from '@src/services/Stripe';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import Stripe from 'stripe';


class InvoiceManagementController extends AdminBaseController {
  public getInvoices = async (req: Request, res: Response) => {
    if (!req.adminInfo) throw new UnexpectedException();
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      id: string,
      user_id: string,
    };

    if (fields.id) {
      const invoice = await stripe.invoices.retrieve(fields.id);
      return res.json(
        this.success({
          data: [invoice],
        }),
      );
    }
    const params: Stripe.InvoiceListParams = {
      limit: 100,
    };

    if (fields.user_id) {
      const user = await globalThis.prisma.user.findUniqueOrThrow({
        where: {
          id: fields.user_id,
        },
      });
      params.customer = user.customerId ?? '';
    }

    const invoices = await stripe.invoices.list(params);

    return res.json(
      this.success(
        invoices,
      ),
    );
  };
}

const controller = new InvoiceManagementController();
const adminGetInvoices = controller.getInvoices;

export {
  adminGetInvoices,
};
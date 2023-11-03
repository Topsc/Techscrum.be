import { Request, Response } from 'express';
import { addPaymentHistory } from '../utils/addPaymentHistory';
import { subscriptionSender } from '../utils/emailSender';
import { createInvoiceModel, createPaymentHistoryModel, createTenantsModel, createUserModel } from '../utils/helper';
import { randomStringGenerator } from '../utils/randomStringGenerator';
import { TrialDate } from '../utils/TrialDate';
const Invoice = require('../model/invoice');

const jwt = require('jsonwebtoken');
import config from '../config/app';

let userModel: any;
let tenantModel: any;


const checkoutSessionCompleted = async (req: Request, res: Response, event: any) => {

  try {
    if (!tenantModel) {
      tenantModel = await createTenantsModel(req);
    }        

    if (!userModel) {
      userModel = await createUserModel(req);
    }
    const tenantInfo = await tenantModel.findOne({ origin: event.data.object.metadata.domainURL }).exec();

    if (!tenantInfo.customerId) {
      tenantModel.findOneAndUpdate(
        { origin: event.data.object.metadata.domainURL },
        {
          customerId: event.data.object.customer,
          currentProduct: event.data.object.metadata.productId,
          currentSubscriptionId: event.data.object.subscription,
        },
        { new: true },
      ).exec();

      userModel.findOneAndUpdate(
        { email: event.data.object.customer_details.email },
        {
          customerId: event.data.object.customer,
        },
        { new: true },
      ).exec();

    } else {
      tenantModel.findOneAndUpdate(
        { origin: event.data.object.metadata.domainURL },
        {
          currentProduct: event.data.object.metadata.productId,
          currentSubscriptionId: event.data.object.subscription,
        },
        { new: true },
      ).exec();
    }
  } catch (e: any) {
    res.status(500).send();
  }

};


const subscriptionCreateCompleted = async (req: Request, res: Response, event: any) => {
  setTimeout(async () => {  
    try {
      if (!tenantModel) {
        tenantModel = await createTenantsModel(req);
      }
      if (!userModel) {
        userModel = await createUserModel(req);
      }

      const tenantInfo = await tenantModel.findOne({ currentSubscriptionId: event.data.object.id }).exec();

      if (!tenantInfo) {
        res.status(404).send('No tenant found for subscription ID');
        return;
      }

      if (!tenantInfo.customerId) {
        res.status(500).send();
      }

      const productId = event.data.object.metadata.productId;
      
      const PaymentHistoryModal = await createPaymentHistoryModel(req);
      const paymentHistoryInfo = await PaymentHistoryModal.findOne({ currentProduct: event.data.object.plan.product, isFreeTrial: true }).exec();

      let currentPlanPaymentIntentId: string;
      if (paymentHistoryInfo) {
        currentPlanPaymentIntentId = paymentHistoryInfo.stripePaymentIntentId;
      } else {
        const paymentIntent = await config.stripe.paymentIntents.create({
          amount: event.data.object.plan.amount,
          currency: 'aud',
          payment_method_types: ['card'],
          receipt_email: 'wei19970101@gmail.com',
          description: '',
        });
        currentPlanPaymentIntentId = paymentIntent.id;
      }

      tenantModel.findOneAndUpdate(
        { customerId: tenantInfo.customerId },
        {
          stripeProductId: productId,
          stripePaymentIntentId: currentPlanPaymentIntentId, 
          $addToSet: { productHistory: event.data.object.plan.product, stripePaymentIntentHistoryId: currentPlanPaymentIntentId }, 
        },
        { new: true },
      ).exec();

    } catch (e) {
      res.status(500).send();
    }
  }, 5000);
};

const invoicePaymentSucceed = async (event: any, req: Request, res: Response) => {
  setTimeout(async () => {  
    try {
      if (!tenantModel) {
        tenantModel = await createTenantsModel(req);
      }   
      const tenantInfo = await tenantModel.findOne({ currentSubscriptionId: event.data.object.subscription }).exec();
      
      if (!tenantInfo) {
        res.send(404);
        return ;
      }
      
      let stripePaymentIntentId;
      let stripeProductId;
      let currentChargeStartDate;
      let currentChargeEndDate;
      let currentFreeTrialStartDate;
      let currentFreeTrialEndDate;

      if (tenantInfo) {
        stripePaymentIntentId = tenantInfo.stripePaymentIntentId;
        stripeProductId = tenantInfo.currentProduct;
      }

      if (!stripePaymentIntentId) {
        return ;
      }
      
      const intent = await config.stripe.paymentIntents.retrieve(stripePaymentIntentId);
      const subscription = await config.stripe.subscriptions.retrieve(event.data.object.subscription);

      const PlanStartDate = subscription.current_period_start;
      currentChargeStartDate = TrialDate(PlanStartDate);

      const PlanEndDate = subscription.current_period_end;
      currentChargeEndDate = TrialDate(PlanEndDate);

      let isFreeTrial: boolean;
      if (event.data.object.amount_paid === 0) {
        isFreeTrial = true;
        const freeTrialStartDate = subscription.trial_start;
        currentFreeTrialStartDate = TrialDate(freeTrialStartDate);
  
        const freeTrialEndDate = subscription.trial_end;
        currentFreeTrialEndDate = TrialDate(freeTrialEndDate);
      } else {
        isFreeTrial = false;
      }
      const PaymentHistoryInformation = await addPaymentHistory(req, {
        subscriptionId: event.data.object.id, // not necessary i think.
        currentProduct: stripeProductId,
        stripePaymentIntentId: intent.id,
        paymentIntentStatus: intent.status,
        amount: event.data.object.amount_paid,
        isFreeTrial: isFreeTrial,
      });

      tenantModel.findOneAndUpdate(
        { customerId: tenantInfo.customerId },
        {
          currentPaymentHistoryId: PaymentHistoryInformation._id,
          $addToSet: { paymentHistoryId: PaymentHistoryInformation._id }, 
          plan: 'Advanced',
        },
        { new: true },
      ).exec();

      const PaymentHistoryModal = await createPaymentHistoryModel(req);
      PaymentHistoryModal.findOneAndUpdate(
        { _id: PaymentHistoryInformation._id },
        {
          currentChargeStartDate: currentChargeStartDate,
          currentChargeEndDate: currentChargeEndDate,
          currentFreeTrialStartDate: currentFreeTrialStartDate,
          currentFreeTrialEndDate: currentFreeTrialEndDate,
        },
        { new: true },
      ).exec();

    } catch (e) {
      res.status(500).send();
    }
    
    const customerEmail = event.data.object.customer_email;
    const activeCode = randomStringGenerator(16);
    const validationToken = jwt.sign({ customerEmail, activeCode }, config.emailSecret);
    subscriptionSender(customerEmail, `token=${validationToken}`, '');

  }, 10000);
};


const invoiceFinalized = async (req: Request, res: Response, event: any) => {
  setTimeout(async () => {  
    try {
      const InvoiceModal = await createInvoiceModel(req);
      let amount: number;
      let planName: string;
      let formattedStartDate: string;
      let formattedEndDate: string;

      if (event.data.object.amount_due === 0) {
        amount = 0;
        planName = 'Free Trial';
      } else if (event.data.object.amount_due === 4900) {
        amount = 49;
        planName = 'Advanced Plan (Monthly)';
      } else {
        amount = 348;
        planName = 'Advanced Plan (Yearly)';
      }

      const subscription = await config.stripe.subscriptions.retrieve(event.data.object.subscription);

      formattedStartDate = TrialDate(subscription.current_period_start);
      formattedEndDate = TrialDate(subscription.current_period_end);

      const InvoiceFinalized = new InvoiceModal({
        stripeInvoiceId: event.data.object.id,
        invoiceNumber: event.data.object.number,
        invoiceURL: event.data.object.hosted_invoice_url,
        planName: planName,
        amount: amount,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      await InvoiceFinalized.save();
    
      if (!tenantModel) {
        tenantModel = await createTenantsModel(req);
      }        
    
      tenantModel.findOneAndUpdate(
        { currentSubscriptionId: event.data.object.subscription },
        {
          currentInvoice: InvoiceFinalized._id,
          $addToSet: { invoiceHistory: InvoiceFinalized._id },
        },
        { new: true },
      ).exec();

    } catch (e) {
      res.status(500).send();
    }
  }, 1000);
};

const chargeRefunded = async (req: Request, res: Response, event: any) => {
  try {
    let stripePaymentIntentId;
    let stripeProductId;
    const RefundStartDate = event.data.object.created;
    const formattedRefundStartDate = TrialDate(RefundStartDate);

    if (!userModel) {
      tenantModel = await createTenantsModel(req);
    }        

    // event.data.object.invoice  -> find id in Invoice model -> locate the tenant info -> find stripe payment intent
    const tenantInfo = await tenantModel.findOne({ customerId: event.data.object.customer }).exec();
    if (tenantInfo) {
      stripePaymentIntentId = tenantInfo.stripePaymentIntentId;
      stripeProductId = tenantInfo.currentProduct;
    }

    const intent = await config.stripe.paymentIntents.retrieve(stripePaymentIntentId);
    await addPaymentHistory(req, {
      currentChargeStartDate: formattedRefundStartDate,
      currentProduct: stripeProductId,
      stripePaymentIntentId: intent.id,
      paymentIntentStatus: intent.status,
      amount: event.data.object.amount,
      isRefund: true,
    });
    
    const InvoiceModal = Invoice.getModel(req.dbConnection);
    const InvoiceFinalized = new InvoiceModal({
      stripeInvoiceId: event.data.object.invoice,
      invoiceNumber: event.data.object.number,
      invoiceURL: event.data.object.receipt_url,
      isRefund: true,
    });
    await InvoiceFinalized.save();

  } catch (e) {
  }
};

export { checkoutSessionCompleted, subscriptionCreateCompleted, invoicePaymentSucceed, invoiceFinalized, chargeRefunded };
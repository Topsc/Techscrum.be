import { Request, Response } from 'express';
import { checkoutSessionCompleted, invoiceFinalized, invoicePaymentSucceed, subscriptionCreateCompleted, chargeRefunded } from '../../services/stripeWebhookService';

import config from '../../config/app';

exports.stripeController = async (req: Request, res: Response) => {
  let event: any;
  
  const secret = config.stripeSecret;
  const payloadString = Buffer.from(JSON.stringify(req.body)).toString();
  const header = config.stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });

  try {
    event = config.stripe.webhooks.constructEvent(payloadString, header, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await checkoutSessionCompleted(req, res, event);
      break; 

    case 'customer.subscription.created':
      await subscriptionCreateCompleted(req, res, event);
      break;
    
    case 'invoice.payment_succeeded':
      await invoicePaymentSucceed(event, req, res);
      break;

    case 'charge.refunded':
      await chargeRefunded(req, res, event);
      break;

    case 'invoice.paid':
      break;
    
    case 'payment_intent.amount_refunded':
      break;

    case 'customer.subscription.updated':
      break;

    case 'customer.subscription.trial_will_end':
      break; 

    case 'payment_intent.succeeded':
      break;

    case 'payment_intent.payment_failed':
      break;

    case 'invoice.payment_failed':
      break;

    case 'invoice.finalized':
      await invoiceFinalized(req, res, event);
      break;
    
    case 'invoice.updated':
      break;

    default:
  }

  res.status(200).send();
};
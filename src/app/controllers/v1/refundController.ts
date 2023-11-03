import { Request, Response } from 'express';
const User = require('../../model/user');
import config from '../../config/app';

exports.refundController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const userModel = User.getModel(req.dbConnection);
    const user = await userModel.findOne({ _id: userId });

    const paymentIntent = await config.stripe.paymentIntents.retrieve(user.stripePaymentIntentId);
    const refund = await config.stripe.refunds.create({ payment_intent: paymentIntent.id });
    
    res.status(200).send(refund);
  } catch (e) {
  }
};
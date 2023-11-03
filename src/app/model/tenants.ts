export {};
const mongoose = require('mongoose');
import { Types } from 'mongoose';
const Schema = mongoose.Schema;

const tenantSchema = new Schema(
  {
    origin: {
      type: String,
      required: true,
      unique: true,
    },
    passwordSecret: {
      type: String,
      // required: true,
    },
    plan: {
      type: String,
      enum: ['Free', 'Advanced', 'Ultra', 'Enterprise'],
      default: 'Free',
      required: true,
    },
    owner: { type: Types.ObjectId, ref: 'users' },
    active: { type: Boolean, default: false },

    customerId: {
      type: String,
    },

    email: {
      type: String,
    },

    paymentHistoryId: [
      {
        ref: 'paymentHistory',
        type: Types.ObjectId,
      },
    ],

    currentPaymentHistoryId: {
      ref: 'paymentHistory',
      type: Types.ObjectId,
    },

    stripePaymentIntentHistoryId: [
      {
        type: String,
      },
    ],

    // this is pointing to the current subscription plan. 
    stripePaymentIntentId: {  
      type: String,
      default: null, 
    },
    
    // point out current payment History (current invoice)
    currentInvoice: {
      ref: 'invoice',
      type: Types.ObjectId,
    },

    invoiceHistory: [
      {
        ref: 'invoice',
        type: String,
      },
    ],

    currentProduct: {
      ref: 'product',
      type: String,
    },

    productHistory: [
      {
        ref: 'product',
        type: String,
      },
    ],

    freeTrialStartDate: {
      type: String,
    },

    freeTrialEndDate: {
      type: String,
    },

    currentChargeStartDate: {
      type: String,
    }, 

    currentChargeEndDate: {
      type: String,
    },

    currentSubscriptionId: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('tenants', tenantSchema);
};

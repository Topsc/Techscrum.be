import { Request } from 'express';
import { createPaymentHistoryModel } from './helper';

interface PaymentHistoryProps {
  subscriptionId?: string | null;
  currentChargeStartDate?: string;
  currentChargeEndDate?: string;
  currentFreeTrialStartDate?: string | null;
  currentFreeTrialEndDate?: string | null;
  currentProduct?: string | null;
  stripePaymentIntentId?: string | null;
  paymentIntentStatus?: string | null;
  amount?: number;
  isRefund?: boolean,
  isFreeTrial?: boolean,
}

const addPaymentHistory = async (req: Request, params: PaymentHistoryProps) => {
  const PaymentHistoryModal = await createPaymentHistoryModel(req);

  const PaymentHistoryInformation = new PaymentHistoryModal({
    subscriptionId: params.subscriptionId,
    currentChargeStartDate: params.currentChargeStartDate,
    currentChargeEndDate: params.currentChargeEndDate,
    currentFreeTrialStartDate: params.currentFreeTrialStartDate,
    currentFreeTrialEndDate: params.currentFreeTrialEndDate,
    currentProduct: params.currentProduct,
    stripePaymentIntentId: params.stripePaymentIntentId,
    paymentIntentStatus: params.paymentIntentStatus,
    amount: params.amount,
    isRefund: params.isRefund,
    isFreeTrial: params.isFreeTrial,

  });
  await PaymentHistoryInformation.save();
  return PaymentHistoryInformation;
};


export { addPaymentHistory }; 
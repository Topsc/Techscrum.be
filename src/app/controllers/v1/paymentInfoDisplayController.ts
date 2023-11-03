import { Request, Response, NextFunction } from 'express';
import { checkIsUserSubscribePlan, getBillingOverviewInformation, getStatusOfUserCurrentPlan, getUserInvoiceHistory } from '../../services/paymentInfoDisplayService';

exports.getBillingOverviewInfo = async (req: Request, res: Response, next: NextFunction) => {
  const domainURL = req.headers.origin;
  try {
    const billingInfo = await getBillingOverviewInformation(req, domainURL);
    res.send(billingInfo);
  } catch (e) {
    next(e);
  }
};

exports.isUserFreeTrial = async (req: Request, res: Response, next: NextFunction) => {
  const domainURL = req.headers.origin;
  try {
    const isFreeTrial = await getStatusOfUserCurrentPlan(req, domainURL);
    res.send(isFreeTrial);
  } catch (e) {
    next(e);
  }
};

exports.isUserSubscribePlan = async (req: Request, res: Response, next: NextFunction) => { 
  const domainURL = req.headers.origin;
  try {
    const isUserSubscribePlan = await checkIsUserSubscribePlan(req, domainURL);
    res.send(isUserSubscribePlan);
  } catch (e) {
    next(e);
  }
};


exports.getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const domainURL = req.headers.origin;
  try {
    const userInvoice = await getUserInvoiceHistory(req, domainURL);
    res.send(userInvoice);
  } catch (e) {
    next(e);
  }
};
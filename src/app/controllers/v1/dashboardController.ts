import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import { findDailyScrumsByProjectAndUser } from '../../services/dailyScrumService';
import logger from 'winston';
import status from 'http-status';
const openai = require('../../services/openAiService');
const { getDashboardCounts } = require('../../services/dashboardService');
const openAiConfig = require('../../config/openAi');

exports.show = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const { projectId } = req.params;
  const { userId } = req.query;

  try {
    const dashboardCounts = await getDashboardCounts(projectId, req.dbConnection);

    // get the `complete` progresses of daily scrums for the project for initial user (who sends the request) - remember `progresses` is orignially an array and is sorted and returned the latest one in toJSON method before sending to front end
    const dailyScrums = await findDailyScrumsByProjectAndUser(
      projectId,
      userId as string,
      req.dbConnection,
      req.tenantsConnection,
    );

    return res.status(200).json(
      replaceId({
        ...dashboardCounts,
        dailyScrums,
      }),
    );
  } catch (e) {
    next(e);
  }
};

exports.showDailyScrums = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const { projectId } = req.params;
  const { userId } = req.query;

  try {
    const result = await findDailyScrumsByProjectAndUser(
      projectId,
      userId as string,
      req.dbConnection,
      req.tenantsConnection,
    );

    res.status(200).json(replaceId(result));
  } catch (e) {
    next(e);
  }
};

exports.generatePDF = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const { projectId } = req.params;

  try {
    const dashboardCounts = await getDashboardCounts(projectId, req.dbConnection);

    const response = await openai.createChatCompletion({
      model: openAiConfig.GPT_MODEL,
      messages: [
        {
          role: openAiConfig.USER_ROLE,
          content: `I am a business analyst and please help me generate a formal report based on the following data: ${JSON.stringify(
            dashboardCounts,
          )}`,
        },
      ],
    });

    res.send(response?.data?.choices?.[0]?.message);
  } catch (e) {
    next(e);
  }
};

import { DailyScrumDocument } from '../model/dailyScrum';

const { param, query, body } = require('express-validator');
const { isObjectIdOrHexString } = require('mongoose');

const checkValidObjectId = (value: string) => {
  if (!isObjectIdOrHexString(value)) {
    throw new Error('Not an ObjectId');
  }
  return true;
};

const generateIdValidationRule = (
  reqType: 'param' | 'body' | 'query',
  key: string,
  isRequired: boolean = false,
) => {
  let validator;

  if (reqType === 'param') {
    validator = param;
  } else if (reqType === 'body') {
    validator = body;
  } else {
    validator = query;
  }

  let validationChain = validator(key);

  if (isRequired) {
    validationChain = validationChain
      .notEmpty()
      .withMessage(`${key} MUST be found in ${reqType}`)
      .bail();
  } else {
    validationChain = validationChain.optional();
  }

  return validationChain
    .isString()
    .withMessage(`${key} in ${reqType} MUST be a string`)
    .bail()
    .custom(checkValidObjectId)
    .withMessage(`${key} in ${reqType} MUST be an Mongodb ObjectId`)
    .bail();
};

// filter in query must be in format of xxxId
const show = [
  generateIdValidationRule('param', 'projectId', true),
  generateIdValidationRule('query', 'userId', true),
  generateIdValidationRule('query', 'taskId', false),
];

const store = [
  generateIdValidationRule('param', 'projectId', true),
  body('title').notEmpty().isString().isLength({ max: 20 }),
  generateIdValidationRule('body', 'userId', true),
  generateIdValidationRule('body', 'taskId', true),
];

const update = [
  generateIdValidationRule('param', 'projectId', true),
  generateIdValidationRule('param', 'dailyScrumId', true),
  body('progress')
    .notEmpty()
    .withMessage('progress is required')
    .bail()
    .isObject()
    .withMessage('progress must be an object')
    .bail()
    .custom(
      (
        progress: { timeStamp: number; value: number },
        { req }: { req: { body: Partial<DailyScrumDocument>; params: { dailyScrumId: string } } },
      ) => {
        const { dailyScrumId } = req.params;

        if (!progress.hasOwnProperty('timeStamp') || !progress.hasOwnProperty('value')) {
          throw new Error(
            `[EV005]Express-validator: dailyScrumId: ${dailyScrumId} progress must have 2 properties: timeStamp and value`,
          );
        }

        return true;
      },
    ),
  body('isCanFinish')
    .notEmpty()
    .withMessage('isCanFinish is required')
    .bail()
    .isBoolean()
    .withMessage('isCanFinish must be a boolean'),
  body('isNeedSupport')
    .notEmpty()
    .withMessage('isNeedSupport is required')
    .bail()
    .isBoolean()
    .withMessage('isNeedSupport must be a boolean')
    .bail()
    .custom(
      (
        value: boolean,
        {
          req,
        }: {
          req: {
            body: Partial<DailyScrumDocument>;
            params: {
              dailyScrumId: string;
            };
          };
        },
      ) => {
        const { isCanFinish } = req.body;
        const { dailyScrumId } = req.params;
        if (isCanFinish && value === true) {
          throw new Error(
            `[EV001]Express-validator: dailyScrumId: ${dailyScrumId} when "isCanFinish" is true, "isNeedSupport" must be false.`,
          );
        }

        return true;
      },
    ),
  body('supportType')
    .notEmpty()
    .withMessage('supportType is required')
    .bail()
    .isInt({ min: 0, max: 4 })
    .withMessage('supportType must be an integar between 0 to 4')
    .bail()
    .custom((value: number, { req }: { req: { body: Partial<DailyScrumDocument> } }) => {
      const { isNeedSupport } = req.body;
      if (!isNeedSupport) {
        return value === 0;
      }
      return [1, 2, 3, 4].includes(value);
    })
    .withMessage(
      '[EV002]Express-validator: "supportType" Must be 0 when "isNeedSupport" is false AND Must be 1-4 when "isNeedSupport" is true',
    ),
  body('otherSupportDesc')
    .optional()
    .isString()
    .withMessage('otherSupportDesc must be a string')
    .bail()
    .isLength({ max: 40 })
    .withMessage('otherSupportDesc must not be more than 40 characters')
    .bail()
    .custom(
      (
        value: string,
        { req }: { req: { body: Partial<DailyScrumDocument>; params: { dailyScrumId: string } } },
      ) => {
        const { supportType, isNeedSupport } = req.body;
        const { dailyScrumId } = req.params;

        if ((!isNeedSupport || supportType !== 4) && value) {
          throw new Error(
            `[EV003]Express-validator: dailyScrumId: ${dailyScrumId} "otherSupportDesc" MUST be empty string when "isNeedSupport" is false OR "supportType" is not 4 (other support)`,
          );
        }

        if (supportType === 4 && value.length === 0) {
          throw new Error(
            `[EV004]Express-validator: dailyScrumId: ${dailyScrumId} "otherSupportDesc" MUST not be an empty string when "supportType" is 4 (other support)`,
          );
        }

        return true;
      },
    ),
];

const destroy = [
  generateIdValidationRule('param', 'projectId', true),
  generateIdValidationRule('query', 'taskId', true),
];

module.exports = { show, update, store, destroy, generateIdValidationRule };

export {};
const { param, body } = require('express-validator');

const store = [param('fullName').notEmpty().isString()];

const validTitles = [
  'Just saying hi!',
  "I'd like to request a feature",
  'I have a question about billing',
  "I'm confused about how something works",
  'Other',
];

const contactForm = [
  body(['fullName', 'company', 'message']).notEmpty(),
  body('phone').isNumeric().isLength({ min: 10 }).withMessage('10 digit phone number!'),
  body('email').normalizeEmail().isEmail(),
  body('title')
    .exists()
    .withMessage('Title is Requiered')
    .isString()
    .withMessage('Title must be a String')
    .isIn(validTitles)
    .withMessage('Title is not a valid one'),
];

module.exports = {
  store,
  contactForm,
};

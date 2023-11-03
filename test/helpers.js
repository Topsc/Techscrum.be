const sinon = require('sinon');
const dbHandler = require('./dbHandler');
const saasMiddleware = require('../src/app/middleware/saasMiddleware');
const authMiddleware = require('../src/app/middleware/authMiddleware');
const seed = require('./seed');

let authStub = null;
let sassStub = null;

const setup = async () => {
  const dbConnection = await dbHandler.connect();
  await dbHandler.clearDatabase();

  await seed(dbConnection);

  authStub = sinon
    .stub(authMiddleware, 'authenticationTokenMiddleware')
    .callsFake(function (req, res, next) {
      return next();
    });
  sassStub = sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    return next();
  });

  const app = require('../src/loaders/express');

  return {
    app,
    dbConnection,
  };
};

const restore = async () => {
  if (!authStub || !sassStub) return;
  await authStub.restore();
  await sassStub.restore();
  await dbHandler.closeDatabase();
};

module.exports = {
  setup,
  restore,
};

const Board = require('../src/app/model/board');
const Status = require('../src/app/model/status');
const Task = require('../src/app/model/task');
const Sprint = require('../src/app/model/sprint');
const { BOARD_SEED } = require('./fixtures/board');
const { STATUS_SEED } = require('./fixtures/statuses');
const { getTask } = require('./fixtures/task');
const { SPRINT_SEED } = require('./fixtures/sprint');

module.exports = async (dbConnection) => {
  await Board.getModel(dbConnection).create(BOARD_SEED);
  await Status.getModel(dbConnection).create(STATUS_SEED);
  await Task.getModel(dbConnection).create(getTask());
  await Sprint.getModel(dbConnection).create(SPRINT_SEED);
};

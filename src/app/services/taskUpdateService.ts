import { Request } from 'express';
const Task = require('../model/task');
const Board = require('../model/board');
const User = require('../model/user');

export const taskUpdate = async (req: Request) => {
  const task = await Task.getModel(req.dbConnection).findOne({ _id: req.params.id });
  if (!task) return {};

  const { title, statusId, typeId, description, storyPoint, dueAt, type, targetIndex, attachmentUrls, assignId } =
    req.body;
  const board = await Board.getModel(req.dbConnection).findOne({ _id: task.boardId });

  if (task.statusId.toString() === statusId) {
    //if we need to move, find target columns, reorder column items
    //if the insert item is the last item, task will be added in the last if operator
    if (targetIndex !== null && targetIndex !== undefined) {
      for (const element of board.taskStatus) {
        if (element._id.toString() === statusId) {
          const { items } = element;
          let orderIndex = 0;
          element.items = items.reduce(
            (result: [{}], item: { taskId: string; order: number }, index: number) => {
              if (item.taskId.toString() !== task._id.toString()) {
                if (index === targetIndex && index !== items.length - 1) result.push({ taskId: task._id, order: orderIndex++ });
                result.push({ ...item, order: orderIndex++ });
                return result;
              }
              return result;
            },
            [],
          );

          if (targetIndex >= element.items.length) {
            element.items.push({ taskId: task._id, order: orderIndex++ });
          }
        }
      }
    }
  } else {
    //delete target task and set task to destination location
    for (const element of board.taskStatus) {
      if (element._id.toString() === task.statusId.toString()) {
        const { items } = element;
        let orderIndex = 0;
        const temp = items.reduce((result: [{}], item: { taskId: string; order: number }) => {
          if (item.taskId.toString() !== task._id.toString()) {
            result.push({ ...item, order: orderIndex++ });
            return result;
          }
          return result;
        }, []);
        element.items = temp;
        continue;
      }

      if (element._id.toString() === statusId) {
        if (
          targetIndex === null ||
          targetIndex === undefined ||
          element.items.length === targetIndex
        ) {
          const length = element.items.length;
          element.items.push({ taskId: task._id, order: length });
        } else {
          const { items } = element;
          let orderIndex = 0;
          element.items = items.reduce(
            (result: [{}], item: { taskId: string; order: number }, index: number) => {
              if (index === targetIndex) result.push({ taskId: task._id, order: orderIndex++ });
              result.push({ ...item, order: orderIndex++ });
              return result;
            },
            [],
          );
        }
      }
    }
  }

  await board.save();
  const updateTask = await Task.getModel(req.dbConnection).findOneAndUpdate(
    { _id: req.params.id },
    { title, typeId, statusId, description, storyPoint, dueAt, type, attachmentUrls, assignId },
    { new: true },
  ).populate({ path: 'assignId', Model: User.getModel(req.dbConnection) });
  return updateTask;
};

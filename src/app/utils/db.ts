import { Mongoose } from 'mongoose';

exports.connection = (connection: string) => {
  let connectionMongoose = new Mongoose();
  connectionMongoose.connect(connection);
  return connectionMongoose;
};

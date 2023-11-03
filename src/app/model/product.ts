export {};
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    stripeProductId: {
      type: String,
    },

    productName: {
      type: String,
    },

    productPrice: {
      type: String,
    },
  },
);

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('product', productSchema);
};

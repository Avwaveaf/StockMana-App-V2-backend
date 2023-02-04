const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    name: {
      type: String,
      required: [true, 'Please add product name'],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      default: 'SKU-product',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add product category..'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Please add product Quantity..'],
      trim: true,
    },
    price: {
      type: String,
      required: [true, 'Please add product Price..'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add product Description..'],
      trim: true,
    },
    imageUrl: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('products', productSchema);
module.exports = Product;

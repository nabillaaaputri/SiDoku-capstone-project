import express from 'express';
import {
  getProducts,
  addProducts,
  editProductById,
  archiveProductById,
  restoreProductById,
} from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.post('/', addProducts);
productRouter.put('/:productId', editProductById);
productRouter.patch('/:productId/archive', archiveProductById);
productRouter.patch('/:productId/restore', restoreProductById);

export default productRouter;
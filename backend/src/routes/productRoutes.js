import express from 'express';
import {
  getProductCategories,
  getProducts,
  addProducts,
  editProductById,
  archiveProductById,
  restoreProductById,
} from '../controllers/productController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import {
  ProductPayloadSchema,
  ProductUpdatePayloadSchema,
} from '../validators/productValidator.js';

const productRouter = express.Router();

productRouter.get('/categories', authenticateToken, getProductCategories);

productRouter.get('/', authenticateToken, getProducts);

productRouter.post(
  '/',
  authenticateToken,
  validatePayload(ProductPayloadSchema, 'Input produk tidak valid.'),
  addProducts,
);

productRouter.put(
  '/:productId',
  authenticateToken,
  validatePayload(ProductUpdatePayloadSchema, 'Input produk tidak valid.'),
  editProductById,
);

productRouter.patch('/:productId/archive', authenticateToken, archiveProductById);
productRouter.patch('/:productId/restore', authenticateToken, restoreProductById);

export default productRouter;
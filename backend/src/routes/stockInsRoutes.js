import express from 'express';
import {
  getStockIns,
  addStockIn,
  deleteStockInById,
} from '../controllers/stockInController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import validateQuery from '../middlewares/validateQuery.js';
import {
  StockInPayloadSchema,
  StockInQuerySchema,
} from '../validators/stockInValidator.js';

const stockInRouter = express.Router();

stockInRouter.get(
  '/',
  authenticateToken,
  validateQuery(StockInQuerySchema, 'Query stok masuk tidak valid.'),
  getStockIns,
);

stockInRouter.post(
  '/',
  authenticateToken,
  validatePayload(StockInPayloadSchema, 'Input stok masuk tidak valid.'),
  addStockIn,
);

stockInRouter.delete('/:stockInId', authenticateToken, deleteStockInById);

export default stockInRouter;
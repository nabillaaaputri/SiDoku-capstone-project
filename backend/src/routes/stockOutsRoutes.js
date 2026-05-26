import express from 'express';
import {
  getStockOuts,
  addStockOut,
  deleteStockOutById,
} from '../controllers/stockOutController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import validateQuery from '../middlewares/validateQuery.js';
import {
  StockOutPayloadSchema,
  StockOutQuerySchema,
} from '../validators/stockOutValidator.js';

const stockOutRouter = express.Router();

stockOutRouter.get(
  '/',
  authenticateToken,
  validateQuery(StockOutQuerySchema, 'Query stok keluar tidak valid.'),
  getStockOuts,
);

stockOutRouter.post(
  '/',
  authenticateToken,
  validatePayload(StockOutPayloadSchema, 'Input stok keluar tidak valid.'),
  addStockOut,
);

stockOutRouter.delete('/:stockOutId', authenticateToken, deleteStockOutById);

export default stockOutRouter;
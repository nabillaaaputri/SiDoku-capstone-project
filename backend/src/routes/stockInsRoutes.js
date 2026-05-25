import express from 'express';
import {
  getStockIns,
  addStockIn,
  deleteStockInById,
} from '../controllers/stockInController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import { StockInPayloadSchema } from '../validators/stockInValidator.js';

const stockInRouter = express.Router();

stockInRouter.get('/', authenticateToken, getStockIns);

stockInRouter.post(
  '/',
  authenticateToken,
  validatePayload(StockInPayloadSchema, 'Input stok masuk tidak valid.'),
  addStockIn,
);

stockInRouter.delete('/:stockInId', authenticateToken, deleteStockInById);

export default stockInRouter;
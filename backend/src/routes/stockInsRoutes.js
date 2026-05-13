import express from 'express';
import {
  getStockIns,
  addStockIn,
  deleteStockInById
} from '../controllers/stockInController.js';

const stockInRouter = express.Router();

stockInRouter.get('/', getStockIns);
stockInRouter.post('/', addStockIn);
stockInRouter.delete('/:stockInId', deleteStockInById);

export default stockInRouter;
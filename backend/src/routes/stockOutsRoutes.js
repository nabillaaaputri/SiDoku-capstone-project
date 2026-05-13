import express from 'express';
import {
  getStockOuts,
  addStockOut,
  deleteStockOutById
} from '../controllers/stockOutController.js';

const stockOutRouter = express.Router();

stockOutRouter.get('/', getStockOuts);
stockOutRouter.post('/', addStockOut);
stockOutRouter.delete('/:stockOutId', deleteStockOutById);

export default stockOutRouter;
import express from 'express';
import { getSellingRecap } from '../controllers/sellingRecapController.js';
import authenticateToken from '../middlewares/auth.js';
import validateQuery from '../middlewares/validateQuery.js';
import { SellingRecapQuerySchema } from '../validators/sellingRecapValidator.js';

const sellingRecapRouter = express.Router();

sellingRecapRouter.get(
  '/',
  authenticateToken,
  validateQuery(SellingRecapQuerySchema, 'Query selling recap tidak valid.'),
  getSellingRecap,
);

export default sellingRecapRouter;
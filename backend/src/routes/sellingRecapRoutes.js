import express from 'express';
import { getSellingRecap } from '../controllers/sellingRecapController.js';
import authenticateToken from '../middlewares/auth.js';

const sellingRecapRouter = express.Router();

sellingRecapRouter.get('/', authenticateToken, getSellingRecap);

export default sellingRecapRouter;
import express from 'express';
import { getSellingRecap } from '../controllers/sellingRecapController.js';

const sellingRecapRouter = express.Router();

sellingRecapRouter.get('/', getSellingRecap);

export default sellingRecapRouter;
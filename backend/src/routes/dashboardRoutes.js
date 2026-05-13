import express from 'express';
import {
  getSummary,
  getInsights,
  getLowStocks,
  getTrends,
} from '../controllers/dashboardController.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/summary', getSummary);
dashboardRouter.get('/insights', getInsights);
dashboardRouter.get('/low-stocks', getLowStocks);
dashboardRouter.get('/trends', getTrends);

export default dashboardRouter;
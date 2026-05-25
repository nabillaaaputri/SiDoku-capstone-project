import express from 'express';
import {
  getSummary,
  getInsights,
  getLowStocks,
  getTrends,
} from '../controllers/dashboardController.js';
import authenticateToken from '../middlewares/auth.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/summary', authenticateToken, getSummary);
dashboardRouter.get('/insights', authenticateToken, getInsights);
dashboardRouter.get('/low-stocks', authenticateToken, getLowStocks);
dashboardRouter.get('/trends', authenticateToken, getTrends);

export default dashboardRouter;
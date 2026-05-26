import express from 'express';
import authenticateToken from '../middlewares/auth.js';
import validateQuery from '../middlewares/validateQuery.js';
import {
  getSalesForecast,
  getAiInsights,
  getAiRecommendations,
} from '../controllers/aiController.js';
import {
  AiForecastQuerySchema,
  AiInsightQuerySchema,
} from '../validators/aiValidator.js';

const aiRouter = express.Router();

aiRouter.get(
  '/forecast/:productId',
  authenticateToken,
  validateQuery(AiForecastQuerySchema, 'Query AI forecast tidak valid.'),
  getSalesForecast,
);

aiRouter.get(
  '/insights',
  authenticateToken,
  validateQuery(AiInsightQuerySchema, 'Query AI insights tidak valid.'),
  getAiInsights,
);

aiRouter.get(
  '/recommendations',
  authenticateToken,
  validateQuery(AiInsightQuerySchema, 'Query AI recommendations tidak valid.'),
  getAiRecommendations,
);

export default aiRouter;
import Joi from 'joi';

export const AiForecastQuerySchema = Joi.object({
  daysAhead: Joi.number().integer().min(1).max(30).optional(),
  historyDays: Joi.number().integer().min(28).max(90).optional(),
});

export const AiInsightQuerySchema = Joi.object({
  historyDays: Joi.number().integer().min(28).max(90).optional(),
});
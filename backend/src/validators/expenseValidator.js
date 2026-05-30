import Joi from 'joi';

export const ExpensePayloadSchema = Joi.object({
  expenseName: Joi.string().trim().required(),
  category: Joi.string().valid('restock', 'operational', 'others').required(),
  amount: Joi.number().integer().min(1).required(),
  date: Joi.string().isoDate().required(),
  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  description: Joi.string().trim().allow('', null).optional(),
});

export const ExpenseQuerySchema = Joi.object({
  category: Joi.string().valid('restock', 'operational', 'others').optional(),
  date: Joi.string().isoDate().optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
});
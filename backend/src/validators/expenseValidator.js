import Joi from 'joi';

export const ExpensePayloadSchema = Joi.object({
  expenseName: Joi.string().trim().required(),
  category: Joi.string().valid('restock', 'operational', 'others').required(),
  amount: Joi.number().integer().min(1).required(),
  date: Joi.string().isoDate().required(),
  description: Joi.string().trim().allow('', null).optional(),
});
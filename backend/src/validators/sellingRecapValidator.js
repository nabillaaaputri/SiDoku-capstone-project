import Joi from 'joi';

export const SellingRecapQuerySchema = Joi.object({
  date: Joi.date().iso().optional(),
});
import Joi from 'joi';

export const StockInPayloadSchema = Joi.object({
  productId: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
  date: Joi.string().isoDate().required(),
  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  note: Joi.string().trim().allow('', null).optional(),
});

export const StockInQuerySchema = Joi.object({
  productId: Joi.string().trim().optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
});
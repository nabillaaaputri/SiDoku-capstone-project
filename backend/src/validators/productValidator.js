import Joi from 'joi';
import productCategories from '../constants/productCategories.js';

export const ProductPayloadSchema = Joi.object({
  productName: Joi.string().trim().required(),
  purchasePrice: Joi.number().integer().min(1).required(),
  sellingPrice: Joi.number().integer().min(1).required(),
  minimumStock: Joi.number().integer().min(0).required(),
  category: Joi.string().valid(...productCategories).required(),
  unit: Joi.string().trim().required(),
  initialStock: Joi.number().integer().min(0).required(),
});

export const ProductUpdatePayloadSchema = Joi.object({
  productName: Joi.string().trim().required(),
  category: Joi.string().valid(...productCategories).required(),
  unit: Joi.string().trim().required(),
  purchasePrice: Joi.number().integer().min(1).required(),
  sellingPrice: Joi.number().integer().min(1).required(),
  minimumStock: Joi.number().integer().min(0).required(),
});

export const ProductQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'archived').optional(),
  category: Joi.string().valid(...productCategories).optional(),
});
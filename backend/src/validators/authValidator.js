import Joi from 'joi';

export const RegisterPayloadSchema = Joi.object({
  storeName: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Password dan konfirmasi password tidak sama.',
    }),
});

export const LoginPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const RefreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
import Joi from 'joi';

export const ProfilePayloadSchema = Joi.object({
  ownerName: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().trim().required(),
  profileImage: Joi.string().trim().required(),
});

export const StoreAccountPayloadSchema = Joi.object({
  storeName: Joi.string().trim().required(),
  storeCategory: Joi.string().trim().required(),
  storeAddress: Joi.string().trim().required(),
  storeDescription: Joi.string().trim().required(),
});

export const PasswordPayloadSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(5).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Password baru dan konfirmasi password tidak sama.',
    }),
});
import express from 'express';
import {
  getProfile,
  updateProfile,
  getStoreAccount,
  updateStoreAccount,
  updatePassword,
} from '../controllers/settingsController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import {
  ProfilePayloadSchema,
  StoreAccountPayloadSchema,
  PasswordPayloadSchema,
} from '../validators/settingsValidator.js';

const settingsRouter = express.Router();

settingsRouter.get('/profile', authenticateToken, getProfile);

settingsRouter.put(
  '/profile',
  authenticateToken,
  validatePayload(ProfilePayloadSchema, 'Input yang anda masukkan tidak valid.'),
  updateProfile,
);

settingsRouter.get('/store-account', authenticateToken, getStoreAccount);

settingsRouter.put(
  '/store-account',
  authenticateToken,
  validatePayload(StoreAccountPayloadSchema, 'Input yang anda masukkan tidak valid.'),
  updateStoreAccount,
);

settingsRouter.put(
  '/password',
  authenticateToken,
  validatePayload(PasswordPayloadSchema, 'Input yang anda masukkan tidak valid.'),
  updatePassword,
);

export default settingsRouter;
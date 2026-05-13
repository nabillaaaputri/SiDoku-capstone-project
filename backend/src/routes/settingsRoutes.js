import express from 'express';
import {
  getProfile,
  updateProfile,
  getStoreAccount,
  updateStoreAccount,
  updatePassword,
} from '../controllers/settingsController.js';

const settingsRouter = express.Router();

settingsRouter.get('/profile', getProfile);
settingsRouter.put('/profile', updateProfile);
settingsRouter.get('/store-account', getStoreAccount);
settingsRouter.put('/store-account', updateStoreAccount);
settingsRouter.put('/password', updatePassword);

export default settingsRouter;
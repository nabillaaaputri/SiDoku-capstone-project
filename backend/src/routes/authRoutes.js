import express from 'express';
import {
  register,
  login,
  logout,
  getAllUsers,
  refreshAccessToken,
} from '../controllers/authController.js';
import validatePayload from '../middlewares/validatePayload.js';
import {
  RegisterPayloadSchema,
  LoginPayloadSchema,
  RefreshTokenPayloadSchema,
} from '../validators/authValidator.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

router.post(
  '/register',
  validatePayload(RegisterPayloadSchema, 'Input register tidak valid.'),
  register,
);

router.post(
  '/login',
  validatePayload(LoginPayloadSchema, 'Input login tidak valid.'),
  login,
);

router.put(
  '/refresh',
  validatePayload(RefreshTokenPayloadSchema, 'Refresh token tidak valid.'),
  refreshAccessToken,
);

router.post(
  '/logout',
  validatePayload(RefreshTokenPayloadSchema, 'Refresh token tidak valid.'),
  logout,
);

router.get('/users', authenticateToken, getAllUsers);

export default router;
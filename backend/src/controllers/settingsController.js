import settings from '../data/settings.js';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
  AuthorizationError,
} from '../exceptions/index.js';

export const getProfile = (req, res, next) => {
  if (!settings.profile) {
    return next(new NotFoundError('Data profil tidak ditemukan.'));
  }

  return response(res, 200, 'Profile retrieved successfully', settings.profile);
};

export const updateProfile = (req, res, next) => {
  const { ownerName, email, phoneNumber, profileImage } = req.body;

  if (!ownerName || !email || !phoneNumber || !profileImage) {
    return next(new InvariantError('Input yang anda masukkan tidak valid.'));
  }

  settings.profile = {
    ...settings.profile,
    ownerName,
    email,
    phoneNumber,
    profileImage,
  };

  return response(res, 200, 'Profile updated successfully', settings.profile);
};

export const getStoreAccount = (req, res, next) => {
  if (!settings.storeAccount) {
    return next(new NotFoundError('Data toko tidak ditemukan.'));
  }

  return response(res, 200, 'Store account retrieved successfully', settings.storeAccount);
};

export const updateStoreAccount = (req, res, next) => {
  const {
    storeName,
    storeCategory,
    storeAddress,
    storeDescription,
  } = req.body;

  if (!storeName || !storeCategory || !storeAddress || !storeDescription) {
    return next(new InvariantError('Input yang anda masukkan tidak valid.'));
  }

  settings.storeAccount = {
    ...settings.storeAccount,
    storeName,
    storeCategory,
    storeAddress,
    storeDescription,
  };

  return response(res, 200, 'Store account updated successfully', settings.storeAccount);
};

export const updatePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new InvariantError('Input yang anda masukkan tidak valid.'));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new InvariantError('Password baru dan konfirmasi password tidak sama.'));
  }

  if (currentPassword !== settings.password) {
    return next(new AuthorizationError('Password saat ini salah.'));
  }

  settings.password = newPassword;

  return response(res, 200, 'Password berhasil diubah!', null);
};
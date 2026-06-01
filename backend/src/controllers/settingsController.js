import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import response from '../utils/response.js';
import {
  AuthorizationError,
  NotFoundError,
  InvariantError,
} from '../exceptions/index.js';
import * as settingsRepository from '../repositories/settingsRepository.js';
import * as userRepository from '../repositories/userRepository.js';

const mapProfileResponse = (settings) => ({
  id: settings.id,
  ownerName: settings.owner_name,
  email: settings.email,
  phoneNumber: settings.phone_number,
  profileImage: settings.profile_image,
});

const mapStoreAccountResponse = (settings) => ({
  id: settings.id,
  storeName: settings.store_name,
  storeCategory: settings.store_category,
  storeAddress: settings.store_address,
  storeDescription: settings.store_description,
});

const createDefaultSettings = async (user) => {
  return settingsRepository.addDefaultSettings({
    id: nanoid(),
    userId: user.id,
    ownerName: user.store_name || 'Pemilik Toko',
    email: user.email,
    phoneNumber: '',
    profileImage: '',
    storeName: user.store_name || 'Toko Saya',
    storeCategory: '',
    storeAddress: '',
    storeDescription: '',
  });
};

const getOrCreateSettings = async (userId) => {
  const existingSettings = await settingsRepository.getSettingsByUserId(userId);

  if (existingSettings) {
    return existingSettings;
  }

  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new NotFoundError('Akun tidak ditemukan.');
  }

  return createDefaultSettings(user);
};

export const getProfile = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings(req.user.id);

    return response(
      res,
      200,
      'Profile retrieved successfully',
      mapProfileResponse(settings),
    );
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    await getOrCreateSettings(req.user.id);

    const {
      ownerName,
      email,
      phoneNumber,
      profileImage,
    } = req.body;

    const updatedSettings = await settingsRepository.updateProfileByUserId({
      userId: req.user.id,
      ownerName,
      email,
      phoneNumber,
      profileImage,
    });

    return response(
      res,
      200,
      'Profile updated successfully',
      mapProfileResponse(updatedSettings),
    );
  } catch (error) {
    return next(error);
  }
};

export const getStoreAccount = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings(req.user.id);

    return response(
      res,
      200,
      'Store account retrieved successfully',
      mapStoreAccountResponse(settings),
    );
  } catch (error) {
    return next(error);
  }
};

export const updateStoreAccount = async (req, res, next) => {
  try {
    await getOrCreateSettings(req.user.id);

    const {
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    } = req.body;

    await settingsRepository.updateStoreAccountByUserId({
      userId: req.user.id,
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    });

    await userRepository.updateUserStoreNameById({
      userId: req.user.id,
      storeName,
    });

    const latestSettings = await settingsRepository.getSettingsByUserId(
      req.user.id,
    );

    return response(
      res,
      200,
      'Store account updated successfully',
      mapStoreAccountResponse(latestSettings),
    );
  } catch (error) {
    return next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await userRepository.getUserById(req.user.id);

    if (!user) {
      return next(new NotFoundError('Akun tidak ditemukan.'));
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      return next(new AuthorizationError('Password saat ini salah.'));
    }

    if (currentPassword === newPassword) {
      return next(
        new InvariantError('Password baru tidak boleh sama dengan password lama.'),
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updateUserPasswordById({
      id: req.user.id,
      password: hashedPassword,
    });

    return response(res, 200, 'Password berhasil diubah!', null);
  } catch (error) {
    return next(error);
  }
};
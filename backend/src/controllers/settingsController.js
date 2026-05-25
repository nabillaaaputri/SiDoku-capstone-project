import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import response from '../utils/response.js';
import {
  AuthorizationError,
  NotFoundError,
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
    ownerName: 'Pirak',
    email: user.email,
    phoneNumber: '+62 812 3456 7890',
    profileImage: 'https://example.com/profile.png',
    storeName: user.storeName || user.store_name || 'Peara Store',
    storeCategory: 'Grosir',
    storeAddress: 'Jl. Danau Cikur 17, No. 15',
    storeDescription: 'Toko online yang menjual berbagai produk berkualitas dan original.',
  });
};

const getOrCreateSettings = async (user) => {
  const existingSettings = await settingsRepository.getSettingsByUserId(user.id);

  if (existingSettings) {
    return existingSettings;
  }

  return createDefaultSettings(user);
};

export const getProfile = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings(req.user);

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
    await getOrCreateSettings(req.user);

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
    const settings = await getOrCreateSettings(req.user);

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
    await getOrCreateSettings(req.user);

    const {
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    } = req.body;

    const updatedSettings = await settingsRepository.updateStoreAccountByUserId({
      userId: req.user.id,
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    });

    return response(
      res,
      200,
      'Store account updated successfully',
      mapStoreAccountResponse(updatedSettings),
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
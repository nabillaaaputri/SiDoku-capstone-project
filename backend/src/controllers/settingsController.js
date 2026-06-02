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

    console.log(`[GET store-account] ${new Date().toISOString()}`);
    console.log('[GET store-account] user:', req.user.id);
    console.log('[GET store-account] result:', {
      storeName: settings.store_name,
      storeCategory: settings.store_category,
      storeAddress: settings.store_address,
      storeDescription: settings.store_description,
      updatedAt: settings.updated_at,
    });

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

    console.log(`[PUT store-account] ${new Date().toISOString()}`);
    console.log('[PUT store-account] user:', req.user.id);
    console.log('[PUT store-account] body:', {
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    });

    const updatedSettings = await settingsRepository.updateStoreAccountByUserId({
      userId: req.user.id,
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    });

    if (!updatedSettings) {
      return next(new NotFoundError('Data pengaturan toko tidak ditemukan.'));
    }

    await userRepository.updateUserStoreNameById({
      userId: req.user.id,
      storeName,
    });

    const latestSettings = await settingsRepository.getSettingsByUserId(
      req.user.id,
    );

    console.log('[PUT store-account] latest settings:', {
      storeName: latestSettings.store_name,
      storeCategory: latestSettings.store_category,
      storeAddress: latestSettings.store_address,
      storeDescription: latestSettings.store_description,
      updatedAt: latestSettings.updated_at,
    });

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

export const getStoreAccountDebug = async (req, res, next) => {
  try {
    const debugData = await settingsRepository.getStoreAccountDebugByUserId(
      req.user.id,
    );

    if (!debugData) {
      return next(new NotFoundError('Data akun tidak ditemukan.'));
    }

    console.log(`[GET store-account/debug] ${new Date().toISOString()}`);
    console.log('[GET store-account/debug] result:', debugData);

    return response(
      res,
      200,
      'Store account debug retrieved successfully',
      {
        userId: debugData.user_id,
        email: debugData.email,
        usersTable: {
          storeName: debugData.users_store_name,
          updatedAt: debugData.users_updated_at,
        },
        userSettingsTable: {
          id: debugData.settings_id,
          storeName: debugData.user_settings_store_name,
          storeCategory: debugData.store_category,
          storeAddress: debugData.store_address,
          storeDescription: debugData.store_description,
          updatedAt: debugData.user_settings_updated_at,
        },
      },
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

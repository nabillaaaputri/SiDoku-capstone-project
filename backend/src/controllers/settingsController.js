import settings from '../data/settings.js';

export const getProfile = (req, res) => {
  try {
    if (!settings.profile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Data profil tidak ditemukan.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: settings.profile,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const updateProfile = (req, res) => {
  try {
    const { ownerName, email, phoneNumber, profileImage } = req.body;

    if (!ownerName || !email || !phoneNumber || !profileImage) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input yang anda masukkan tidak valid.',
      });
    }

    settings.profile = {
      ...settings.profile,
      ownerName,
      email,
      phoneNumber,
      profileImage,
    };

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: settings.profile,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStoreAccount = (req, res) => {
  try {
    if (!settings.storeAccount) {
      return res.status(404).json({
        status: 'fail',
        message: 'Data toko tidak ditemukan.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Store account retrieved successfully',
      data: settings.storeAccount,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const updateStoreAccount = (req, res) => {
  try {
    const { storeName, storeCategory, storeAddress, storeDescription } =
      req.body;

    if (!storeName || !storeCategory || !storeAddress || !storeDescription) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input yang anda masukkan tidak valid.',
      });
    }

    settings.storeAccount = {
      ...settings.storeAccount,
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    };

    return res.status(200).json({
      status: 'success',
      message: 'Store account updated successfully',
      data: settings.storeAccount,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const updatePassword = (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input yang anda masukkan tidak valid.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password baru dan konfirmasi password tidak sama.',
      });
    }

    if (currentPassword !== settings.password) {
      return res.status(403).json({
        status: 'fail',
        message: 'Password saat ini salah.',
      });
    }

    settings.password = newPassword;

    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah!',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

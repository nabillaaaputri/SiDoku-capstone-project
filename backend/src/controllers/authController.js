import users from '../data/users.js';
import { nanoid } from 'nanoid';

export const register = (req, res) => {
  try {
    const { storeName, email, password, confirmPassword } = req.body;

    if (!storeName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input yang anda masukkan tidak valid.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password dan konfirmasi password tidak sama.',
      });
    }

    const isEmailExist = users.find((user) => user.email === email);

    if (isEmailExist) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email sudah terdaftar.',
      });
    }

    const id = nanoid();

    const newUser = {
      id,
      storeName,
      email,
      password,
    };

    users.push(newUser);

    return res.status(201).json({
      status: 'success',
      message: 'Register success',
      data: {
        id: newUser.id,
        storeName: newUser.storeName,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const getAllUsers = (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Get all users',
    data: users,
  });
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input yang anda masukkan tidak valid.',
      });
    }

    const user = users.find((item) => item.email === email);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Akun tidak ditemukan.',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email atau password salah.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Login success',
      data: {
        accessToken: 'dummy_jwt_token_here',
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

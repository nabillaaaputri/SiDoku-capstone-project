import { nanoid } from 'nanoid';
import users from '../data/users.js';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
  AuthenticationError,
  ConflictError,
} from '../exceptions/index.js';

export const register = (req, res, next) => {
  const {
    storeName,
    email,
    password,
    confirmPassword,
  } = req.body;

  if (!storeName || !email || !password || !confirmPassword) {
    return next(new InvariantError('Input yang anda masukkan tidak valid.'));
  }

  if (password !== confirmPassword) {
    return next(new InvariantError('Password dan konfirmasi password tidak sama.'));
  }

  const isEmailExist = users.find((user) => user.email === email);

  if (isEmailExist) {
    return next(new ConflictError('Email sudah terdaftar.'));
  }

  const id = nanoid();

  const newUser = {
    id,
    storeName,
    email,
    password,
  };

  users.push(newUser);

  return response(res, 201, 'Register success', {
    id: newUser.id,
    storeName: newUser.storeName,
    email: newUser.email,
  });
};

export const getAllUsers = (req, res) => {
  return response(res, 200, 'Get all users', users);
};

export const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new InvariantError('Input yang anda masukkan tidak valid.'));
  }

  const user = users.find((item) => item.email === email);

  if (!user) {
    return next(new NotFoundError('Akun tidak ditemukan.'));
  }

  if (user.password !== password) {
    return next(new AuthenticationError('Email atau password salah.'));
  }

  return response(res, 200, 'Login success', {
    accessToken: 'dummy_jwt_token_here',
  });
};

export const logout = (req, res) => {
  return response(res, 200, 'Logout successful', null);
};
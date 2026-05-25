import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import response from '../utils/response.js';
import {
  NotFoundError,
  AuthenticationError,
  ConflictError,
} from '../exceptions/index.js';
import * as userRepository from '../repositories/userRepository.js';
import * as authenticationRepository from '../repositories/authenticationRepository.js';

const mapUserResponse = (user) => ({
  id: user.id,
  storeName: user.store_name,
  email: user.email,
});

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    },
  );
};

export const register = async (req, res, next) => {
  try {
    const {
      storeName,
      email,
      password,
    } = req.body;

    const isEmailExist = await userRepository.getUserByEmail(email);

    if (isEmailExist) {
      return next(new ConflictError('Email sudah terdaftar.'));
    }

    const id = nanoid();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.addUser({
      id,
      storeName,
      email,
      password: hashedPassword,
    });

    return response(res, 201, 'Register success', mapUserResponse(newUser));
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userRepository.getAllUsers();

    const mappedUsers = users.map(mapUserResponse);

    return response(res, 200, 'Get all users', mappedUsers);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      return next(new NotFoundError('Akun tidak ditemukan.'));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return next(new AuthenticationError('Email atau password salah.'));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await authenticationRepository.addRefreshToken(refreshToken);

    return response(res, 200, 'Login success', {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await authenticationRepository.verifyRefreshToken(refreshToken);

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    return response(res, 200, 'Access token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await authenticationRepository.deleteRefreshToken(refreshToken);

    return response(res, 200, 'Logout successful', null);
  } catch (error) {
    return next(error);
  }
};
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../exceptions/index.js';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AuthenticationError('Token tidak ditemukan.'));
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AuthenticationError('Format token tidak valid.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    return next(new AuthenticationError('Token tidak valid.'));
  }
};

export default authenticateToken;
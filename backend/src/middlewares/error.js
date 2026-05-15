import response from '../utils/response.js';
import { ClientError } from '../exceptions/index.js';

const ErrorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return response(res, err.statusCode, err.message, null);
  }

  console.error('Unhandled error:', err);

  return response(res, 500, 'Terjadi kesalahan pada server.', null);
};

export default ErrorHandler;
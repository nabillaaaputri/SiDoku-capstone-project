import { InvariantError } from '../exceptions/index.js';

const validatePayload = (schema, message = 'Input tidak valid.') => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    return next(new InvariantError(message));
  }

  return next();
};

export default validatePayload;
import { InvariantError } from '../exceptions/index.js';

const validateQuery = (schema, message = 'Query tidak valid.') => (req, res, next) => {
  const { error } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) return next(new InvariantError(message));

  return next();
};

export default validateQuery;
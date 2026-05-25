import { query } from '../config/database.js';
import { InvariantError } from '../exceptions/index.js';

export const addRefreshToken = async (token) => {
  await query(
    'INSERT INTO authentications (token) VALUES ($1)',
    [token],
  );
};

export const verifyRefreshToken = async (token) => {
  const result = await query(
    'SELECT token FROM authentications WHERE token = $1',
    [token],
  );

  if (result.rows.length === 0) {
    throw new InvariantError('Refresh token tidak valid.');
  }
};

export const deleteRefreshToken = async (token) => {
  await verifyRefreshToken(token);

  await query(
    'DELETE FROM authentications WHERE token = $1',
    [token],
  );
};
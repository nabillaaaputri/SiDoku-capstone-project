import { query } from '../config/database.js';

export const getAllUsers = async () => {
  const result = await query(
    `SELECT id, store_name, email, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`,
  );

  return result.rows;
};

export const getUserById = async (id) => {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [id],
  );

  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email],
  );

  return result.rows[0];
};

export const addUser = async ({
  id,
  storeName,
  email,
  password,
}) => {
  const result = await query(
    `INSERT INTO users (
      id,
      store_name,
      email,
      password
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, store_name, email, created_at, updated_at`,
    [
      id,
      storeName,
      email,
      password,
    ],
  );

  return result.rows[0];
};

export const updateUserPasswordById = async ({
  id,
  password,
}) => {
  const result = await query(
    `UPDATE users
     SET
      password = $1,
      updated_at = NOW()
     WHERE id = $2
     RETURNING id, store_name, email, created_at, updated_at`,
    [
      password,
      id,
    ],
  );

  return result.rows[0];
};

export const updateUserStoreNameById = async ({
  userId,
  storeName,
}) => {
  const result = await query(
    `UPDATE users
     SET
      store_name = $1,
      updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [
      storeName,
      userId,
    ],
  );

  return result.rows[0];
};
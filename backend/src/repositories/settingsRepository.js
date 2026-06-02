import { query } from '../config/database.js';

export const getSettingsByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM user_settings WHERE user_id = $1',
    [userId],
  );

  return result.rows[0];
};

export const getStoreAccountDebugByUserId = async (userId) => {
  const result = await query(
    `SELECT
      u.id AS user_id,
      u.email,
      u.store_name AS users_store_name,
      u.updated_at AS users_updated_at,
      us.id AS settings_id,
      us.store_name AS user_settings_store_name,
      us.store_category,
      us.store_address,
      us.store_description,
      us.updated_at AS user_settings_updated_at
    FROM users u
    LEFT JOIN user_settings us ON us.user_id = u.id
    WHERE u.id = $1`,
    [userId],
  );

  return result.rows[0];
};

export const addDefaultSettings = async ({
  id,
  userId,
  ownerName,
  email,
  phoneNumber,
  profileImage,
  storeName,
  storeCategory,
  storeAddress,
  storeDescription,
}) => {
  const result = await query(
    `INSERT INTO user_settings (
      id,
      user_id,
      owner_name,
      email,
      phone_number,
      profile_image,
      store_name,
      store_category,
      store_address,
      store_description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      id,
      userId,
      ownerName,
      email,
      phoneNumber,
      profileImage,
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
    ],
  );

  return result.rows[0];
};

export const updateProfileByUserId = async ({
  userId,
  ownerName,
  email,
  phoneNumber,
  profileImage,
}) => {
  const result = await query(
    `UPDATE user_settings
     SET
      owner_name = $1,
      email = $2,
      phone_number = $3,
      profile_image = $4,
      updated_at = NOW()
     WHERE user_id = $5
     RETURNING *`,
    [
      ownerName,
      email,
      phoneNumber,
      profileImage,
      userId,
    ],
  );

  return result.rows[0];
};

export const updateStoreAccountByUserId = async ({
  userId,
  storeName,
  storeCategory,
  storeAddress,
  storeDescription,
}) => {
  const result = await query(
    `UPDATE user_settings
     SET
      store_name = $1,
      store_category = $2,
      store_address = $3,
      store_description = $4,
      updated_at = NOW()
     WHERE user_id = $5
     RETURNING *`,
    [
      storeName,
      storeCategory,
      storeAddress,
      storeDescription,
      userId,
    ],
  );

  return result.rows[0];
};
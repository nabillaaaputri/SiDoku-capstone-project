import { query } from '../config/database.js';

export const getAllProducts = async ({ status, category, userId }) => {
  let queryText = 'SELECT * FROM products';
  const values = [];
  const conditions = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (status === 'active') {
    conditions.push('is_archived = false');
  }

  if (status === 'archived') {
    conditions.push('is_archived = true');
  }

  if (category) {
    values.push(category);
    conditions.push(`LOWER(category) = LOWER($${values.length})`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, values);
  return result.rows;
};

export const getProductById = async (id, userId = null) => {
  let queryText = 'SELECT * FROM products WHERE id = $1';
  const values = [id];

  if (userId) {
    values.push(userId);
    queryText += ` AND user_id = $${values.length}`;
  }

  const result = await query(queryText, values);

  return result.rows[0];
};

export const getProductByName = async (productName, userId = null) => {
  let queryText = 'SELECT * FROM products WHERE LOWER(product_name) = LOWER($1)';
  const values = [productName];

  if (userId) {
    values.push(userId);
    queryText += ` AND user_id = $${values.length}`;
  }

  const result = await query(queryText, values);

  return result.rows[0];
};

export const addProduct = async ({
  id,
  userId,
  productName,
  category,
  unit,
  purchasePrice,
  sellingPrice,
  margin,
  stock,
  minimumStock,
  stockStatus,
}) => {
  const result = await query(
    `INSERT INTO products (
      id,
      user_id,
      product_name,
      category,
      unit,
      purchase_price,
      selling_price,
      margin,
      stock,
      minimum_stock,
      stock_status,
      is_archived
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)
    RETURNING *`,
    [
      id,
      userId,
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      margin,
      stock,
      minimumStock,
      stockStatus,
    ],
  );

  return result.rows[0];
};

export const updateProductById = async ({
  id,
  userId,
  productName,
  category,
  unit,
  purchasePrice,
  sellingPrice,
  margin,
  stock,
  minimumStock,
  stockStatus,
}) => {
  const result = await query(
    `UPDATE products
     SET
      product_name = $1,
      category = $2,
      unit = $3,
      purchase_price = $4,
      selling_price = $5,
      margin = $6,
      stock = $7,
      minimum_stock = $8,
      stock_status = $9,
      updated_at = NOW()
     WHERE id = $10 AND user_id = $11
     RETURNING *`,
    [
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      margin,
      stock,
      minimumStock,
      stockStatus,
      id,
      userId,
    ],
  );

  return result.rows[0];
};

export const archiveProductById = async (id, userId) => {
  const result = await query(
    `UPDATE products
     SET is_archived = true, updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId],
  );

  return result.rows[0];
};

export const restoreProductById = async (id, userId) => {
  const result = await query(
    `UPDATE products
     SET is_archived = false, updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId],
  );

  return result.rows[0];
};

export const updateProductStockById = async ({
  id,
  userId = null,
  stock,
  stockStatus,
}) => {
  let queryText = `
    UPDATE products
    SET
      stock = $1,
      stock_status = $2,
      updated_at = NOW()
    WHERE id = $3
  `;

  const values = [stock, stockStatus, id];

  if (userId) {
    values.push(userId);
    queryText += ` AND user_id = $${values.length}`;
  }

  queryText += ' RETURNING *';

  const result = await query(queryText, values);

  return result.rows[0];
};
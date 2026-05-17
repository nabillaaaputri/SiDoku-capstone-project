import { query } from '../config/database.js';

export const getAllProducts = async ({ status, category }) => {
  let queryText = 'SELECT * FROM products';
  const values = [];
  const conditions = [];

  if (status === 'active') {
    conditions.push('is_archived = false');
  }

  if (status === 'archived') {
    conditions.push('is_archived = true');
  }

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, values);
  return result.rows;
};

export const getProductById = async (id) => {
  const result = await query(
    'SELECT * FROM products WHERE id = $1',
    [id],
  );

  return result.rows[0];
};

export const getProductByName = async (productName) => {
  const result = await query(
    'SELECT * FROM products WHERE LOWER(product_name) = LOWER($1)',
    [productName],
  );

  return result.rows[0];
};

export const addProduct = async ({
  id,
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
    RETURNING *`,
    [
      id,
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
     WHERE id = $10
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
    ],
  );

  return result.rows[0];
};

export const archiveProductById = async (id) => {
  const result = await query(
    `UPDATE products
     SET is_archived = true, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id],
  );

  return result.rows[0];
};

export const restoreProductById = async (id) => {
  const result = await query(
    `UPDATE products
     SET is_archived = false, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id],
  );

  return result.rows[0];
};

export const updateProductStockById = async ({ id, stock, stockStatus }) => {
  const result = await query(
    `UPDATE products
     SET
      stock = $1,
      stock_status = $2,
      updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [stock, stockStatus, id],
  );

  return result.rows[0];
};
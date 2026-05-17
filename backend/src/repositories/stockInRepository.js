import { query } from '../config/database.js';

export const getAllStockIns = async ({ startDate, endDate, productId }) => {
  let queryText = 'SELECT * FROM stock_ins';
  const values = [];
  const conditions = [];

  if (startDate && endDate) {
    values.push(startDate, endDate);
    conditions.push(`date BETWEEN $${values.length - 1} AND $${values.length}`);
  }

  if (productId) {
    values.push(productId);
    conditions.push(`product_id = $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY date DESC, created_at DESC';

  const result = await query(queryText, values);
  return result.rows;
};

export const addStockIn = async ({
  id,
  productId,
  productName,
  quantity,
  unit,
  date,
  note,
  currentStock,
}) => {
  const result = await query(
    `INSERT INTO stock_ins (
      id,
      product_id,
      product_name,
      quantity,
      unit,
      date,
      note,
      current_stock
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      id,
      productId,
      productName,
      quantity,
      unit,
      date,
      note,
      currentStock,
    ],
  );

  return result.rows[0];
};

export const deleteStockInById = async (id) => {
  const result = await query(
    `DELETE FROM stock_ins
     WHERE id = $1
     RETURNING *`,
    [id],
  );

  return result.rows[0];
};
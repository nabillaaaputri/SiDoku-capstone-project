import { query } from '../config/database.js';

export const getAllExpenses = async ({ category, date }) => {
  let queryText = 'SELECT * FROM expenses';
  const values = [];
  const conditions = [];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (date) {
    values.push(date);
    conditions.push(`date = $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY date DESC, created_at DESC';

  const result = await query(queryText, values);
  return result.rows;
};

export const addExpense = async ({
  id,
  expenseName,
  category,
  categoryLabel,
  amount,
  date,
  description,
}) => {
  const result = await query(
    `INSERT INTO expenses (
      id,
      expense_name,
      category,
      category_label,
      amount,
      date,
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      id,
      expenseName,
      category,
      categoryLabel,
      amount,
      date,
      description,
    ],
  );

  return result.rows[0];
};

export const deleteExpenseById = async (id) => {
  const result = await query(
    `DELETE FROM expenses
     WHERE id = $1
     RETURNING *`,
    [id],
  );

  return result.rows[0];
};
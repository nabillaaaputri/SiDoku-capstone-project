import { query } from '../config/database.js';

export const getAiProductPayloadById = async ({
  userId,
  productId,
  historyDays = 60,
}) => {
  const productResult = await query(
    `SELECT
      id,
      product_name,
      stock,
      selling_price
     FROM products
     WHERE id = $1
       AND user_id = $2
       AND is_archived = false`,
    [productId, userId],
  );

  const product = productResult.rows[0];

  if (!product) {
    return null;
  }

  const stockOutResult = await query(
    `SELECT
      TO_CHAR(date, 'YYYY-MM-DD') AS tanggal_keluar,
      quantity AS jumlah
     FROM stock_outs
     WHERE product_id = $1
       AND user_id = $2
       AND date >= CURRENT_DATE - ($3::int * INTERVAL '1 day')
     ORDER BY date ASC`,
    [productId, userId, historyDays],
  );

  const stockInResult = await query(
    `SELECT
      TO_CHAR(date, 'YYYY-MM-DD') AS tanggal_masuk,
      quantity AS jumlah
     FROM stock_ins
     WHERE product_id = $1
       AND user_id = $2
       AND date >= CURRENT_DATE - ($3::int * INTERVAL '1 day')
     ORDER BY date ASC`,
    [productId, userId, historyDays],
  );

  return {
    productId: product.id,
    product_name: product.product_name,
    stok: Number(product.stock),
    harga_jual: Number(product.selling_price),
    stok_keluar: stockOutResult.rows.map((row) => ({
      tanggal_keluar: row.tanggal_keluar,
      jumlah: Number(row.jumlah),
    })),
    stok_masuk: stockInResult.rows.map((row) => ({
      tanggal_masuk: row.tanggal_masuk,
      jumlah: Number(row.jumlah),
    })),
  };
};

export const getAllAiProductsPayload = async ({
  userId,
  historyDays = 60,
}) => {
  const productResult = await query(
    `SELECT
      id
     FROM products
     WHERE user_id = $1
       AND is_archived = false
     ORDER BY created_at DESC`,
    [userId],
  );

  const products = [];

  for (const product of productResult.rows) {
    const payload = await getAiProductPayloadById({
      userId,
      productId: product.id,
      historyDays,
    });

    if (payload) {
      products.push(payload);
    }
  }

  return products;
};

export const getTodaySalesSummary = async (userId) => {
  const result = await query(
    `SELECT
      COALESCE(SUM(so.quantity), 0) AS total_sold,
      COALESCE(SUM(so.quantity * p.selling_price), 0) AS total_income
     FROM stock_outs so
     JOIN products p ON so.product_id = p.id
     WHERE so.user_id = $1
       AND so.date = CURRENT_DATE`,
    [userId],
  );

  return {
    totalSold: Number(result.rows[0].total_sold),
    totalIncome: Number(result.rows[0].total_income),
  };
};

export const getMonthlyExpenseSummary = async (userId) => {
  const result = await query(
    `SELECT
      COALESCE(SUM(amount), 0) AS total_expense
     FROM expenses
     WHERE user_id = $1
       AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
    [userId],
  );

  return {
    totalExpense: Number(result.rows[0].total_expense),
  };
};

export const getMonthlyProfitLossSummary = async (userId) => {
  const incomeResult = await query(
    `SELECT
      COALESCE(SUM(so.quantity * p.selling_price), 0) AS total_income,
      COALESCE(SUM(so.quantity * p.purchase_price), 0) AS total_hpp
     FROM stock_outs so
     JOIN products p ON so.product_id = p.id
     WHERE so.user_id = $1
       AND DATE_TRUNC('month', so.date) = DATE_TRUNC('month', CURRENT_DATE)`,
    [userId],
  );

  const expenseResult = await query(
    `SELECT
      COALESCE(SUM(amount), 0) AS total_expense
     FROM expenses
     WHERE user_id = $1
       AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
    [userId],
  );

  const totalIncome = Number(incomeResult.rows[0].total_income);
  const totalHpp = Number(incomeResult.rows[0].total_hpp);
  const totalExpense = Number(expenseResult.rows[0].total_expense);
  const estimatedProfit = totalIncome - totalHpp - totalExpense;

  return {
    totalIncome,
    totalHpp,
    totalExpense,
    estimatedProfit,
  };
};

export const getInventorySummary = async (userId) => {
  const result = await query(
    `SELECT
      id,
      product_name AS "productName",
      category,
      unit,
      stock,
      minimum_stock AS "minimumStock",
      stock_status AS "stockStatus"
     FROM products
     WHERE user_id = $1
       AND is_archived = false
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
};
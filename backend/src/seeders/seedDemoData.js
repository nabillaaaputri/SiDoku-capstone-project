import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { query } from '../config/database.js';

const DEMO_USER = {
  id: 'demo-ai-user',
  storeName: 'Warung Sembako Barokah',
  email: 'demo.ai.sidoku@example.com',
  password: '12345',
};

const PRODUCTS = [
  {
    id: 'demo-product-beras-5kg',
    productName: 'Beras Ramos 5kg',
    category: 'Sembako',
    unit: 'karung',
    purchasePrice: 65000,
    sellingPrice: 72000,
    initialStock: 55,
    minimumStock: 10,
  },
  {
    id: 'demo-product-minyak-1l',
    productName: 'Minyak Goreng 1L',
    category: 'Sembako',
    unit: 'botol',
    purchasePrice: 15500,
    sellingPrice: 18000,
    initialStock: 95,
    minimumStock: 18,
  },
  {
    id: 'demo-product-mie-instan',
    productName: 'Mie Instan Goreng',
    category: 'Makanan Instan',
    unit: 'pcs',
    purchasePrice: 2800,
    sellingPrice: 3500,
    initialStock: 260,
    minimumStock: 45,
  },
  {
    id: 'demo-product-gula-1kg',
    productName: 'Gula Pasir 1kg',
    category: 'Sembako',
    unit: 'pack',
    purchasePrice: 15000,
    sellingPrice: 17000,
    initialStock: 75,
    minimumStock: 15,
  },
  {
    id: 'demo-product-air-mineral',
    productName: 'Air Mineral 600ml',
    category: 'Minuman',
    unit: 'botol',
    purchasePrice: 2500,
    sellingPrice: 3500,
    initialStock: 190,
    minimumStock: 35,
  },
  {
    id: 'demo-product-telur-ayam',
    productName: 'Telur Ayam 1kg',
    category: 'Sembako',
    unit: 'kg',
    purchasePrice: 26000,
    sellingPrice: 30000,
    initialStock: 45,
    minimumStock: 8,
  },
];

const RESTOCK_EXPENSE = {
  expenseName: 'Belanja stok sembako',
  category: 'restock',
  categoryLabel: 'Restock',
  amount: 320000,
  description: 'Pembelian stok sembako dari supplier.',
};

const DAILY_EXPENSES = [
  {
    expenseName: 'Biaya transport belanja',
    category: 'operational',
    categoryLabel: 'Operasional',
    amount: 30000,
    description: 'Biaya transport untuk mengambil barang dagangan.',
  },
  {
    expenseName: 'Biaya operasional harian',
    category: 'operational',
    categoryLabel: 'Operasional',
    amount: 25000,
    description: 'Biaya operasional harian warung.',
  },
  {
    expenseName: 'Perlengkapan warung',
    category: 'others',
    categoryLabel: 'Lainnya',
    amount: 15000,
    description: 'Pembelian plastik, nota, dan perlengkapan kecil lainnya.',
  },
  {
    expenseName: 'Biaya kebersihan dan kemasan',
    category: 'others',
    categoryLabel: 'Lainnya',
    amount: 18000,
    description: 'Biaya kebutuhan kebersihan dan kemasan sederhana.',
  },
];

const formatDate = (date) => date.toISOString().slice(0, 10);

const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
};

const getStockStatus = (stock, minimumStock) => {
  if (stock <= minimumStock) return 'low';
  return 'safe';
};

const getMargin = (purchasePrice, sellingPrice) => {
  const numericPurchasePrice = Number(purchasePrice);
  const numericSellingPrice = Number(sellingPrice);

  if (numericSellingPrice === 0) {
    return 0;
  }

  return Number(
    (((numericSellingPrice - numericPurchasePrice) / numericSellingPrice) * 100)
      .toFixed(2),
  );
};

const getDailySoldQuantity = (productIndex, dayIndex) => {
  const baseSales = [2, 5, 14, 4, 10, 3][productIndex] || 4;

  const weeklyPattern = dayIndex % 7;
  const isWeekend = weeklyPattern === 5 || weeklyPattern === 6;

  const weekendBonus = isWeekend
    ? ([1, 3, 6, 2, 4, 1][productIndex] || 2)
    : 0;

  const dayOfMonth = dayIndex % 30;
  const isMonthlyShoppingPeriod = dayOfMonth >= 24 || dayOfMonth <= 3;

  const monthlyShoppingBonus = isMonthlyShoppingPeriod
    ? ([1, 2, 4, 2, 3, 1][productIndex] || 1)
    : 0;

  const trend = Math.floor(dayIndex / 20);
  const variation = (dayIndex + productIndex) % 3;

  return baseSales + weekendBonus + monthlyShoppingBonus + trend + variation;
};

const getWeeklyRestockQuantity = (productIndex) => {
  const restockQuantities = [22, 40, 110, 30, 85, 18];

  return restockQuantities[productIndex] || 30;
};

const getDailyExpense = (dayIndex) => {
  const isWeeklyRestockDay = dayIndex % 7 === 0;

  if (isWeeklyRestockDay) {
    return RESTOCK_EXPENSE;
  }

  return DAILY_EXPENSES[dayIndex % DAILY_EXPENSES.length];
};

const getDailyExpenseAmount = (expense, dayIndex) => {
  const weeklyPattern = dayIndex % 7;
  const isWeekend = weeklyPattern === 5 || weeklyPattern === 6;
  const weekendOperationalBonus = isWeekend ? 15000 : 0;

  const dayOfMonth = dayIndex % 30;
  const isMajorRestockPeriod = dayOfMonth === 0 || dayOfMonth === 15;

  const restockBonus = expense.category === 'restock' && isMajorRestockPeriod
    ? 120000
    : 0;

  const variation = (dayIndex % 5) * 5000;

  return expense.amount + weekendOperationalBonus + restockBonus + variation;
};

const clearDemoData = async () => {
  const productIds = PRODUCTS.map((product) => product.id);

  await query(
    'DELETE FROM stock_outs WHERE user_id = $1 OR product_id = ANY($2)',
    [DEMO_USER.id, productIds],
  );

  await query(
    'DELETE FROM stock_ins WHERE user_id = $1 OR product_id = ANY($2)',
    [DEMO_USER.id, productIds],
  );

  await query(
    'DELETE FROM expenses WHERE user_id = $1',
    [DEMO_USER.id],
  );

  await query(
    'DELETE FROM products WHERE user_id = $1 OR id = ANY($2)',
    [DEMO_USER.id, productIds],
  );

  await query(
    'DELETE FROM user_settings WHERE user_id = $1',
    [DEMO_USER.id],
  );

  await query(
    'DELETE FROM users WHERE id = $1 OR LOWER(email) = LOWER($2)',
    [DEMO_USER.id, DEMO_USER.email],
  );
};

const seedUser = async () => {
  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

  await query(
    `INSERT INTO users (
      id,
      store_name,
      email,
      password
    )
    VALUES ($1, $2, $3, $4)`,
    [
      DEMO_USER.id,
      DEMO_USER.storeName,
      DEMO_USER.email,
      hashedPassword,
    ],
  );

  await query(
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      randomUUID(),
      DEMO_USER.id,
      'Admin Warung',
      DEMO_USER.email,
      '+62 812 0000 2026',
      'https://example.com/demo-profile.png',
      DEMO_USER.storeName,
      'Warung Retail Mikro',
      'Jl. Pasar Harian No. 26',
      'Akun demo warung retail mikro untuk menampilkan data historis stok, penjualan, pengeluaran, dan insight AI SiDoku.',
    ],
  );
};

const seedProducts = async () => {
  for (const product of PRODUCTS) {
    const margin = getMargin(product.purchasePrice, product.sellingPrice);
    const stockStatus = getStockStatus(product.initialStock, product.minimumStock);

    await query(
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)`,
      [
        product.id,
        DEMO_USER.id,
        product.productName,
        product.category,
        product.unit,
        product.purchasePrice,
        product.sellingPrice,
        margin,
        product.initialStock,
        product.minimumStock,
        stockStatus,
      ],
    );
  }
};

const seedStockMovements = async () => {
  for (const [productIndex, product] of PRODUCTS.entries()) {
    let currentStock = product.initialStock;

    for (let day = 59; day >= 0; day -= 1) {
      const date = getDateDaysAgo(day);
      const dayIndex = 59 - day;

      if (day % 7 === 0) {
        const stockInQuantity = getWeeklyRestockQuantity(productIndex);

        currentStock += stockInQuantity;

        await query(
          `INSERT INTO stock_ins (
            id,
            user_id,
            product_id,
            product_name,
            quantity,
            unit,
            date,
            time,
            note,
            current_stock
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            randomUUID(),
            DEMO_USER.id,
            product.id,
            product.productName,
            stockInQuantity,
            product.unit,
            date,
            '09:00',
            'Restock berkala warung retail untuk data historis AI.',
            currentStock,
          ],
        );
      }

      const soldQuantity = getDailySoldQuantity(productIndex, dayIndex);
      currentStock = Math.max(0, currentStock - soldQuantity);

      await query(
        `INSERT INTO stock_outs (
          id,
          user_id,
          product_id,
          product_name,
          quantity,
          unit,
          date,
          time,
          note,
          current_stock
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          randomUUID(),
          DEMO_USER.id,
          product.id,
          product.productName,
          soldQuantity,
          product.unit,
          date,
          '15:00',
          'Penjualan harian warung retail untuk data historis AI.',
          currentStock,
        ],
      );
    }

    const finalStockStatus = getStockStatus(currentStock, product.minimumStock);

    await query(
      `UPDATE products
       SET
        stock = $1,
        stock_status = $2,
        updated_at = NOW()
       WHERE id = $3
         AND user_id = $4`,
      [
        currentStock,
        finalStockStatus,
        product.id,
        DEMO_USER.id,
      ],
    );
  }
};

const seedExpenses = async () => {
  for (let day = 59; day >= 0; day -= 1) {
    const date = getDateDaysAgo(day);
    const dayIndex = 59 - day;
    const expense = getDailyExpense(dayIndex);
    const amount = getDailyExpenseAmount(expense, dayIndex);

    await query(
      `INSERT INTO expenses (
        id,
        user_id,
        expense_name,
        category,
        category_label,
        amount,
        date,
        time,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        randomUUID(),
        DEMO_USER.id,
        expense.expenseName,
        expense.category,
        expense.categoryLabel,
        amount,
        date,
        '10:00',
        expense.description,
      ],
    );
  }
};

const runSeeder = async () => {
  try {
    console.log('Clearing old demo AI data...');
    await clearDemoData();

    console.log('Creating demo user...');
    await seedUser();

    console.log('Creating demo products...');
    await seedProducts();

    console.log('Creating 60 days stock movements...');
    await seedStockMovements();

    console.log('Creating 60 days daily expenses...');
    await seedExpenses();

    console.log('Seed demo AI data completed.');
    console.log('Demo account:');
    console.log(`Email    : ${DEMO_USER.email}`);
    console.log(`Password : ${DEMO_USER.password}`);
    console.log(`Store    : ${DEMO_USER.storeName}`);
  } catch (error) {
    console.error('Seed demo AI data failed.');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
};

runSeeder();
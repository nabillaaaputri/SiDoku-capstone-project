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
    initialStock: 45,
    minimumStock: 8,
  },
  {
    id: 'demo-product-minyak-1l',
    productName: 'Minyak Goreng 1L',
    category: 'Sembako',
    unit: 'botol',
    purchasePrice: 15500,
    sellingPrice: 18000,
    initialStock: 80,
    minimumStock: 15,
  },
  {
    id: 'demo-product-mie-instan',
    productName: 'Mie Instan Goreng',
    category: 'Makanan Instan',
    unit: 'pcs',
    purchasePrice: 2800,
    sellingPrice: 3500,
    initialStock: 220,
    minimumStock: 40,
  },
  {
    id: 'demo-product-gula-1kg',
    productName: 'Gula Pasir 1kg',
    category: 'Sembako',
    unit: 'pack',
    purchasePrice: 15000,
    sellingPrice: 17000,
    initialStock: 65,
    minimumStock: 12,
  },
  {
    id: 'demo-product-air-mineral',
    productName: 'Air Mineral 600ml',
    category: 'Minuman',
    unit: 'botol',
    purchasePrice: 2500,
    sellingPrice: 3500,
    initialStock: 160,
    minimumStock: 30,
  },
  {
    id: 'demo-product-telur-ayam',
    productName: 'Telur Ayam 1kg',
    category: 'Sembako',
    unit: 'kg',
    purchasePrice: 26000,
    sellingPrice: 30000,
    initialStock: 35,
    minimumStock: 7,
  },
];

const EXPENSES = [
  {
    expenseName: 'Belanja stok sembako',
    category: 'restock',
    categoryLabel: 'Restock',
    amount: 350000,
    description: 'Pembelian stok sembako dari supplier.',
  },
  {
    expenseName: 'Biaya listrik warung',
    category: 'operational',
    categoryLabel: 'Operasional',
    amount: 75000,
    description: 'Biaya operasional listrik warung.',
  },
  {
    expenseName: 'Biaya transport belanja',
    category: 'operational',
    categoryLabel: 'Operasional',
    amount: 30000,
    description: 'Biaya transport untuk mengambil barang dagangan.',
  },
  {
    expenseName: 'Perlengkapan warung',
    category: 'others',
    categoryLabel: 'Lainnya',
    amount: 25000,
    description: 'Pembelian plastik, nota, dan perlengkapan kecil lainnya.',
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

const getMargin = (sellingPrice, purchasePrice) => {
  return sellingPrice - purchasePrice;
};

const getDailySoldQuantity = (productIndex, dayIndex) => {
  const baseSales = [2, 5, 14, 4, 10, 3][productIndex] || 4;
  const weeklyPattern = dayIndex % 7;
  const weekendBonus = weeklyPattern === 5 || weeklyPattern === 6 ? 2 : 0;
  const trend = Math.floor(dayIndex / 15);
  const variation = (dayIndex + productIndex) % 3;

  return baseSales + weekendBonus + trend + variation;
};

const getWeeklyRestockQuantity = (productIndex) => {
  const restockQuantities = [18, 35, 90, 25, 70, 16];

  return restockQuantities[productIndex] || 30;
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
    const margin = getMargin(product.sellingPrice, product.purchasePrice);
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
            note,
            current_stock
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            randomUUID(),
            DEMO_USER.id,
            product.id,
            product.productName,
            stockInQuantity,
            product.unit,
            date,
            'Seed restock mingguan untuk data historis AI warung retail.',
            currentStock,
          ],
        );
      }

      const soldQuantity = getDailySoldQuantity(productIndex, 59 - day);
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
          'Seed penjualan harian untuk data historis AI warung retail.',
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

    if (day % 3 === 0) {
      const expense = EXPENSES[day % EXPENSES.length];

      await query(
        `INSERT INTO expenses (
          id,
          user_id,
          expense_name,
          category,
          category_label,
          amount,
          date,
          description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          randomUUID(),
          DEMO_USER.id,
          expense.expenseName,
          expense.category,
          expense.categoryLabel,
          expense.amount + (day % 5) * 10000,
          date,
          expense.description,
        ],
      );
    }
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

    console.log('Creating demo expenses...');
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
import { nanoid } from 'nanoid';
import stockIns from '../data/stockIns.js';
import products from '../data/product.js';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
} from '../exceptions/index.js';

export const getStockIns = (req, res) => {
  const { startDate, endDate, productId } = req.query;

  let filteredStockIns = stockIns;

  if (productId) {
    filteredStockIns = filteredStockIns.filter(
      (stockIn) => stockIn.productId === productId,
    );
  }

  if (startDate && endDate) {
    filteredStockIns = filteredStockIns.filter(
      (stockIn) => stockIn.date >= startDate && stockIn.date <= endDate,
    );
  }

  return response(
    res,
    200,
    filteredStockIns.length > 0
      ? 'Stock in records retrieved successfully'
      : 'No stock in records found',
    filteredStockIns,
  );
};

export const addStockIn = (req, res, next) => {
  const {
    productId,
    quantity,
    date,
    note,
  } = req.body;

  if (!productId || !quantity || !date) {
    return next(new InvariantError('Input stok masuk tidak valid.'));
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return next(new NotFoundError('Produk tidak ditemukan.'));
  }

  product.stock += Number(quantity);

  product.stockStatus = product.stock <= product.minimumStock
    ? 'low'
    : 'safe';

  const newStockIn = {
    id: nanoid(),
    productId: product.id,
    productName: product.productName,
    quantity: Number(quantity),
    unit: product.unit,
    date,
    note: note || '',
    currentStock: product.stock,
  };

  stockIns.push(newStockIn);

  return response(res, 201, 'Stock in record created successfully', newStockIn);
};

export const deleteStockInById = (req, res, next) => {
  const { stockInId } = req.params;

  const stockInIndex = stockIns.findIndex(
    (stockIn) => stockIn.id === stockInId,
  );

  if (stockInIndex === -1) {
    return next(new NotFoundError('Riwayat stok masuk tidak ditemukan.'));
  }

  const deletedStockIn = stockIns.splice(stockInIndex, 1)[0];

  return response(res, 200, 'Stock in record deleted successfully', {
    id: deletedStockIn.id,
    productName: deletedStockIn.productName,
    quantity: deletedStockIn.quantity,
    unit: deletedStockIn.unit,
  });
};
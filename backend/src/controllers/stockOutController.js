import { nanoid } from 'nanoid';
import stockOuts from '../data/stockOuts.js';
import products from '../data/product.js';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
} from '../exceptions/index.js';

const getCurrentTime = () => {
  const now = new Date();

  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getStockStatus = (stock, minimumStock) => {
  if (stock <= minimumStock) {
    return 'low';
  }

  return 'safe';
};

export const getStockOuts = (req, res) => {
  const { productId, date } = req.query;

  let filteredStockOuts = stockOuts;

  if (productId) {
    filteredStockOuts = filteredStockOuts.filter(
      (stockOut) => stockOut.productId === productId,
    );
  }

  if (date) {
    filteredStockOuts = filteredStockOuts.filter(
      (stockOut) => stockOut.date === date,
    );
  }

  const totalStockOut = filteredStockOuts.reduce(
    (total, stockOut) => total + stockOut.quantity,
    0,
  );

  return response(
    res,
    200,
    filteredStockOuts.length > 0
      ? 'Stock out records retrieved successfully'
      : 'No stock out records found',
    {
      totalStockOut,
      records: filteredStockOuts,
    },
  );
};

export const addStockOut = (req, res, next) => {
  const {
    productId,
    quantity,
    date,
    note,
  } = req.body;

  if (!productId || !quantity || !date) {
    return next(new InvariantError('Input stok keluar tidak valid.'));
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return next(new NotFoundError('Produk tidak ditemukan.'));
  }

  if (Number(quantity) > product.stock) {
    return next(new InvariantError('Jumlah stok keluar melebihi stok tersedia.'));
  }

  product.stock -= Number(quantity);
  product.stockStatus = getStockStatus(product.stock, product.minimumStock);

  const newStockOut = {
    id: nanoid(),
    productId: product.id,
    productName: product.productName,
    quantity: Number(quantity),
    unit: product.unit,
    date,
    time: getCurrentTime(),
    note: note || '-',
    currentStock: product.stock,
  };

  stockOuts.push(newStockOut);

  return response(res, 201, 'Stock out record created successfully', newStockOut);
};

export const deleteStockOutById = (req, res, next) => {
  const { stockOutId } = req.params;

  const stockOutIndex = stockOuts.findIndex(
    (stockOut) => stockOut.id === stockOutId,
  );

  if (stockOutIndex === -1) {
    return next(new NotFoundError('Riwayat stok keluar tidak ditemukan.'));
  }

  const deletedStockOut = stockOuts.splice(stockOutIndex, 1)[0];

  return response(res, 200, 'Stock out record deleted successfully', {
    id: deletedStockOut.id,
    productName: deletedStockOut.productName,
    quantity: deletedStockOut.quantity,
    unit: deletedStockOut.unit,
  });
};
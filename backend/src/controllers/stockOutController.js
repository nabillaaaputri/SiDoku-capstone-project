import { nanoid } from 'nanoid';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
} from '../exceptions/index.js';
import * as stockOutRepository from '../repositories/stockOutRepository.js';
import * as productRepository from '../repositories/productRepository.js';

const getCurrentTime = () => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};

const formatDate = (date) => {
  if (!date) return date;

  if (typeof date === 'string') {
    return date.split('T')[0];
  }

  return date.toISOString().split('T')[0];
};

const formatTime = (time) => {
  if (!time) return null;

  if (typeof time === 'string') {
    return time.slice(0, 5);
  }

  return time;
};

const getStockStatus = (stock, minimumStock) => {
  if (stock <= minimumStock) {
    return 'low';
  }

  return 'safe';
};

const mapStockOutResponse = (stockOut) => ({
  id: stockOut.id,
  productId: stockOut.product_id,
  productName: stockOut.product_name,
  quantity: stockOut.quantity,
  unit: stockOut.unit,
  date: formatDate(stockOut.date),
  time: formatTime(stockOut.time),
  note: stockOut.note,
  currentStock: stockOut.current_stock,
});

export const getStockOuts = async (req, res, next) => {
  try {
    const { productId, date } = req.query;
    const userId = req.user.id;

    const stockOuts = await stockOutRepository.getAllStockOuts({
      userId,
      productId,
      date,
    });

    const mappedStockOuts = stockOuts.map(mapStockOutResponse);

    const totalStockOut = mappedStockOuts.reduce(
      (total, stockOut) => total + Number(stockOut.quantity),
      0,
    );

    return response(
      res,
      200,
      mappedStockOuts.length > 0
        ? 'Stock out records retrieved successfully'
        : 'No stock out records found',
      {
        totalStockOut,
        records: mappedStockOuts,
      },
    );
  } catch (error) {
    return next(error);
  }
};

export const addStockOut = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      productId,
      quantity,
      date,
      time,
      note,
    } = req.body;

    const product = await productRepository.getProductById(productId, userId);

    if (!product) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    if (Number(quantity) > Number(product.stock)) {
      return next(new InvariantError('Jumlah stok keluar melebihi stok tersedia.'));
    }

    const newStock = Number(product.stock) - Number(quantity);
    const stockStatus = getStockStatus(newStock, product.minimum_stock);

    const updatedProduct = await productRepository.updateProductStockById({
      id: productId,
      userId,
      stock: newStock,
      stockStatus,
    });

    const newStockOut = await stockOutRepository.addStockOut({
      id: nanoid(),
      userId,
      productId: updatedProduct.id,
      productName: updatedProduct.product_name,
      quantity: Number(quantity),
      unit: updatedProduct.unit,
      date,
      time: time || getCurrentTime(),
      note: note || '-',
      currentStock: updatedProduct.stock,
    });

    return response(
      res,
      201,
      'Stock out record created successfully',
      mapStockOutResponse(newStockOut),
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteStockOutById = async (req, res, next) => {
  try {
    const { stockOutId } = req.params;
    const userId = req.user.id;

    const stockOut = await stockOutRepository.getStockOutById(stockOutId, userId);

    if (!stockOut) {
      return next(new NotFoundError('Riwayat stok keluar tidak ditemukan.'));
    }

    const deletedStockOut = await stockOutRepository.deleteStockOutById(
      stockOutId,
      userId,
    );

    return response(res, 200, 'Stock out record deleted successfully', {
      id: deletedStockOut.id,
      productName: deletedStockOut.product_name,
      quantity: deletedStockOut.quantity,
      unit: deletedStockOut.unit,
    });
  } catch (error) {
    return next(error);
  }
};
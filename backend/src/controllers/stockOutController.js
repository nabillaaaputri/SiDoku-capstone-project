import { nanoid } from 'nanoid';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
} from '../exceptions/index.js';
import * as stockOutRepository from '../repositories/stockOutRepository.js';
import * as productRepository from '../repositories/productRepository.js';

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

const mapStockOutResponse = (stockOut) => ({
  id: stockOut.id,
  productId: stockOut.product_id,
  productName: stockOut.product_name,
  quantity: stockOut.quantity,
  unit: stockOut.unit,
  date: stockOut.date,
  time: stockOut.time,
  note: stockOut.note,
  currentStock: stockOut.current_stock,
});

export const getStockOuts = async (req, res, next) => {
  try {
    const { productId, date } = req.query;

    const stockOuts = await stockOutRepository.getAllStockOuts({
      productId,
      date,
    });

    const mappedStockOuts = stockOuts.map(mapStockOutResponse);

    const totalStockOut = mappedStockOuts.reduce(
      (total, stockOut) => total + stockOut.quantity,
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
    const {
      productId,
      quantity,
      date,
      note,
    } = req.body;

    if (!productId || !quantity || !date) {
      return next(new InvariantError('Input stok keluar tidak valid.'));
    }

    const product = await productRepository.getProductById(productId);

    if (!product) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    if (Number(quantity) > product.stock) {
      return next(new InvariantError('Jumlah stok keluar melebihi stok tersedia.'));
    }

    const newStock = product.stock - Number(quantity);
    const stockStatus = getStockStatus(newStock, product.minimum_stock);

    const updatedProduct = await productRepository.updateProductStockById({
      id: productId,
      stock: newStock,
      stockStatus,
    });

    const newStockOut = await stockOutRepository.addStockOut({
      id: nanoid(),
      productId: updatedProduct.id,
      productName: updatedProduct.product_name,
      quantity: Number(quantity),
      unit: updatedProduct.unit,
      date,
      time: getCurrentTime(),
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

    const deletedStockOut = await stockOutRepository.deleteStockOutById(stockOutId);

    if (!deletedStockOut) {
      return next(new NotFoundError('Riwayat stok keluar tidak ditemukan.'));
    }

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
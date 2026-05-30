import { nanoid } from 'nanoid';
import response from '../utils/response.js';
import { NotFoundError } from '../exceptions/index.js';
import * as stockInRepository from '../repositories/stockInRepository.js';
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

const mapStockInResponse = (stockIn) => ({
  id: stockIn.id,
  productId: stockIn.product_id,
  productName: stockIn.product_name,
  quantity: stockIn.quantity,
  unit: stockIn.unit,
  date: formatDate(stockIn.date),
  time: formatTime(stockIn.time),
  note: stockIn.note,
  currentStock: stockIn.current_stock,
});

export const getStockIns = async (req, res, next) => {
  try {
    const { startDate, endDate, productId } = req.query;
    const userId = req.user.id;

    const stockIns = await stockInRepository.getAllStockIns({
      userId,
      startDate,
      endDate,
      productId,
    });

    const mappedStockIns = stockIns.map(mapStockInResponse);

    return response(
      res,
      200,
      mappedStockIns.length > 0
        ? 'Stock in records retrieved successfully'
        : 'No stock in records found',
      mappedStockIns,
    );
  } catch (error) {
    return next(error);
  }
};

export const addStockIn = async (req, res, next) => {
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

    const newStock = Number(product.stock) + Number(quantity);
    const stockStatus = getStockStatus(newStock, product.minimum_stock);

    const updatedProduct = await productRepository.updateProductStockById({
      id: productId,
      userId,
      stock: newStock,
      stockStatus,
    });

    const newStockIn = await stockInRepository.addStockIn({
      id: nanoid(),
      userId,
      productId: updatedProduct.id,
      productName: updatedProduct.product_name,
      quantity: Number(quantity),
      unit: updatedProduct.unit,
      date,
      time: time || getCurrentTime(),
      note: note || '',
      currentStock: updatedProduct.stock,
    });

    return response(
      res,
      201,
      'Stock in record created successfully',
      mapStockInResponse(newStockIn),
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteStockInById = async (req, res, next) => {
  try {
    const { stockInId } = req.params;
    const userId = req.user.id;

    const stockIn = await stockInRepository.getStockInById(stockInId, userId);

    if (!stockIn) {
      return next(new NotFoundError('Riwayat stok masuk tidak ditemukan.'));
    }

    const deletedStockIn = await stockInRepository.deleteStockInById(
      stockInId,
      userId,
    );

    return response(res, 200, 'Stock in record deleted successfully', {
      id: deletedStockIn.id,
      productName: deletedStockIn.product_name,
      quantity: deletedStockIn.quantity,
      unit: deletedStockIn.unit,
    });
  } catch (error) {
    return next(error);
  }
};
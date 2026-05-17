import { nanoid } from 'nanoid';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
} from '../exceptions/index.js';
import * as stockInRepository from '../repositories/stockInRepository.js';
import * as productRepository from '../repositories/productRepository.js';

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
  date: stockIn.date,
  note: stockIn.note,
  currentStock: stockIn.current_stock,
});

export const getStockIns = async (req, res, next) => {
  try {
    const { startDate, endDate, productId } = req.query;

    const stockIns = await stockInRepository.getAllStockIns({
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
    const {
      productId,
      quantity,
      date,
      note,
    } = req.body;

    if (!productId || !quantity || !date) {
      return next(new InvariantError('Input stok masuk tidak valid.'));
    }

    const product = await productRepository.getProductById(productId);

    if (!product) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    const newStock = product.stock + Number(quantity);
    const stockStatus = getStockStatus(newStock, product.minimum_stock);

    const updatedProduct = await productRepository.updateProductStockById({
      id: productId,
      stock: newStock,
      stockStatus,
    });

    const newStockIn = await stockInRepository.addStockIn({
      id: nanoid(),
      productId: updatedProduct.id,
      productName: updatedProduct.product_name,
      quantity: Number(quantity),
      unit: updatedProduct.unit,
      date,
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

    const deletedStockIn = await stockInRepository.deleteStockInById(stockInId);

    if (!deletedStockIn) {
      return next(new NotFoundError('Riwayat stok masuk tidak ditemukan.'));
    }

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
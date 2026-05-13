import { nanoid } from 'nanoid';
import stockIns from '../data/stockIns.js';
import products from '../data/product.js';

export const getStockIns = (req, res) => {
  try {
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

    return res.status(200).json({
      status: 'success',
      message: filteredStockIns.length > 0
        ? 'Stock in records retrieved successfully'
        : 'No stock in records found',
      data: filteredStockIns,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const addStockIn = (req, res) => {
  try {
    const {
      productId,
      quantity,
      date,
      note,
    } = req.body;

    if (!productId || !quantity || !date) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input stok masuk tidak valid.',
      });
    }

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Produk tidak ditemukan.',
      });
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

    return res.status(201).json({
      status: 'success',
      message: 'Stock in record created successfully',
      data: newStockIn,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const deleteStockInById = (req, res) => {
  try {
    const { stockInId } = req.params;

    const stockInIndex = stockIns.findIndex(
      (stockIn) => stockIn.id === stockInId,
    );

    if (stockInIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Riwayat stok masuk tidak ditemukan.',
      });
    }

    const deletedStockIn = stockIns.splice(stockInIndex, 1)[0];

    return res.status(200).json({
      status: 'success',
      message: 'Stock in record deleted successfully',
      data: {
        id: deletedStockIn.id,
        productName: deletedStockIn.productName,
        quantity: deletedStockIn.quantity,
        unit: deletedStockIn.unit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};
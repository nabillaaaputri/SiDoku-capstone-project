import { nanoid } from 'nanoid';
import stockOuts from '../data/stockOuts.js';
import products from '../data/product.js';

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
  try {
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

    return res.status(200).json({
      status: 'success',
      message: filteredStockOuts.length > 0
        ? 'Stock out records retrieved successfully'
        : 'No stock out records found',
      data: {
        totalStockOut,
        records: filteredStockOuts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const addStockOut = (req, res) => {
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
        message: 'Input stok keluar tidak valid.',
      });
    }

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Produk tidak ditemukan.',
      });
    }

    if (Number(quantity) > product.stock) {
      return res.status(400).json({
        status: 'fail',
        message: 'Jumlah stok keluar melebihi stok tersedia.',
      });
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

    return res.status(201).json({
      status: 'success',
      message: 'Stock out record created successfully',
      data: newStockOut,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const deleteStockOutById = (req, res) => {
  try {
    const { stockOutId } = req.params;

    const stockOutIndex = stockOuts.findIndex(
      (stockOut) => stockOut.id === stockOutId,
    );

    if (stockOutIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Riwayat stok keluar tidak ditemukan.',
      });
    }

    const deletedStockOut = stockOuts.splice(stockOutIndex, 1)[0];

    return res.status(200).json({
      status: 'success',
      message: 'Stock out record deleted successfully',
      data: {
        id: deletedStockOut.id,
        productName: deletedStockOut.productName,
        quantity: deletedStockOut.quantity,
        unit: deletedStockOut.unit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};
import { nanoid } from 'nanoid';
import products from '../data/product.js';

const calculateMargin = (purchasePrice, sellingPrice) => {
  return Number((((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2));
};

const getStockStatus = (stock, minimumStock) => {
  if (stock <= minimumStock) {
    return 'low';
  }

  return 'safe';
};

export const getProducts = (req, res) => {
  try {
    const { status, category } = req.query;

    let filteredProducts = products;

    if (status === 'active') {
      filteredProducts = filteredProducts.filter((product) => product.isArchived === false);
    }

    if (status === 'archived') {
      filteredProducts = filteredProducts.filter((product) => product.isArchived === true);
    }

    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase(),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: filteredProducts.length > 0
        ? 'Products retrieved successfully'
        : 'Barang tidak ditemukan',
      data: filteredProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const addProducts = (req, res) => {
  try {
    const {
      productName,
      purchasePrice,
      sellingPrice,
      minimumStock,
      category,
      unit,
      initialStock,
    } = req.body;

    if (
      !productName
      || !purchasePrice
      || !sellingPrice
      || !minimumStock
      || !category
      || !unit
      || initialStock === undefined
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input produk tidak valid.',
      });
    }

    const isProductExist = products.find(
      (product) => product.productName.toLowerCase() === productName.toLowerCase(),
    );

    if (isProductExist) {
      return res.status(409).json({
        status: 'fail',
        message: 'Produk dengan nama tersebut sudah ada.',
      });
    }

    const id = nanoid();

    const newProduct = {
      id,
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      margin: calculateMargin(purchasePrice, sellingPrice),
      stock: initialStock,
      minimumStock,
      stockStatus: getStockStatus(initialStock, minimumStock),
      isArchived: false,
    };

    products.push(newProduct);

    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const editProductById = (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      minimumStock,
    } = req.body;

    if (
      !productName
      || !category
      || !unit
      || !purchasePrice
      || !sellingPrice
      || !minimumStock
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input produk tidak valid.',
      });
    }

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Produk tidak ditemukan.',
      });
    }

    const isProductNameUsed = products.find(
      (item) =>
        item.id !== productId
        && item.productName.toLowerCase() === productName.toLowerCase(),
    );

    if (isProductNameUsed) {
      return res.status(409).json({
        status: 'fail',
        message: 'Produk dengan nama tersebut sudah ada.',
      });
    }

    product.productName = productName;
    product.category = category;
    product.unit = unit;
    product.purchasePrice = purchasePrice;
    product.sellingPrice = sellingPrice;
    product.margin = calculateMargin(purchasePrice, sellingPrice);
    product.minimumStock = minimumStock;
    product.stockStatus = getStockStatus(product.stock, minimumStock);

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const archiveProductById = (req, res) => {
  try {
    const { productId } = req.params;

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Produk tidak ditemukan.',
      });
    }

    product.isArchived = true;

    return res.status(200).json({
      status: 'success',
      message: 'Product archived successfully',
      data: {
        id: product.id,
        productName: product.productName,
        isArchived: product.isArchived,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const restoreProductById = (req, res) => {
  try {
    const { productId } = req.params;

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Produk tidak ditemukan.',
      });
    }

    product.isArchived = false;

    return res.status(200).json({
      status: 'success',
      message: 'Product restored successfully',
      data: {
        id: product.id,
        productName: product.productName,
        isArchived: product.isArchived,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};
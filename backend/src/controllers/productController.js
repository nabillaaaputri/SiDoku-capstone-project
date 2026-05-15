import { nanoid } from 'nanoid';
import products from '../data/product.js';
import response from '../utils/response.js';
import {
  InvariantError,
  NotFoundError,
  ConflictError,
} from '../exceptions/index.js';

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

  return response(
    res,
    200,
    filteredProducts.length > 0
      ? 'Products retrieved successfully'
      : 'Barang tidak ditemukan',
    filteredProducts,
  );
};

export const addProducts = (req, res, next) => {
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
    return next(new InvariantError('Input produk tidak valid.'));
  }

  const isProductExist = products.find(
    (product) => product.productName.toLowerCase() === productName.toLowerCase(),
  );

  if (isProductExist) {
    return next(new ConflictError('Produk dengan nama tersebut sudah ada.'));
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

  return response(res, 201, 'Product created successfully', newProduct);
};

export const editProductById = (req, res, next) => {
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
    return next(new InvariantError('Input produk tidak valid.'));
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return next(new NotFoundError('Produk tidak ditemukan.'));
  }

  const isProductNameUsed = products.find(
    (item) =>
      item.id !== productId
      && item.productName.toLowerCase() === productName.toLowerCase(),
  );

  if (isProductNameUsed) {
    return next(new ConflictError('Produk dengan nama tersebut sudah ada.'));
  }

  product.productName = productName;
  product.category = category;
  product.unit = unit;
  product.purchasePrice = purchasePrice;
  product.sellingPrice = sellingPrice;
  product.margin = calculateMargin(purchasePrice, sellingPrice);
  product.minimumStock = minimumStock;
  product.stockStatus = getStockStatus(product.stock, minimumStock);

  return response(res, 200, 'Product updated successfully', product);
};

export const archiveProductById = (req, res, next) => {
  const { productId } = req.params;

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return next(new NotFoundError('Produk tidak ditemukan.'));
  }

  product.isArchived = true;

  return response(res, 200, 'Product archived successfully', {
    id: product.id,
    productName: product.productName,
    isArchived: product.isArchived,
  });
};

export const restoreProductById = (req, res, next) => {
  const { productId } = req.params;

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return next(new NotFoundError('Produk tidak ditemukan.'));
  }

  product.isArchived = false;

  return response(res, 200, 'Product restored successfully', {
    id: product.id,
    productName: product.productName,
    isArchived: product.isArchived,
  });
};
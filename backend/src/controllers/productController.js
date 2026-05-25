import { nanoid } from 'nanoid';
import response from '../utils/response.js';
import {
  NotFoundError,
  ConflictError,
} from '../exceptions/index.js';
import * as productRepository from '../repositories/productRepository.js';
import productCategories from '../constants/productCategories.js';

const calculateMargin = (purchasePrice, sellingPrice) => {
  return Number((((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2));
};

const getStockStatus = (stock, minimumStock) => {
  if (stock <= minimumStock) {
    return 'low';
  }

  return 'safe';
};

const mapProductResponse = (product) => ({
  id: product.id,
  productName: product.product_name,
  category: product.category,
  unit: product.unit,
  purchasePrice: product.purchase_price,
  sellingPrice: product.selling_price,
  margin: Number(product.margin),
  stock: product.stock,
  minimumStock: product.minimum_stock,
  stockStatus: product.stock_status,
  isArchived: product.is_archived,
});

export const getProductCategories = async (req, res, next) => {
  try {
    return response(
      res,
      200,
      'Product categories retrieved successfully',
      productCategories,
    );
  } catch (error) {
    return next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const userId = req.user.id;

    const products = await productRepository.getAllProducts({
      status,
      category,
      userId,
    });

    const mappedProducts = products.map(mapProductResponse);

    return response(
      res,
      200,
      mappedProducts.length > 0
        ? 'Products retrieved successfully'
        : 'Barang tidak ditemukan',
      mappedProducts,
    );
  } catch (error) {
    return next(error);
  }
};

export const addProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      productName,
      purchasePrice,
      sellingPrice,
      minimumStock,
      category,
      unit,
      initialStock,
    } = req.body;

    const isProductExist = await productRepository.getProductByName(
      productName,
      userId,
    );

    if (isProductExist) {
      return next(new ConflictError('Produk dengan nama tersebut sudah ada.'));
    }

    const id = nanoid();
    const margin = calculateMargin(purchasePrice, sellingPrice);
    const stock = initialStock;
    const stockStatus = getStockStatus(stock, minimumStock);

    const newProduct = await productRepository.addProduct({
      id,
      userId,
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      margin,
      stock,
      minimumStock,
      stockStatus,
    });

    return response(
      res,
      201,
      'Product created successfully',
      mapProductResponse(newProduct),
    );
  } catch (error) {
    return next(error);
  }
};

export const editProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const {
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      minimumStock,
    } = req.body;

    const product = await productRepository.getProductById(productId, userId);

    if (!product) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    const isProductNameUsed = await productRepository.getProductByName(
      productName,
      userId,
    );

    if (isProductNameUsed && isProductNameUsed.id !== productId) {
      return next(new ConflictError('Produk dengan nama tersebut sudah ada.'));
    }

    const margin = calculateMargin(purchasePrice, sellingPrice);
    const stockStatus = getStockStatus(product.stock, minimumStock);

    const updatedProduct = await productRepository.updateProductById({
      id: productId,
      userId,
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      margin,
      stock: product.stock,
      minimumStock,
      stockStatus,
    });

    return response(
      res,
      200,
      'Product updated successfully',
      mapProductResponse(updatedProduct),
    );
  } catch (error) {
    return next(error);
  }
};

export const archiveProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await productRepository.getProductById(productId, userId);

    if (!product) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    const archivedProduct = await productRepository.archiveProductById(
      productId,
      userId,
    );

    return response(res, 200, 'Product archived successfully', {
      id: archivedProduct.id,
      productName: archivedProduct.product_name,
      isArchived: archivedProduct.is_archived,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await productRepository.getProductById(productId, userId);

    if (!product) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    const restoredProduct = await productRepository.restoreProductById(
      productId,
      userId,
    );

    return response(res, 200, 'Product restored successfully', {
      id: restoredProduct.id,
      productName: restoredProduct.product_name,
      isArchived: restoredProduct.is_archived,
    });
  } catch (error) {
    return next(error);
  }
};
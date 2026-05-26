import response from '../utils/response.js';
import { NotFoundError, InvariantError } from '../exceptions/index.js';
import {
  getAiProductPayloadById,
  getAllAiProductsPayload,
} from '../repositories/aiRepository.js';
import {
  predictSales,
  getInsights,
  getRecommendations,
} from '../services/aiService.js';

const handleAiServiceError = (res, error) => {
  const statusCode = error.response?.status || 502;
  const message =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    'Layanan AI sedang tidak tersedia.';

  return response(res, statusCode === 503 ? 503 : 502, message);
};

export const getSalesForecast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const daysAhead = Number(req.query.daysAhead || 7);
    const historyDays = Number(req.query.historyDays || 60);

    const productPayload = await getAiProductPayloadById({
      userId,
      productId,
      historyDays,
    });

    if (!productPayload) {
      return next(new NotFoundError('Produk tidak ditemukan.'));
    }

    if (productPayload.stok_keluar.length < 1) {
      return next(
        new InvariantError(
          'Data stok keluar produk belum cukup untuk melakukan prediksi.',
        ),
      );
    }

    const aiPayload = {
      product_name: productPayload.product_name,
      stok: productPayload.stok,
      harga_jual: productPayload.harga_jual,
      stok_keluar: productPayload.stok_keluar,
      stok_masuk: productPayload.stok_masuk,
      days_ahead: daysAhead,
    };

    try {
      const forecast = await predictSales(aiPayload);

      return response(res, 200, 'Sales forecast retrieved successfully', {
        productId: productPayload.productId,
        ...forecast,
      });
    } catch (error) {
      return handleAiServiceError(res, error);
    }
  } catch (error) {
    return next(error);
  }
};

export const getAiInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const historyDays = Number(req.query.historyDays || 60);

    const products = await getAllAiProductsPayload({
      userId,
      historyDays,
    });

    if (products.length === 0) {
      return next(new NotFoundError('Data produk tidak ditemukan.'));
    }

    const aiProducts = products.map((product) => ({
      product_name: product.product_name,
      stok: product.stok,
      harga_jual: product.harga_jual,
      stok_keluar: product.stok_keluar,
      stok_masuk: product.stok_masuk,
    }));

    try {
      const insights = await getInsights(aiProducts);

      return response(res, 200, 'AI insights retrieved successfully', insights);
    } catch (error) {
      return handleAiServiceError(res, error);
    }
  } catch (error) {
    return next(error);
  }
};

export const getAiRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const historyDays = Number(req.query.historyDays || 60);

    const products = await getAllAiProductsPayload({
      userId,
      historyDays,
    });

    if (products.length === 0) {
      return next(new NotFoundError('Data produk tidak ditemukan.'));
    }

    const aiProducts = products.map((product) => ({
      product_name: product.product_name,
      stok: product.stok,
      harga_jual: product.harga_jual,
      stok_keluar: product.stok_keluar,
      stok_masuk: product.stok_masuk,
    }));

    try {
      const recommendations = await getRecommendations(aiProducts);

      return response(
        res,
        200,
        'AI recommendations retrieved successfully',
        recommendations,
      );
    } catch (error) {
      return handleAiServiceError(res, error);
    }
  } catch (error) {
    return next(error);
  }
};
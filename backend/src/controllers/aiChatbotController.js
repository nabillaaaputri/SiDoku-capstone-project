import response from '../utils/response.js';
import {
  sendChatMessage,
  predictSales,
  getInsights,
  getRecommendations,
} from '../services/aiService.js';
import {
  getAllAiProductsPayload,
  getTodaySalesSummary,
  getMonthlyExpenseSummary,
  getMonthlyProfitLossSummary,
  getInventorySummary,
} from '../repositories/aiRepository.js';

const HISTORY_DAYS = 60;

const handleAiServiceError = (res, error) => {
  console.error('AI CHATBOT SERVICE ERROR:', {
    aiServiceUrl: process.env.AI_SERVICE_URL,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });

  const statusCode = error.response?.status || 502;
  const message =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    'Layanan AI sedang tidak tersedia.';

  return response(res, statusCode === 503 ? 503 : 502, message, null);
};

const buildAiProducts = async (userId) => {
  const products = await getAllAiProductsPayload({
    userId,
    historyDays: HISTORY_DAYS,
  });

  return products.map((product) => ({
    product_name: product.product_name,
    stok: product.stok,
    harga_jual: product.harga_jual,
    stok_keluar: product.stok_keluar,
    stok_masuk: product.stok_masuk,
  }));
};

const handleChatAction = async ({ action, userId }) => {
  switch (action) {
  case 'fetch_daily_sales': {
    return getTodaySalesSummary(userId);
  }

  case 'fetch_expenses': {
    return getMonthlyExpenseSummary(userId);
  }

  case 'fetch_profit_loss': {
    return getMonthlyProfitLossSummary(userId);
  }

  case 'fetch_inventory': {
    return getInventorySummary(userId);
  }

  case 'predict_inventory_depletion': {
    const products = await buildAiProducts(userId);

    if (products.length === 0) {
      return {
        insights: [],
        note: 'Belum ada produk aktif yang bisa dianalisis.',
      };
    }

    return getInsights(products);
  }

  case 'generate_strategy_recommendation': {
    const products = await buildAiProducts(userId);

    if (products.length === 0) {
      return {
        recommendations: [],
        note: 'Belum ada produk aktif yang bisa diberikan rekomendasi.',
      };
    }

    return getRecommendations(products);
  }

  case 'predict_future_sales': {
    const products = await buildAiProducts(userId);

    if (products.length === 0) {
      return {
        predictions: [],
        note: 'Belum ada produk aktif yang bisa diprediksi.',
      };
    }

    const firstProduct = products[0];

    if (firstProduct.stok_keluar.length < 1) {
      return {
        product_name: firstProduct.product_name,
        predictions: [],
        note: 'Data stok keluar produk belum cukup untuk prediksi.',
      };
    }

    return predictSales({
      ...firstProduct,
      days_ahead: 7,
    });
  }

  case 'exit_chat': {
    return {
      action: 'exit_chat',
      note: 'Sesi chat dapat ditutup oleh frontend.',
    };
  }

  default:
    return null;
  }
};

export const askAiChatbot = async (req, res, next) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    try {
      const chatResult = await sendChatMessage(question);
      const { response: aiResponse, action, tag } = chatResult;

      const data = await handleChatAction({
        action,
        userId,
      });

      return response(res, 200, 'AI chatbot response generated successfully', {
        question,
        answer: aiResponse,
        action,
        tag,
        data,
      });
    } catch (error) {
      return handleAiServiceError(res, error);
    }
  } catch (error) {
    return next(error);
  }
};
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
  getBestSellingProducts,
  getMonthlyExpenseSummary,
  getMonthlyProfitLossSummary,
  getInventorySummary,
} from '../repositories/aiRepository.js';

const HISTORY_DAYS = 60;

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

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

const MAX_DAYS_AHEAD = 14; // GRU model reliability boundary (WINDOW_SIZE=28, autoregressive error accumulation)

const handleChatAction = async ({ action, userId, params = {} }) => {
  switch (action) {
  case 'fetch_daily_sales': {
    return getTodaySalesSummary(userId);
  }

  case 'fetch_best_selling': {
    return getBestSellingProducts({
      userId,
      days: 7,
      limit: 5,
    });
  }

  case 'fetch_expenses': {
    return getMonthlyExpenseSummary(userId);
  }

  case 'fetch_profit_loss': {
    return getMonthlyProfitLossSummary(userId);
  }

  case 'fetch_business_summary': {
    const [sales, profitLoss, bestSelling] = await Promise.all([
      getTodaySalesSummary(userId),
      getMonthlyProfitLossSummary(userId),
      getBestSellingProducts({ userId, days: 7, limit: 3 }),
    ]);
    return {
      sales_hari_ini: sales,
      laba_rugi_bulan_ini: profitLoss,
      produk_terlaris_mingguan: bestSelling,
    };
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

    // Enrich with business context so the LLM can produce meaningful strategy advice
    const [stockRecommendations, salesSummary, profitLoss, bestSelling] = await Promise.all([
      getRecommendations(products),
      getTodaySalesSummary(userId),
      getMonthlyProfitLossSummary(userId),
      getBestSellingProducts({ userId, days: 7, limit: 5 }),
    ]);

    return {
      rekomendasi_stok: stockRecommendations,
      ringkasan_penjualan_hari_ini: salesSummary,
      laba_rugi_bulan_ini: profitLoss,
      produk_terlaris_minggu_ini: bestSelling,
    };
  }

  case 'predict_future_sales': {
    const products = await buildAiProducts(userId);

    if (products.length === 0) {
      return {
        predictions: [],
        note: 'Belum ada produk aktif yang bisa diprediksi.',
      };
    }

    // Find product by name from params (case-insensitive partial match),
    // fallback to the product with the most sales history.
    const targetName = (params.product_name || '').toLowerCase().trim();
    const matched = targetName
      ? products.find((p) =>
          p.product_name.toLowerCase().includes(targetName),
        )
      : null;
    const targetProduct =
      matched ??
      products.reduce((best, p) =>
        p.stok_keluar.length > best.stok_keluar.length ? p : best,
      );

    if (targetProduct.stok_keluar.length < 1) {
      return {
        product_name: targetProduct.product_name,
        predictions: [],
        note: 'Data stok keluar produk belum cukup untuk prediksi.',
      };
    }

    // Cap days_ahead at MAX_DAYS_AHEAD regardless of LLM output,
    // to prevent error accumulation beyond the model's reliable range.
    const daysAhead = Math.min(
      Number(params.days_ahead) || 7,
      MAX_DAYS_AHEAD,
    );

    return predictSales({
      ...targetProduct,
      days_ahead: daysAhead,
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
      const { response: aiResponse, action, tag, params = {} } = chatResult;

      const data = await handleChatAction({
        action,
        userId,
        params,
      });

      let finalAnswer = "";

      if (action === 'exit_chat') {
        finalAnswer = 'Baik, sesi chat bisa ditutup.';
      } else if (!action) {
        finalAnswer = aiResponse || 'Maaf, saya belum bisa menjawab pertanyaan itu.';
      } else {
        const promptWithData = JSON.stringify({
          _scenario: 2,
          question,
          data,
        });
        const finalChatResult = await sendChatMessage(promptWithData);
        finalAnswer = finalChatResult.response || 'Maaf, saya sedang memproses sesuatu.';
      }

      return response(res, 200, 'AI chatbot response generated successfully', {
        question,
        answer: finalAnswer,
        aiResponse,
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
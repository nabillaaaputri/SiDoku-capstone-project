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

const handleChatAction = async ({ action, userId }) => {
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

const formatDailySalesAnswer = (data) => {
  if (!data) {
    return 'Data penjualan hari ini belum tersedia.';
  }

  return `Hari ini total produk terjual sebanyak ${data.totalSold} item dengan estimasi pemasukan ${formatCurrency(data.totalIncome)}.`;
};

const formatBestSellingAnswer = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return 'Belum ada data penjualan dalam 7 hari terakhir, jadi produk paling laku belum bisa ditentukan.';
  }

  const topProduct = data[0];

  const otherProducts = data
    .slice(1, 3)
    .map((product, index) => (
      `${index + 2}. ${product.productName} (${product.totalSold} ${product.unit})`
    ))
    .join(', ');

  if (!otherProducts) {
    return `Produk paling laku dalam 7 hari terakhir adalah ${topProduct.productName} dengan total penjualan ${topProduct.totalSold} ${topProduct.unit}.`;
  }

  return `Produk paling laku dalam 7 hari terakhir adalah ${topProduct.productName} dengan total penjualan ${topProduct.totalSold} ${topProduct.unit}. Produk lain yang juga cukup laku: ${otherProducts}.`;
};

const formatExpenseAnswer = (data) => {
  if (!data) {
    return 'Data pengeluaran bulan ini belum tersedia.';
  }

  return `Total pengeluaran bulan ini adalah ${formatCurrency(data.totalExpense)}.`;
};

const formatProfitLossAnswer = (data) => {
  if (!data) {
    return 'Data keuntungan bulan ini belum tersedia.';
  }

  return `Estimasi keuntungan bulan ini adalah ${formatCurrency(data.estimatedProfit)}. Total pemasukan sebesar ${formatCurrency(data.totalIncome)}, HPP sebesar ${formatCurrency(data.totalHpp)}, dan pengeluaran sebesar ${formatCurrency(data.totalExpense)}.`;
};

const formatInventoryAnswer = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return 'Belum ada data produk aktif yang bisa dicek.';
  }

  const lowStockProducts = data.filter((product) => (
    Number(product.stock) <= Number(product.minimumStock)
  ));

  if (lowStockProducts.length === 0) {
    return `Saat ini ada ${data.length} produk aktif dan belum ada stok yang berada di bawah batas minimum.`;
  }

  const productNames = lowStockProducts
    .slice(0, 3)
    .map((product) => `${product.productName} (${product.stock} ${product.unit})`)
    .join(', ');

  return `Ada ${lowStockProducts.length} produk yang stoknya perlu diperhatikan, yaitu ${productNames}.`;
};

const formatInventoryPredictionAnswer = (data) => {
  const insights = data?.insights;

  if (!Array.isArray(insights) || insights.length === 0) {
    return data?.note || 'Belum ada insight stok yang bisa ditampilkan.';
  }

  const criticalProducts = insights.filter((item) => item.status === 'critical');

  if (criticalProducts.length === 0) {
    return 'Berdasarkan prediksi AI, stok produk saat ini masih relatif aman.';
  }

  const productNames = criticalProducts
    .slice(0, 3)
    .map((item) => `${item.product_name} (stok ${item.stok})`)
    .join(', ');

  return `Berdasarkan prediksi AI, ada ${criticalProducts.length} produk yang stoknya berisiko menipis, yaitu ${productNames}.`;
};

const formatRecommendationAnswer = (data) => {
  const recommendations = data?.recommendations;

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return data?.note || 'Belum ada rekomendasi restock yang bisa ditampilkan.';
  }

  const needRestock = recommendations
    .filter((item) => Number(item.reorder_qty) > 0)
    .slice(0, 3);

  if (needRestock.length === 0) {
    return 'Saat ini belum ada produk yang perlu segera direstock berdasarkan rekomendasi AI.';
  }

  const recommendationText = needRestock
    .map((item) => `${item.product_name} sekitar ${item.reorder_qty} unit`)
    .join(', ');

  return `Rekomendasi restock dari AI: ${recommendationText}.`;
};

const formatFutureSalesAnswer = (data) => {
  const predictions = data?.predictions;

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return data?.note || 'Prediksi penjualan belum tersedia.';
  }

  const totalPrediction = predictions.reduce(
    (total, item) => total + Number(item.predicted_qty || 0),
    0,
  );

  return `Prediksi penjualan ${data.product_name} untuk 7 hari ke depan sekitar ${totalPrediction.toFixed(1)} unit.`;
};

const formatChatAnswer = ({ action, aiResponse, data }) => {
  switch (action) {
  case 'fetch_daily_sales':
    return formatDailySalesAnswer(data);

  case 'fetch_best_selling':
    return formatBestSellingAnswer(data);

  case 'fetch_expenses':
    return formatExpenseAnswer(data);

  case 'fetch_profit_loss':
    return formatProfitLossAnswer(data);

  case 'fetch_inventory':
    return formatInventoryAnswer(data);

  case 'predict_inventory_depletion':
    return formatInventoryPredictionAnswer(data);

  case 'generate_strategy_recommendation':
    return formatRecommendationAnswer(data);

  case 'predict_future_sales':
    return formatFutureSalesAnswer(data);

  case 'exit_chat':
    return 'Baik, sesi chat bisa ditutup.';

  default:
    return aiResponse || 'Maaf, saya belum bisa menjawab pertanyaan itu.';
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

      const finalAnswer = formatChatAnswer({
        action,
        aiResponse,
        data,
      });

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
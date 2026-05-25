import response from '../utils/response.js';

export const askAiChatbot = async (req, res, next) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    return response(res, 200, 'AI response generated successfully', {
      userId,
      question,
      answer:
        'Saat ini fitur AI masih menggunakan fallback response dari backend. Nantinya, backend akan mengambil data usaha milik user yang sedang login, mengirim prompt ke layanan AI, lalu mengembalikan jawaban ke frontend.',
      suggestions: [
        'Lihat tren keuntungan 7 hari terakhir',
        'Cek produk dengan stok menipis',
        'Lihat rekap penjualan hari ini',
      ],
    });
  } catch (error) {
    return next(error);
  }
};
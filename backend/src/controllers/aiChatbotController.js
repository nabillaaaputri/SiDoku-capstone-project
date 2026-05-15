import response from '../utils/response.js';
import { InvariantError } from '../exceptions/index.js';

export const askAiChatbot = (req, res, next) => {
  const { question } = req.body;

  if (!question) {
    return next(new InvariantError('Pertanyaan tidak boleh kosong.'));
  }

  return response(res, 200, 'AI response generated successfully', {
    question,
    answer:
      'Saat ini fitur AI masih menggunakan dummy response. Nantinya, backend akan mengambil data usaha yang relevan, mengirim prompt ke layanan Generative AI, lalu mengembalikan jawaban ke frontend.',
    suggestions: [
      'Lihat tren keuntungan 7 hari terakhir',
      'Cek produk dengan stok menipis',
      'Lihat rekap penjualan hari ini',
    ],
  });
};
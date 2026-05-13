export const askAiChatbot = (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        status: 'fail',
        message: 'Pertanyaan tidak boleh kosong.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'AI response generated successfully',
      data: {
        question,
        answer:
          'Saat ini fitur AI masih menggunakan dummy response. Nantinya, backend akan mengambil data usaha yang relevan, mengirim prompt ke layanan Generative AI, lalu mengembalikan jawaban ke frontend.',
        suggestions: [
          'Lihat tren keuntungan 7 hari terakhir',
          'Cek produk dengan stok menipis',
          'Lihat rekap penjualan hari ini',
        ],
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const getSummary = (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Dashboard summary retrieved successfully',
      data: {
        income: 2400000,
        expense: 750000,
        profit: 1650000,
        roi: 220,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const getInsights = (req, res) => {
  try {
    const insights = [
      {
        title: 'Penjualan Stabil',
        description: 'Penjualan bulan ini sama seperti bulan lalu. Pertahankan konsistensinya!',
      },
      {
        title: 'Biaya Terkontrol',
        description: 'Biaya operasional bulan ini lebih hemat dari bulan lalu. Bagus!',
      },
      {
        title: 'Produk Hampir Habis',
        description: '1 produk stoknya sudah tinggal sedikit. Buruan pesan ulang sebelum terlambat!',
      },
      {
        title: 'Apa yang bisa kamu lakukan?',
        description: 'Mulai input data penjualan dan pengeluaran untuk melihat saran untuk kamu.',
      },
    ];

    return res.status(200).json({
      status: 'success',
      message: insights.length > 0
        ? 'Dashboard insights retrieved successfully'
        : 'No dashboard insights available',
      data: insights,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const getLowStocks = (req, res) => {
  try {
    const lowStocks = [
      {
        id: 'product-1',
        productName: 'Handuk',
        currentStock: 5,
        minimumStock: 10,
        unit: 'pcs',
        stockNeeded: 5,
      },
      {
        id: 'product-2',
        productName: 'Minyak Goreng',
        currentStock: 5,
        minimumStock: 7,
        unit: 'liter',
        stockNeeded: 2,
      },
    ];

    return res.status(200).json({
      status: 'success',
      message: lowStocks.length > 0
        ? 'Low stock products retrieved successfully'
        : 'No low stock products found',
      data: lowStocks,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const getTrends = (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Dashboard trends retrieved successfully',
      data: {
        period: '7 days',
        items: [
          {
            day: 'Senin',
            income: 2400000,
            expense: 800000,
          },
          {
            day: 'Selasa',
            income: 2800000,
            expense: 600000,
          },
          {
            day: 'Rabu',
            income: 2000000,
            expense: 700000,
          },
          {
            day: 'Kamis',
            income: 2900000,
            expense: 850000,
          },
          {
            day: 'Jumat',
            income: 2300000,
            expense: 700000,
          },
          {
            day: 'Sabtu',
            income: 3200000,
            expense: 900000,
          },
          {
            day: 'Minggu',
            income: 2600000,
            expense: 800000,
          },
        ],
        totalIncome: 18200000,
        totalExpense: 5350000,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};
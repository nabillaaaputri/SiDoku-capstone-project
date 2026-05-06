import { useMemo } from "react";

export default function SalesChart() {
  // 7-day income vs expenses trend data
  const dummyData = [
    { day: "Senin", income: 2400, expense: 750 },
    { day: "Selasa", income: 2800, expense: 600 },
    { day: "Rabu", income: 2000, expense: 700 },
    { day: "Kamis", income: 2900, expense: 850 },
    { day: "Jumat", income: 2300, expense: 700 },
    { day: "Sabtu", income: 3200, expense: 900 },
    { day: "Minggu", income: 2600, expense: 800 },
  ];

  const chartData = useMemo(() => {
    return dummyData;
  }, []);

  const maxValue = Math.max(
    ...chartData.flatMap((d) => [d.income, d.expense])
  );
  const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = chartData.reduce((sum, d) => sum + d.expense, 0);

  // Calculate SVG line paths - responsive sizing
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 360;
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 768;

  const leftPadding = isSmallMobile ? 48 : isMobile ? 56 : isTablet ? 68 : 84;
  const rightPadding = isSmallMobile ? 18 : isMobile ? 22 : isTablet ? 28 : 34;
  const topPadding = isSmallMobile ? 22 : isMobile ? 24 : isTablet ? 28 : 32;
  const bottomPadding = isSmallMobile ? 26 : isMobile ? 30 : isTablet ? 36 : 42;
  const width = isSmallMobile ? 300 : isMobile ? 340 : isTablet ? 500 : 600;
  const height = isSmallMobile ? 180 : isMobile ? 200 : isTablet ? 250 : 300;
  const chartWidth = width - leftPadding - rightPadding;
  const chartHeight = height - topPadding - bottomPadding;

  const incomePoints = chartData.map((item, idx) => {
    const x = leftPadding + (idx / (chartData.length - 1)) * chartWidth;
    const y = height - bottomPadding - (item.income / maxValue) * chartHeight;
    return { x, y, value: item.income };
  });

  const expensePoints = chartData.map((item, idx) => {
    const x = leftPadding + (idx / (chartData.length - 1)) * chartWidth;
    const y = height - bottomPadding - (item.expense / maxValue) * chartHeight;
    return { x, y, value: item.expense };
  });

  const incomePathD = incomePoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const expensePathD = expensePoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-6 bg-white w-full overflow-x-hidden">
      <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-2 sm:mb-3 md:mb-4 border-b border-slate-200 pb-2">
        📊 Tren 7 Hari
      </h2>

      <div className="space-y-2 sm:space-y-3 md:space-y-4 w-full">
        {/* Legend - responsive with flex wrap */}
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 sm:w-4 h-1 bg-green-500 rounded flex-shrink-0"></div>
            <span className="font-bold whitespace-nowrap">Uang Masuk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 sm:w-4 h-1 bg-orange-500 rounded flex-shrink-0"></div>
            <span className="font-bold whitespace-nowrap">Uang Keluar</span>
          </div>
        </div>

        {/* Line Chart - responsive container with overflow handling */}
        <div className="overflow-x-auto w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full border border-gray-300 rounded"
            style={{ minWidth: `${width}px` }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y-axis */}
            <line
              x1={leftPadding}
              y1={topPadding}
              x2={leftPadding}
              y2={height - bottomPadding}
              stroke="#94a3b8"
              strokeWidth="2"
            />
            {/* X-axis */}
            <line
              x1={leftPadding}
              y1={height - bottomPadding}
              x2={width - rightPadding}
              y2={height - bottomPadding}
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - bottomPadding - ratio * chartHeight;
              const value = (ratio * maxValue).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              });
              const fontSize = isSmallMobile ? 7 : isMobile ? 8 : isTablet ? 9 : 11;
              return (
                <g key={`y-${ratio}`}>
                  <line
                    x1={leftPadding - 5}
                    y1={y}
                    x2={leftPadding}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={leftPadding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={fontSize}
                    fontWeight="bold"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => {
              const y = height - bottomPadding - ratio * chartHeight;
              return (
                <line
                  key={`grid-${ratio}`}
                  x1={leftPadding}
                  y1={y}
                  x2={width - rightPadding}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              );
            })}

            {/* Income line */}
            <path d={incomePathD} stroke="#16a34a" strokeWidth={isSmallMobile ? 1.5 : isMobile ? 2 : 3} fill="none" />

            {/* Expense line */}
            <path d={expensePathD} stroke="#ea580c" strokeWidth={isSmallMobile ? 1.5 : isMobile ? 2 : 3} fill="none" />

            {/* Income data points */}
            {incomePoints.map((p, idx) => (
              <circle
                key={`income-point-${idx}`}
                cx={p.x}
                cy={p.y}
                r={isSmallMobile ? 2.5 : isMobile ? 3.5 : 5}
                fill="#16a34a"
                stroke="white"
                strokeWidth={isSmallMobile ? 1 : isMobile ? 1.5 : 2}
              />
            ))}

            {/* Expense data points */}
            {expensePoints.map((p, idx) => (
              <circle
                key={`expense-point-${idx}`}
                cx={p.x}
                cy={p.y}
                r={isSmallMobile ? 2.5 : isMobile ? 3.5 : 5}
                fill="#ea580c"
                stroke="white"
                strokeWidth={isSmallMobile ? 1 : isMobile ? 1.5 : 2}
              />
            ))}

            {/* X-axis labels */}
            {chartData.map((item, idx) => {
              const point = incomePoints[idx];
              const fontSize = isSmallMobile ? 7 : isMobile ? 8 : isTablet ? 10 : 12;
              const labelOffset = isSmallMobile ? 12 : isMobile ? 14 : isTablet ? 18 : 20;
              return (
                <g key={`x-label-${idx}`}>
                  <line
                    x1={point.x}
                    y1={height - bottomPadding}
                    x2={point.x}
                    y2={height - bottomPadding + 4}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={point.x}
                    y={height - bottomPadding + labelOffset}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="bold"
                  >
                    {isSmallMobile ? item.day.substring(0, 2) : isMobile ? item.day.substring(0, 3) : item.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 sm:pt-3 md:pt-4 border-t border-slate-200 w-full">
          <div className="border-2 border-green-500 bg-green-50 p-2 sm:p-3 rounded text-center min-w-0">
            <p className="text-xs font-bold text-gray-600 mb-1 truncate">TOTAL MASUK</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 truncate">
              {(totalIncome / 1000000).toFixed(1)}jt
            </p>
          </div>
          <div className="border-2 border-orange-500 bg-orange-50 p-2 sm:p-3 rounded text-center min-w-0">
            <p className="text-xs font-bold text-gray-600 mb-1 truncate">TOTAL KELUAR</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-orange-600 truncate">
              {(totalExpense / 1000).toFixed(0)}rb
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState, type MouseEvent } from "react";

type HoverState = {
  index: number;
  x: number;
  left: number;
  top: number;
  below: boolean;
};

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
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  // Calculate SVG line paths - responsive sizing
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 360;
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 768;

  const leftPadding = isSmallMobile ? 48 : isMobile ? 56 : isTablet ? 68 : 84;
  const rightPadding = isSmallMobile ? 18 : isMobile ? 22 : isTablet ? 28 : 34;
  const topPadding = isSmallMobile ? 18 : isMobile ? 20 : isTablet ? 24 : 28;
  const bottomPadding = isSmallMobile ? 24 : isMobile ? 28 : isTablet ? 32 : 38;
  const width = isSmallMobile ? 300 : isMobile ? 340 : isTablet ? 500 : 600;
  const height = isSmallMobile ? 156 : isMobile ? 176 : isTablet ? 208 : 232;
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

  const createSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) return "";

    const path: string[] = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 0; i < points.length - 1; i += 1) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      path.push(`Q ${current.x} ${current.y} ${controlX} ${(current.y + next.y) / 2}`);
      path.push(`T ${next.x} ${next.y}`);
    }

    return path.join(" ");
  };

  const smoothIncomePathD = createSmoothPath(incomePoints);
  const smoothExpensePathD = createSmoothPath(expensePoints);

  const baselineY = height - bottomPadding;
  const incomeAreaPathD = `${smoothIncomePathD} L ${incomePoints[incomePoints.length - 1].x} ${baselineY} L ${incomePoints[0].x} ${baselineY} Z`;
  const expenseAreaPathD = `${smoothExpensePathD} L ${expensePoints[expensePoints.length - 1].x} ${baselineY} L ${expensePoints[0].x} ${baselineY} Z`;

  const handleChartMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;

    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const index = Math.round(ratio * (chartData.length - 1));
    const point = incomePoints[index];
    const left = (point.x / width) * rect.width;
    const top = (point.y / height) * rect.height;

    setHoverState({
      index,
      x: point.x,
      left,
      top,
      below: top < rect.height * 0.33,
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Performa Keuangan</h3>
          <p className="text-sm text-slate-500 font-medium">Ringkasan performa uang masuk dan uang keluar dalam satu tampilan.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 min-w-0">
          <div className="rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">Total Masuk</p>
            <p className="mt-1 text-sm font-black text-slate-950 tabular-nums">{(totalIncome / 1000000).toFixed(1)}jt</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-700">Total Keluar</p>
            <p className="mt-1 text-sm font-black text-slate-950 tabular-nums">{(totalExpense / 1000).toFixed(0)}rb</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-4.5 lg:p-5 w-full overflow-x-hidden">
        <div className="flex flex-wrap items-center gap-5 text-[13px] font-semibold text-slate-600 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            Uang Masuk
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            Uang Keluar
          </div>
        </div>

        <div className="relative overflow-x-auto w-full rounded-[24px] border border-slate-200/60 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_24px_rgba(15,23,42,0.04)]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block w-full rounded-xl"
            style={{ minWidth: `${width}px` }}
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleChartMove}
            onMouseLeave={() => setHoverState(null)}
          >
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
              <filter id="hoverGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="0 0 0 0 0.231 0 0 0 0 0.510 0 0 0 0 0.965 0 0 0 0.35 0"
                />
              </filter>
            </defs>

            <line
              x1={leftPadding}
              y1={topPadding}
              x2={leftPadding}
              y2={height - bottomPadding}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <line
              x1={leftPadding}
              y1={height - bottomPadding}
              x2={width - rightPadding}
              y2={height - bottomPadding}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

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
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <text
                    x={leftPadding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={fontSize}
                    fontWeight="bold"
                    fill="#94a3b8"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {[0.25, 0.5, 0.75].map((ratio) => {
              const y = height - bottomPadding - ratio * chartHeight;
              return (
                <line
                  key={`grid-${ratio}`}
                  x1={leftPadding}
                  y1={y}
                  x2={width - rightPadding}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4,7"
                />
              );
            })}

            <path d={incomeAreaPathD} fill="url(#incomeFill)" stroke="none" />
            <path d={expenseAreaPathD} fill="url(#expenseFill)" stroke="none" />

            <path d={smoothIncomePathD} stroke="#3b82f6" strokeWidth={isSmallMobile ? 2 : isMobile ? 2.5 : 3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={smoothExpensePathD} stroke="#f97316" strokeWidth={isSmallMobile ? 2 : isMobile ? 2.5 : 3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {hoverState && (
              <line
                x1={hoverState.x}
                y1={topPadding}
                x2={hoverState.x}
                y2={height - bottomPadding}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="3,5"
              />
            )}

            {incomePoints.map((p, idx) => (
              <g key={`income-point-${idx}`}>
                {hoverState?.index === idx && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSmallMobile ? 7 : isMobile ? 8 : 9}
                    fill="#2563eb"
                    opacity="0.12"
                    filter="url(#hoverGlow)"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSmallMobile ? 3 : isMobile ? 4 : 5.5}
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth={isSmallMobile ? 1.5 : isMobile ? 2 : 2.5}
                  opacity={hoverState?.index === idx ? 1 : 0.9}
                  className="transition-all duration-200"
                />
                <title>{`${chartData[idx].day}: uang masuk ${(chartData[idx].income / 1000).toFixed(1)}rb`}</title>
              </g>
            ))}

            {expensePoints.map((p, idx) => (
              <g key={`expense-point-${idx}`}>
                {hoverState?.index === idx && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSmallMobile ? 7 : isMobile ? 8 : 9}
                    fill="#f97316"
                    opacity="0.12"
                    filter="url(#hoverGlow)"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSmallMobile ? 3 : isMobile ? 4 : 5.5}
                  fill="#f97316"
                  stroke="white"
                  strokeWidth={isSmallMobile ? 1.5 : isMobile ? 2 : 2.5}
                  opacity={hoverState?.index === idx ? 1 : 0.9}
                  className="transition-all duration-200"
                />
                <title>{`${chartData[idx].day}: uang keluar ${(chartData[idx].expense / 1000).toFixed(1)}rb`}</title>
              </g>
            ))}

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
                    fill={hoverState?.index === idx ? "#0f172a" : "#475569"}
                  >
                    {isSmallMobile ? item.day.substring(0, 2) : isMobile ? item.day.substring(0, 3) : item.day}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoverState && (
            <div
              className="pointer-events-none absolute z-10 min-w-[200px] rounded-2xl border border-white/60 bg-white/80 px-3.5 py-3 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-200"
              style={{
                left: `${hoverState.left}px`,
                top: `${hoverState.below ? hoverState.top + 20 : Math.max(16, hoverState.top - 20)}px`,
                transform: hoverState.below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200/60 pb-1.5">
                {chartData[hoverState.index].day}
              </div>
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Masuk
                  </span>
                  <span className="font-black tabular-nums text-slate-950">
                    Rp {(chartData[hoverState.index].income / 1000).toFixed(1)}rb
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Keluar
                  </span>
                  <span className="font-black tabular-nums text-slate-950">
                    Rp {(chartData[hoverState.index].expense / 1000).toFixed(1)}rb
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

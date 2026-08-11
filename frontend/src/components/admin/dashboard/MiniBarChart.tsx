interface MiniBarChartProps {
  data: number[];
  colorClassName?: string;
}

/**
 * নোট: এখন শুধু একটা হালকা inline SVG bar-sparkline, নতুন কোনো npm ডিপেন্ডেন্সি
 * ছাড়াই। পূর্ণাঙ্গ ইন্টারঅ্যাক্টিভ চার্ট (টুলটিপ, legend, zoom) "Analytics" ধাপে
 * recharts দিয়ে তৈরি হবে — KPICard-এর ছোট ট্রেন্ড-প্রিভিউতে এটাই যথেষ্ট।
 */
export function MiniBarChart({ data, colorClassName = "fill-primary-500" }: MiniBarChartProps) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full overflow-visible" preserveAspectRatio="none">
      {data.map((value, i) => {
        const height = (value / max) * 28 + 2;
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.15}
            y={32 - height}
            width={barWidth * 0.7}
            height={height}
            rx={1}
            className={colorClassName}
          />
        );
      })}
    </svg>
  );
}

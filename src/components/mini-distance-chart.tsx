import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceDot } from 'recharts';

interface TimeDistanceDataPoint {
  distance: number;
  time: number;
  index: number;
  description?: string;
  isCurrent?: boolean;
}

interface FrameData {
  time: number;
  totalDistance?: number;
  description?: {
    pl: string;
    en: string;
  };
}

interface MiniTimeDistanceChartProps {
  frames: FrameData[];
  currentIndex: number;
  className?: string;
  language?: 'pl' | 'en';
}

export function MiniTimeDistanceChart({ frames, currentIndex, className = "", language = 'pl' }: MiniTimeDistanceChartProps) {
  // Prepare chart data - show frames around current index for context
  const chartData: TimeDistanceDataPoint[] = frames
    .slice(Math.max(0, currentIndex - 10), Math.min(frames.length, currentIndex + 10))
    .map((frame, relativeIndex) => {
      const actualIndex = Math.max(0, currentIndex - 10) + relativeIndex;
      return {
        distance: frame.totalDistance || 0,
        time: frame.time,
        index: actualIndex,
        description: frame.description ? frame.description[language] : undefined,
        isCurrent: actualIndex === currentIndex
      };
    });

  const currentFrame = chartData.find(point => point.isCurrent);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 shadow-lg text-xs">
          <p className="text-gray-900 dark:text-gray-100">
            <strong>Czas:</strong> {Math.floor(data.time / 60)}:{(data.time % 60).toFixed(0).padStart(2, '0')}
          </p>
          <p className="text-gray-900 dark:text-gray-100">
            <strong>Odległość:</strong> {data.distance}m
          </p>
          {data.description && (
            <p className="text-gray-900 dark:text-gray-100 max-w-40 truncate">
              <strong>Miejsce:</strong> {data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // If no data, return empty div
  if (chartData.length === 0) {
    return <div className={`h-8 ${className}`}></div>;
  }

  const minDistance = Math.min(...chartData.map(d => d.distance));
  const maxDistance = Math.max(...chartData.map(d => d.distance));
  const minTime = Math.min(...chartData.map(d => d.time));
  const maxTime = Math.max(...chartData.map(d => d.time));

  return (
    <div className={`h-8 w-24 ${className}`}>
      <LineChart
        width={130}
        height={32}
        data={chartData}
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <XAxis
          dataKey="distance"
          hide={true}
          domain={[minDistance, maxDistance]}
          type="number"
        />
        <YAxis
          dataKey="time"
          hide={true}
          domain={[minTime, maxTime]}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#ec4899', strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey="time"
          stroke="#ec4899"
          strokeWidth={1}
          dot={false}
          activeDot={{ r: 3, fill: '#ec4899' }}
        />
        {currentFrame && (
          <ReferenceDot
            x={currentFrame.distance}
            y={currentFrame.time}
            r={4}
            fill="#ef4444"
            stroke="#fff"
            strokeWidth={1}
          />
        )}
      </LineChart>
    </div>
  );
}

// Export with the same name for backward compatibility
export { MiniTimeDistanceChart as MiniDistanceChart };
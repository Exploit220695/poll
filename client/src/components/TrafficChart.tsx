import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface TrafficChartProps {
  data?: number[];
}

export default function TrafficChart({ data = [] }: TrafficChartProps) {
  // Generate sample data points for demonstration
  const chartData = data.length > 0 ? data : Array.from({ length: 24 }, (_, i) => {
    const baseValue = 100;
    const variation = Math.sin(i / 3) * 30 + Math.random() * 20;
    return Math.max(baseValue + variation, 20);
  });

  const maxValue = Math.max(...chartData);

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-dark-text">
            Real-time Traffic Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-dark-text-secondary">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container rounded-lg p-4 h-64 bg-gradient-to-br from-dark-card to-dark-border">
          <div className="h-full flex items-end justify-between gap-1">
            {chartData.map((value, index) => {
              const height = (value / maxValue) * 100;
              const isRecent = index > chartData.length - 6;
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col justify-end"
                >
                  <div
                    className={`${
                      isRecent ? 'bg-red-500' : 'bg-blue-500/70'
                    } rounded-t transition-all duration-300 min-h-[4px]`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-dark-text-secondary mt-1 text-center">
                    {index % 4 === 0 ? `${index}h` : ''}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-dark-text-secondary">
            <span>Last 24 hours</span>
            <span>{Math.round(chartData[chartData.length - 1])} req/min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

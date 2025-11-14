import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getCurrentWIB, formatWIBTime } from "../utils/timezone";
import StatsCards from "./StatsCards";
import TrafficChart from "./TrafficChart";
import ThreatModels from "./ThreatModels";
import AlertsList from "./AlertsList";
import AttackVectors from "./AttackVectors";
import LogAnalysisTable from "./LogAnalysisTable";
import type { WebSocketMessage, SystemMetrics, MlModel, Alert, TrafficLog } from "@shared/schema";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realtimeMetrics, setRealtimeMetrics] = useState<SystemMetrics | null>(null);
  const [realtimeAlerts, setRealtimeAlerts] = useState<Alert[]>([]);
  const [realtimeLogs, setRealtimeLogs] = useState<TrafficLog[]>([]);

  // Update time every second (WIB)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentWIB());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['/api/metrics'],
  });

  const { data: logsData } = useQuery({
    queryKey: ['/api/traffic-logs'],
  });

  const { data: attackVectors } = useQuery({
    queryKey: ['/api/attack-vectors'],
  });

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket((message: WebSocketMessage) => {
    switch (message.type) {
      case 'metrics_update':
        setRealtimeMetrics(message.data);
        break;
      case 'alert':
        setRealtimeAlerts(prev => [message.data, ...prev.slice(0, 9)]);
        break;
      case 'traffic_update':
        if (message.data.log) {
          setRealtimeLogs(prev => [message.data.log, ...prev.slice(0, 49)]);
        }
        break;
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/export/logs');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'traffic-logs.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // Use real-time data if available, fallback to initial data
  const metrics = realtimeMetrics || (dashboardData as any)?.metrics;
  const models: MlModel[] = (dashboardData as any)?.models || [];
  const alerts = realtimeAlerts.length > 0 ? realtimeAlerts : ((dashboardData as any)?.recentAlerts || []);
  const logs = realtimeLogs.length > 0 ? realtimeLogs : ((logsData as any)?.logs || []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-dark-text">
              Threat Detection Dashboard
            </h2>
            <p className="text-dark-text-secondary text-sm">
              Real-time honeypot monitoring and anomaly analysis
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-dark-bg rounded-lg px-3 py-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-dark-text-secondary">
                {formatWIBTime(currentTime)}
              </span>
            </div>
            <Button 
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="mr-2" size={16} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 h-full overflow-auto">
        {/* Stats Overview Cards */}
        <StatsCards
          totalRequests={metrics?.totalRequests || 0}
          detectedThreats={metrics?.detectedThreats || 0}
          anomalyScore={metrics?.anomalyScore || 0}
          mlAccuracy={metrics?.mlAccuracy || 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Real-time Traffic Chart */}
          <TrafficChart />
          
          {/* Threat Detection Models */}
          <ThreatModels models={models} />
        </div>

        {/* Recent Alerts and Attack Vectors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AlertsList alerts={alerts} />
          <AttackVectors vectors={(attackVectors as any) || {}} />
        </div>

        {/* Detailed Log Analysis Table */}
        <LogAnalysisTable
          logs={logs}
          total={(logsData as any)?.total || 0}
          onExport={handleExportLogs}
          onViewLog={(id) => console.log('View log:', id)}
        />
      </div>
    </main>
  );
}

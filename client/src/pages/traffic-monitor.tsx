import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Network, Activity, AlertTriangle, Search, Filter, Download } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WebSocketMessage, TrafficLog } from "@shared/schema";
import { formatDistanceToNowWIB, formatWIBDateTime } from "../utils/timezone";
import Sidebar from "@/components/Sidebar";

export default function TrafficMonitor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>("ALL");
  const [realtimeLogs, setRealtimeLogs] = useState<TrafficLog[]>([]);

  const { data: logsData, refetch } = useQuery({
    queryKey: ['/api/traffic-logs'],
  });

  // WebSocket untuk update real-time
  const { isConnected } = useWebSocket((message: WebSocketMessage) => {
    if (message.type === 'traffic_update' && message.data.log) {
      setRealtimeLogs(prev => [message.data.log, ...prev.slice(0, 99)]);
    }
  });

  const logs = realtimeLogs.length > 0 ? realtimeLogs : ((logsData as any)?.logs || []);

  // Filter logs berdasarkan pencarian dan threat level
  const filteredLogs = logs.filter((log: TrafficLog) => {
    const matchesSearch = searchTerm === "" || 
      log.sourceIp.includes(searchTerm) ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.classification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesThreatLevel = selectedThreatLevel === "ALL" || log.threatLevel === selectedThreatLevel;
    
    return matchesSearch && matchesThreatLevel;
  });

  const getThreatLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH': return 'bg-red-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-600';
      case 'POST': return 'bg-red-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/logs');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `traffic-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-dark-card border-b border-dark-border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-dark-text flex items-center">
                <Network className="mr-2" size={24} />
                Monitor Lalu Lintas Real-time
              </h2>
              <p className="text-dark-text-secondary text-sm">
                Pemantauan aktivitas jaringan dan deteksi ancaman untuk tniad.mil.id
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-dark-text-secondary">
                {isConnected ? 'Terhubung' : 'Terputus'}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 h-full overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Total Request</p>
                    <p className="text-2xl font-bold text-dark-text">{logs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Ancaman Terdeteksi</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {logs.filter((log: TrafficLog) => log.threatLevel !== 'LOW').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Network className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">IP Unik</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {new Set(logs.map((log: TrafficLog) => log.sourceIp)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Request/Menit</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {Math.round(logs.length / 60)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-dark-card border-dark-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-text-secondary" />
                    <Input
                      placeholder="Cari IP, endpoint, atau jenis serangan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-dark-bg border-dark-border text-dark-text"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedThreatLevel}
                  onChange={(e) => setSelectedThreatLevel(e.target.value)}
                  className="px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text"
                >
                  <option value="ALL">Semua Level</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>

                <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>

                <Button onClick={() => refetch()} className="bg-green-600 hover:bg-green-700">
                  <Activity className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Logs Table */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-lg">
                Log Lalu Lintas Real-time ({filteredLogs.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        Waktu
                      </th>
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        IP Sumber
                      </th>
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        Method
                      </th>
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        Endpoint
                      </th>
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        Threat Level
                      </th>
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        Klasifikasi
                      </th>
                      <th className="text-left py-3 px-4 text-dark-text-secondary font-medium">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 100).map((log: TrafficLog) => (
                      <tr key={log.id} className="border-b border-dark-border hover:bg-dark-bg">
                        <td className="py-3 px-4 text-dark-text text-sm">
                          <span title={formatWIBDateTime(log.timestamp)}>
                            {formatDistanceToNowWIB(log.timestamp)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-dark-text text-sm font-mono">
                          {log.sourceIp}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getMethodColor(log.method)} text-white text-xs`}>
                            {log.method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-dark-text text-sm font-mono max-w-xs truncate">
                          {log.endpoint}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getThreatLevelColor(log.threatLevel)} text-white text-xs`}>
                            {log.threatLevel}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-dark-text text-sm">
                          {log.classification}
                        </td>
                        <td className="py-3 px-4 text-dark-text text-sm">
                          {log.anomalyScore ? log.anomalyScore.toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
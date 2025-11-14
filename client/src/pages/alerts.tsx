import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  Code, 
  CheckCircle, 
  X, 
  Search,
  Clock,
  Filter
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WebSocketMessage, Alert } from "@shared/schema";
import { formatDistanceToNowWIB, formatWIBDateTime } from "../utils/timezone";
import Sidebar from "@/components/Sidebar";
// Note: apiRequest will be implemented when needed
// import { apiRequest } from "@/lib/queryClient";

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [showResolved, setShowResolved] = useState(false);
  const [realtimeAlerts, setRealtimeAlerts] = useState<Alert[]>([]);

  const queryClient = useQueryClient();

  const { data: alertsData, refetch } = useQuery({
    queryKey: ['/api/alerts'],
  });

  // WebSocket untuk alert real-time
  const { isConnected } = useWebSocket((message: WebSocketMessage) => {
    if (message.type === 'alert') {
      setRealtimeAlerts(prev => [message.data, ...prev.slice(0, 49)]);
    }
  });

  // Mutation untuk resolve alert (placeholder implementation)
  const resolveAlertMutation = {
    mutate: (alertId: string) => {
      console.log('Resolving alert:', alertId);
      // Implement actual API call when needed
    },
    isPending: false
  };

  const alerts = realtimeAlerts.length > 0 ? realtimeAlerts : ((alertsData as any) || []);

  // Filter alerts
  const filteredAlerts = alerts.filter((alert: Alert) => {
    const matchesSearch = searchTerm === "" || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.sourceIp && alert.sourceIp.includes(searchTerm)) ||
      alert.attackType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = selectedSeverity === "ALL" || alert.severity === selectedSeverity;
    const matchesResolved = showResolved || !alert.isResolved;
    
    return matchesSearch && matchesSeverity && matchesResolved;
  });

  const getAlertIcon = (attackType: string) => {
    switch (attackType.toLowerCase()) {
      case 'sql injection': return AlertTriangle;
      case 'xss attempt': return Code;
      case 'brute force': return Shield;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return {
        bg: 'bg-purple-900/20',
        border: 'border-purple-800',
        icon: 'bg-purple-600',
        text: 'text-purple-500'
      };
      case 'high': return {
        bg: 'bg-red-900/20',
        border: 'border-red-800',
        icon: 'bg-red-600',
        text: 'text-red-500'
      };
      case 'medium': return {
        bg: 'bg-yellow-900/20', 
        border: 'border-yellow-800',
        icon: 'bg-yellow-600',
        text: 'text-yellow-500'
      };
      case 'low': return {
        bg: 'bg-orange-900/20',
        border: 'border-orange-800', 
        icon: 'bg-orange-600',
        text: 'text-orange-500'
      };
      default: return {
        bg: 'bg-gray-900/20',
        border: 'border-gray-800',
        icon: 'bg-gray-600', 
        text: 'text-gray-500'
      };
    }
  };

  const severityStats = {
    critical: alerts.filter((a: Alert) => a.severity.toLowerCase() === 'critical' && !a.isResolved).length,
    high: alerts.filter((a: Alert) => a.severity.toLowerCase() === 'high' && !a.isResolved).length,
    medium: alerts.filter((a: Alert) => a.severity.toLowerCase() === 'medium' && !a.isResolved).length,
    low: alerts.filter((a: Alert) => a.severity.toLowerCase() === 'low' && !a.isResolved).length,
  };

  const handleResolveAlert = (alertId: string) => {
    if (resolveAlertMutation.mutate) {
      resolveAlertMutation.mutate(alertId);
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
                <Bell className="mr-2" size={24} />
                Manajemen Alert Keamanan
              </h2>
              <p className="text-dark-text-secondary text-sm">
                Pengelolaan peringatan dan notifikasi keamanan untuk tniad.mil.id
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-dark-text-secondary">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 h-full overflow-auto">
          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-dark-card border-dark-border border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Critical</p>
                    <p className="text-2xl font-bold text-purple-500">{severityStats.critical}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">High Risk</p>
                    <p className="text-2xl font-bold text-red-500">{severityStats.high}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Medium Risk</p>
                    <p className="text-2xl font-bold text-yellow-500">{severityStats.medium}</p>
                  </div>
                  <Code className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Low Risk</p>
                    <p className="text-2xl font-bold text-orange-500">{severityStats.low}</p>
                  </div>
                  <Bell className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-dark-card border-dark-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter & Pencarian Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-text-secondary" />
                    <Input
                      placeholder="Cari berdasarkan judul, IP, atau jenis serangan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-dark-bg border-dark-border text-dark-text"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text"
                >
                  <option value="ALL">Semua Tingkat</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <Button
                  variant={showResolved ? "default" : "outline"}
                  onClick={() => setShowResolved(!showResolved)}
                  className={showResolved ? "bg-green-600 hover:bg-green-700" : "border-dark-border"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {showResolved ? "Sembunyikan Resolved" : "Tampilkan Resolved"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-lg">
                Daftar Alert ({filteredAlerts.length} alert)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-dark-text-secondary mb-4" />
                  <p className="text-dark-text-secondary">Tidak ada alert yang sesuai filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert: Alert, index: number) => {
                    const Icon = getAlertIcon(alert.attackType);
                    const colors = getSeverityColor(alert.severity);
                    
                    return (
                      <div
                        key={`alert-${alert.id}-${index}-${alert.timestamp}`}
                        className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${
                          alert.isResolved ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`w-10 h-10 ${colors.icon} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <Icon className="text-white" size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h4 className="text-dark-text font-medium">{alert.title}</h4>
                                <Badge className={`${colors.text} ${colors.bg} border ${colors.border}`}>
                                  {alert.severity}
                                </Badge>
                                {alert.isResolved && (
                                  <Badge className="bg-green-600 text-white">
                                    Resolved
                                  </Badge>
                                )}
                              </div>
                              <p className="text-dark-text-secondary text-sm mb-2">
                                {alert.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-dark-text-secondary">
                                {alert.sourceIp && (
                                  <span>IP: <code className="bg-dark-bg px-1 rounded">{alert.sourceIp}</code></span>
                                )}
                                <span>Jenis: {alert.attackType}</span>
                                <span className="flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  <span title={formatWIBDateTime(alert.timestamp)}>
                                    {formatDistanceToNowWIB(alert.timestamp)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!alert.isResolved && (
                              <Button
                                size="sm"
                                onClick={() => handleResolveAlert(alert.id)}
                                disabled={resolveAlertMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
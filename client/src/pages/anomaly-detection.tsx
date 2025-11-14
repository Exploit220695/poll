import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, TrendingUp, Activity, RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function AnomalyDetection() {
  const [refreshInterval, setRefreshInterval] = useState(30);

  const { data: anomaliesData, refetch, isLoading } = useQuery({
    queryKey: ['/api/anomalies'],
    refetchInterval: refreshInterval * 1000,
  });

  const { data: modelsData } = useQuery({
    queryKey: ['/api/ml-models'],
  });

  const anomalies = (anomaliesData as any) || [];
  const models = (modelsData as any) || [];

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-red-900/20 border-red-800';
    if (score >= 0.6) return 'bg-yellow-900/20 border-yellow-800';
    return 'bg-green-900/20 border-green-800';
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
                <Brain className="mr-2" size={24} />
                Deteksi Anomali AI
              </h2>
              <p className="text-dark-text-secondary text-sm">
                Analisis perilaku abnormal menggunakan machine learning untuk tniad.mil.id
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text text-sm"
              >
                <option value={10}>10 detik</option>
                <option value={30}>30 detik</option>
                <option value={60}>1 menit</option>
                <option value={300}>5 menit</option>
              </select>
              <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 h-full overflow-auto">
          {/* ML Models Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {models.map((model: any) => (
              <Card key={model.id} className="bg-dark-card border-dark-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-dark-text">
                    {model.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      className={`${
                        model.status === 'active'
                          ? 'bg-green-600'
                          : model.status === 'training'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      } text-white text-xs`}
                    >
                      {model.status === 'active' ? 'Aktif' : 
                       model.status === 'training' ? 'Training' : 'Tidak Aktif'}
                    </Badge>
                    <span className="text-dark-text-secondary text-xs">
                      {model.algorithm.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {model.accuracy && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-text-secondary">Akurasi</span>
                        <span className="text-dark-text">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-dark-bg rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${model.accuracy * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Anomaly Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Anomali Kritis</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {anomalies.filter((a: any) => a.score >= 0.8).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Anomali Sedang</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {anomalies.filter((a: any) => a.score >= 0.6 && a.score < 0.8).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Total IP Dipantau</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {new Set(anomalies.map((a: any) => a.ip)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Brain className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-dark-text-secondary text-sm">Rata-rata Score</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {anomalies.length > 0
                        ? (anomalies.reduce((sum: number, a: any) => sum + a.score, 0) / anomalies.length).toFixed(2)
                        : '0.00'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detected Anomalies */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-lg">
                Anomali Terdeteksi ({anomalies.length} entri)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-dark-text-secondary">Menganalisis data...</span>
                </div>
              ) : anomalies.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-dark-text-secondary mb-4" />
                  <p className="text-dark-text-secondary">Tidak ada anomali terdeteksi saat ini</p>
                  <p className="text-dark-text-secondary text-sm mt-1">Sistem berfungsi normal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {anomalies.slice(0, 20).map((anomaly: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getScoreBackground(anomaly.score)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle 
                            className={`h-5 w-5 ${getScoreColor(anomaly.score)}`} 
                          />
                          <span className="font-mono text-dark-text font-medium">
                            {anomaly.ip}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getScoreColor(anomaly.score)}`}>
                            {(anomaly.score * 100).toFixed(0)}%
                          </span>
                          <p className="text-dark-text-secondary text-xs">
                            Tingkat Anomali
                          </p>
                        </div>
                      </div>
                      <p className="text-dark-text text-sm">
                        <strong>Alasan:</strong> {anomaly.reason}
                      </p>
                      
                      {/* Rekomendasi tindakan berdasarkan score */}
                      <div className="mt-3 pt-3 border-t border-dark-border">
                        <p className="text-dark-text-secondary text-xs">
                          <strong>Rekomendasi:</strong>
                          {anomaly.score >= 0.8 
                            ? " Blokir IP segera, lakukan investigasi mendalam"
                            : anomaly.score >= 0.6 
                            ? " Monitor lebih ketat, siapkan tindakan preventif"
                            : " Lanjutkan monitoring rutin"
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
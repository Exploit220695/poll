import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/Sidebar";
import { 
  Brain, 
  TrendingUp, 
  RefreshCw, 
  Settings, 
  Download,
  Activity,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNowWIB, formatWIBDateTime } from "../utils/timezone";

interface MLModel {
  id: string;
  name: string;
  type: 'supervised' | 'unsupervised' | 'sequence' | 'gradient_boosting';
  status: 'active' | 'training' | 'inactive';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  trainingSamples: number;
  features: string[];
  predictions: number;
  correctPredictions: number;
  falsePositives: number;
  falseNegatives: number;
  adaptiveLearning: boolean;
  noveltyDetection: boolean;
}

interface ModelPerformance {
  totalPredictions: number;
  overallAccuracy: number;
  threatsDetected: number;
  falseAlarms: number;
  modelUpdates: number;
}

export default function MLModelsPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const { data: models = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/ml-models-detailed'],
    queryFn: () => generateMLModelsData(),
    refetchInterval: 15000,
  });

  const { data: performance = {} } = useQuery({
    queryKey: ['/api/ml-performance'],
    queryFn: () => generatePerformanceData(),
    refetchInterval: 10000,
  });

  function generateMLModelsData(): MLModel[] {
    return [
      {
        id: 'xgb-001',
        name: 'XGBoost Classifier',
        type: 'supervised',
        status: 'active',
        accuracy: 0.96,
        precision: 0.954,
        recall: 0.967,
        f1Score: 0.96,
        lastTrained: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        trainingSamples: 75000,
        features: ['request_frequency', 'payload_entropy', 'endpoint_risk', 'ip_reputation', 'timing_pattern'],
        predictions: 4821,
        correctPredictions: 4628,
        falsePositives: 98,
        falseNegatives: 95,
        adaptiveLearning: true,
        noveltyDetection: true
      },
      {
        id: 'rf-001',
        name: 'Random Forest Classifier',
        type: 'supervised',
        status: 'active',
        accuracy: 0.92,
        precision: 0.89,
        recall: 0.94,
        f1Score: 0.91,
        lastTrained: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        trainingSamples: 15420,
        features: ['request_frequency', 'payload_size', 'endpoint_diversity', 'ip_reputation', 'user_agent_analysis'],
        predictions: 3456,
        correctPredictions: 3179,
        falsePositives: 142,
        falseNegatives: 135,
        adaptiveLearning: true,
        noveltyDetection: false
      },
      {
        id: 'if-001',
        name: 'Isolation Forest',
        type: 'unsupervised',
        status: 'active',
        accuracy: 0.87,
        precision: 0.83,
        recall: 0.91,
        f1Score: 0.87,
        lastTrained: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        trainingSamples: 28900,
        features: ['request_patterns', 'timing_anomalies', 'behavioral_analysis', 'sequence_patterns'],
        predictions: 2890,
        correctPredictions: 2514,
        falsePositives: 198,
        falseNegatives: 178,
        adaptiveLearning: true,
        noveltyDetection: true
      },
      {
        id: 'lstm-001',
        name: 'LSTM Neural Network',
        type: 'sequence',
        status: 'active',
        accuracy: 0.89,
        precision: 0.86,
        recall: 0.92,
        f1Score: 0.89,
        lastTrained: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        trainingSamples: 12340,
        features: ['sequence_patterns', 'temporal_analysis', 'session_behavior', 'request_flow'],
        predictions: 1892,
        correctPredictions: 1684,
        falsePositives: 98,
        falseNegatives: 110,
        adaptiveLearning: true,
        noveltyDetection: true
      },
      {
        id: 'ae-001',
        name: 'Autoencoder',
        type: 'unsupervised',
        status: 'active',
        accuracy: 0.91,
        precision: 0.88,
        recall: 0.93,
        f1Score: 0.90,
        lastTrained: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        trainingSamples: 19870,
        features: ['request_reconstruction', 'pattern_deviation', 'novelty_detection', 'entropy_analysis'],
        predictions: 2456,
        correctPredictions: 2235,
        falsePositives: 112,
        falseNegatives: 109,
        adaptiveLearning: true,
        noveltyDetection: true
      }
    ];
  }

  function generatePerformanceData(): ModelPerformance {
    return {
      totalPredictions: 15515,
      overallAccuracy: 0.919,
      threatsDetected: 2340,
      falseAlarms: 643,
      modelUpdates: 28
    };
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'training': return 'bg-blue-600 text-white';
      case 'inactive': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'training': return <Clock className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supervised': return <Target className="w-4 h-4" />;
      case 'unsupervised': return <Brain className="w-4 h-4" />;
      case 'sequence': return <Activity className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const selectedModelData = selectedModel ? models.find(m => m.id === selectedModel) : null;

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
                Model Machine Learning - TNIAD
              </h2>
              <p className="text-dark-text-secondary text-sm">
                Monitoring dan manajemen model AI untuk deteksi ancaman tniad.mil.id
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" className="border-dark-border">
                <Settings className="mr-2 h-4 w-4" />
                Konfigurasi
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 h-full overflow-auto">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Total Prediksi</p>
                    <p className="text-2xl font-bold text-dark-text">{performance.totalPredictions?.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Akurasi Keseluruhan</p>
                    <p className="text-2xl font-bold text-green-500">
                      {((performance.overallAccuracy || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Ancaman Terdeteksi</p>
                    <p className="text-2xl font-bold text-red-500">{performance.threatsDetected}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-text-secondary text-sm">Update Model</p>
                    <p className="text-2xl font-bold text-purple-500">{performance.modelUpdates}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Models List */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="mr-2" size={20} />
                  Daftar Model AI ({models.length} model)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="mx-auto h-8 w-8 text-dark-text-secondary animate-spin mb-4" />
                    <p className="text-dark-text-secondary">Memuat model...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {models.map((model, index) => (
                      <div
                        key={`model-${model.id}-${index}`}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedModel === model.id 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-dark-border bg-dark-bg hover:bg-dark-card'
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              {getTypeIcon(model.type)}
                            </div>
                            <div>
                              <h4 className="text-dark-text font-medium">{model.name}</h4>
                              <p className="text-dark-text-secondary text-sm capitalize">{model.type} learning</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(model.status)}>
                            {getStatusIcon(model.status)}
                            <span className="ml-1">{model.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-xs text-dark-text-secondary">Akurasi</p>
                            <p className="text-dark-text font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-dark-text-secondary">Prediksi</p>
                            <p className="text-dark-text font-medium">{model.predictions}</p>
                          </div>
                        </div>

                        <Progress 
                          value={model.accuracy * 100} 
                          className="h-2 bg-dark-bg"
                        />

                        <div className="flex items-center justify-between mt-2 text-xs text-dark-text-secondary">
                          <span>Adaptive Learning: {model.adaptiveLearning ? '✓' : '✗'}</span>
                          <span>Novelty Detection: {model.noveltyDetection ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Details */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Activity className="mr-2" size={20} />
                  Detail Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedModelData ? (
                  <div className="space-y-6">
                    {/* Model Info */}
                    <div>
                      <h4 className="text-dark-text font-medium mb-3">{selectedModelData.name}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-dark-text-secondary">Jenis</p>
                          <p className="text-dark-text capitalize">{selectedModelData.type} Learning</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-secondary">Status</p>
                          <Badge className={getStatusColor(selectedModelData.status)}>
                            {selectedModelData.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-secondary">Training Samples</p>
                          <p className="text-dark-text">{selectedModelData.trainingSamples.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-secondary">Terakhir Dilatih</p>
                          <p className="text-dark-text" title={formatWIBDateTime(selectedModelData.lastTrained)}>
                            {formatDistanceToNowWIB(selectedModelData.lastTrained)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h5 className="text-dark-text font-medium mb-3">Metrik Performa</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-dark-text-secondary">Akurasi</span>
                            <span className="text-sm text-dark-text">{(selectedModelData.accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={selectedModelData.accuracy * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-dark-text-secondary">Precision</span>
                            <span className="text-sm text-dark-text">{(selectedModelData.precision * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={selectedModelData.precision * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-dark-text-secondary">Recall</span>
                            <span className="text-sm text-dark-text">{(selectedModelData.recall * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={selectedModelData.recall * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-dark-text-secondary">F1 Score</span>
                            <span className="text-sm text-dark-text">{(selectedModelData.f1Score * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={selectedModelData.f1Score * 100} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {/* Prediction Stats */}
                    <div>
                      <h5 className="text-dark-text font-medium mb-3">Statistik Prediksi</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-dark-bg rounded border border-dark-border">
                          <p className="text-xs text-dark-text-secondary">Total Prediksi</p>
                          <p className="text-lg font-bold text-dark-text">{selectedModelData.predictions}</p>
                        </div>
                        <div className="p-3 bg-dark-bg rounded border border-dark-border">
                          <p className="text-xs text-dark-text-secondary">Prediksi Benar</p>
                          <p className="text-lg font-bold text-green-500">{selectedModelData.correctPredictions}</p>
                        </div>
                        <div className="p-3 bg-dark-bg rounded border border-dark-border">
                          <p className="text-xs text-dark-text-secondary">False Positive</p>
                          <p className="text-lg font-bold text-yellow-500">{selectedModelData.falsePositives}</p>
                        </div>
                        <div className="p-3 bg-dark-bg rounded border border-dark-border">
                          <p className="text-xs text-dark-text-secondary">False Negative</p>
                          <p className="text-lg font-bold text-red-500">{selectedModelData.falseNegatives}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h5 className="text-dark-text font-medium mb-3">Features yang Digunakan</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedModelData.features.map((feature, idx) => (
                          <Badge key={idx} className="bg-blue-900/20 text-blue-400 border border-blue-800">
                            {feature.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t border-dark-border">
                      <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retrain Model
                      </Button>
                      <Button variant="outline" className="border-dark-border">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-dark-text-secondary mb-4" />
                    <p className="text-dark-text-secondary">Pilih model untuk melihat detail</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
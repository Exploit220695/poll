import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Network, Layers } from "lucide-react";
import type { MlModel } from "@shared/schema";

interface ThreatModelsProps {
  models: MlModel[];
}

export default function ThreatModels({ models }: ThreatModelsProps) {
  const getModelIcon = (algorithm: string) => {
    switch (algorithm.toLowerCase()) {
      case 'random_forest': return TreePine;
      case 'isolation_forest': return Network;
      case 'lstm': return Layers;
      default: return Network;
    }
  };

  const getModelColor = (algorithm: string) => {
    switch (algorithm.toLowerCase()) {
      case 'random_forest': return 'green';
      case 'isolation_forest': return 'blue';
      case 'lstm': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-yellow-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-500';
      case 'training': return 'text-yellow-500';
      case 'inactive': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-dark-text">
          Threat Detection Models
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {models.map((model, index) => {
            const Icon = getModelIcon(model.algorithm);
            const color = getModelColor(model.algorithm);
            
            return (
              <div key={model.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`text-${color}-600`} size={20} />
                  </div>
                  <div>
                    <h4 className="text-dark-text font-medium">{model.name}</h4>
                    <p className="text-dark-text-secondary text-sm capitalize">
                      {model.type} {model.algorithm.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${getStatusColor(model.status)} rounded-full`}></div>
                    <span className={`text-sm ${getStatusText(model.status)} font-medium capitalize`}>
                      {model.status}
                    </span>
                  </div>
                  <p className="text-dark-text text-sm mt-1">
                    {model.status === 'training' ? 'Learning new patterns' : 
                     model.accuracy ? `${(model.accuracy * 100).toFixed(1)}% Accuracy` : 
                     'No data'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

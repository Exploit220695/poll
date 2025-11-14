import { Globe, AlertTriangle, Brain, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalRequests: number;
  detectedThreats: number;
  anomalyScore: number;
  mlAccuracy: number;
}

export default function StatsCards({ totalRequests, detectedThreats, anomalyScore, mlAccuracy }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Requests",
      value: totalRequests.toLocaleString(),
      change: "+12.5% from yesterday",
      changeType: "positive",
      icon: Globe,
      color: "green"
    },
    {
      title: "Detected Threats", 
      value: detectedThreats.toString(),
      change: "+8 in last hour",
      changeType: "negative",
      icon: AlertTriangle,
      color: "red"
    },
    {
      title: "Anomaly Score",
      value: `${anomalyScore.toFixed(1)}/10`,
      change: "Stable activity",
      changeType: "neutral",
      icon: Brain,
      color: "yellow"
    },
    {
      title: "ML Accuracy",
      value: `${mlAccuracy.toFixed(1)}%`,
      change: "Model performing well",
      changeType: "positive",
      icon: Bot,
      color: "blue"
    }
  ];

  const getGlowClass = (color: string) => {
    switch (color) {
      case "red": return "glow-red";
      case "green": return "glow-green";
      case "yellow": return "glow-yellow";
      default: return "";
    }
  };

  const getIconBgClass = (color: string) => {
    switch (color) {
      case "red": return "bg-red-100";
      case "green": return "bg-green-100";
      case "yellow": return "bg-yellow-100";
      case "blue": return "bg-blue-100";
      default: return "bg-gray-100";
    }
  };

  const getIconColorClass = (color: string) => {
    switch (color) {
      case "red": return "text-red-600";
      case "green": return "text-green-600";
      case "yellow": return "text-yellow-600";
      case "blue": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getChangeColorClass = (changeType: string) => {
    switch (changeType) {
      case "positive": return "text-green-500";
      case "negative": return "text-red-500";
      case "neutral": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`bg-dark-card border-dark-border ${getGlowClass(stat.color)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-text-secondary text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${getChangeColorClass(stat.changeType)}`}>
                    {stat.changeType === "positive" && <span>↗ </span>}
                    {stat.changeType === "negative" && <span>↗ </span>}
                    {stat.changeType === "neutral" && <span>→ </span>}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${getIconBgClass(stat.color)} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${getIconColorClass(stat.color)}`} size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

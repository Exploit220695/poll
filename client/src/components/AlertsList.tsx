import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Code, Clock } from "lucide-react";
import type { Alert } from "@shared/schema";
import { formatDistanceToNowWIB, formatWIBDateTime } from "../utils/timezone";
import { nanoid } from "nanoid";

interface AlertsListProps {
  alerts: Alert[];
}

export default function AlertsList({ alerts }: AlertsListProps) {
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
      case 'high': case 'critical': return {
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

  if (alerts.length === 0) {
    return (
      <Card className="lg:col-span-2 bg-dark-card border-dark-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-dark-text">
              Recent Security Alerts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-dark-text-secondary mb-4" />
            <p className="text-dark-text-secondary">No security alerts at this time</p>
            <p className="text-dark-text-secondary text-sm mt-1">System is monitoring for threats</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 bg-dark-card border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-dark-text">
            Recent Security Alerts
          </CardTitle>
          <Button variant="link" className="text-red-500 hover:text-red-400 font-medium">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => {
            const Icon = getAlertIcon(alert.attackType);
            const colors = getSeverityColor(alert.severity);
            
            return (
              <div
                key={`alert_${alert.timestamp}_${nanoid()}`}
                data-testid={`card-alert-${alert.id}`}
                className={`flex items-center justify-between p-4 ${colors.bg} border ${colors.border} rounded-lg`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${colors.icon} rounded-full flex items-center justify-center`}>
                    <Icon className="text-white" size={16} />
                  </div>
                  <div>
                    <h4 className="text-dark-text font-medium">{alert.title}</h4>
                    <p className="text-dark-text-secondary text-sm">
                      {alert.sourceIp && `IP: ${alert.sourceIp} | `}{alert.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`${colors.text} text-sm font-medium capitalize`}>
                    {alert.severity} Risk
                  </span>
                  <p className="text-dark-text-secondary text-xs mt-1 flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span title={formatWIBDateTime(alert.timestamp)}>
                      {formatDistanceToNowWIB(alert.timestamp)}
                    </span>
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

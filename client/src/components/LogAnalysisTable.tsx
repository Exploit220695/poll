import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Eye } from "lucide-react";
import type { TrafficLog } from "@shared/schema";
import { formatDistanceToNowWIB, formatWIBDateTime } from "../utils/timezone";
import { nanoid } from "nanoid";

interface LogAnalysisTableProps {
  logs: TrafficLog[];
  total: number;
  onViewLog?: (id: string) => void;
  onExport?: () => void;
}

export default function LogAnalysisTable({ logs, total, onViewLog, onExport }: LogAnalysisTableProps) {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-600';
      case 'POST': return 'bg-red-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH': return 'bg-red-600';
      case 'MEDIUM': case 'MED': return 'bg-yellow-600';
      case 'LOW': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-dark-text">
              Live Traffic Log Analysis
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button onClick={onExport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2" size={16} />
                Export
              </Button>
              <Button variant="outline" className="border-dark-border bg-dark-bg hover:bg-dark-border text-dark-text">
                <Filter className="mr-2" size={16} />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-dark-text-secondary">No traffic logs available</p>
            <p className="text-dark-text-secondary text-sm mt-1">Waiting for honeypot activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-dark-text">
            Live Traffic Log Analysis
          </CardTitle>
          <div className="flex items-center space-x-3">
            <Button onClick={onExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2" size={16} />
              Export
            </Button>
            <Button variant="outline" className="border-dark-border bg-dark-bg hover:bg-dark-border text-dark-text">
              <Filter className="mr-2" size={16} />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Source IP
                </th>
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Method
                </th>
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Endpoint
                </th>
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Threat Level
                </th>
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Classification
                </th>
                <th className="text-left py-3 px-4 text-dark-text-secondary text-sm font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={`traffic_${log.timestamp}_${nanoid()}`} className="border-b border-dark-border hover:bg-dark-bg" data-testid={`row-traffic-${log.id}`}>
                  <td className="py-3 px-4 text-dark-text text-sm">
                    <span title={formatWIBDateTime(log.timestamp)}>
                      {formatDistanceToNowWIB(log.timestamp)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-dark-text text-sm font-mono">
                    {log.sourceIp}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${getMethodColor(log.method)} text-white text-xs font-medium`}>
                      {log.method}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-dark-text text-sm font-mono">
                    {log.endpoint}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${getThreatLevelColor(log.threatLevel)} text-white text-xs font-medium`}>
                      {log.threatLevel}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-dark-text text-sm">
                    {log.classification}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewLog?.(log.id)}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <Eye className="mr-1" size={14} />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-border">
          <p className="text-dark-text-secondary text-sm">
            Showing 1-{logs.length} of {total.toLocaleString()} entries
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-dark-border bg-dark-bg hover:bg-dark-border text-dark-text-secondary">
              Previous
            </Button>
            <Button size="sm" className="bg-red-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm" className="border-dark-border bg-dark-bg hover:bg-dark-border text-dark-text-secondary">
              2
            </Button>
            <Button variant="outline" size="sm" className="border-dark-border bg-dark-bg hover:bg-dark-border text-dark-text-secondary">
              3
            </Button>
            <Button variant="outline" size="sm" className="border-dark-border bg-dark-bg hover:bg-dark-border text-dark-text-secondary">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

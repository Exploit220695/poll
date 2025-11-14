import { Router } from "express";
import { storage } from "../storage";
import { honeypotConfig } from "../config/honeypot.config";

const router = Router();

// Export traffic logs
router.get("/logs", async (req, res) => {
  try {
    const { format = "csv", startDate, endDate } = req.query;
    
    let logs;
    if (startDate && endDate) {
      logs = await storage.getTrafficLogsByTimeRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else {
      logs = await storage.getTrafficLogs();
    }

    const filename = `traffic-logs-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'csv':
        const csvData = convertToCSV(logs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvData);
        break;
        
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(logs);
        break;
        
      case 'xml':
        const xmlData = convertToXML(logs);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xml"`);
        res.send(xmlData);
        break;
        
      default:
        res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Export alerts
router.get("/alerts", async (req, res) => {
  try {
    const { format = "csv" } = req.query;
    const alerts = await storage.getAlerts();
    
    const filename = `alerts-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'csv':
        const csvData = convertAlertsToCSV(alerts);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvData);
        break;
        
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(alerts);
        break;
        
      default:
        res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    console.error('Export alerts error:', error);
    res.status(500).json({ error: 'Export alerts failed' });
  }
});

// Export analytics summary
router.get("/analytics", async (req, res) => {
  try {
    const logs = await storage.getTrafficLogs();
    const alerts = await storage.getAlerts();
    
    const analytics = {
      summary: {
        totalRequests: logs.length,
        totalAlerts: alerts.length,
        threatLevels: {
          high: logs.filter(l => l.threatLevel === 'HIGH').length,
          medium: logs.filter(l => l.threatLevel === 'MEDIUM').length,
          low: logs.filter(l => l.threatLevel === 'LOW').length
        },
        topIPs: getTopIPs(logs),
        topEndpoints: getTopEndpoints(logs),
        attackTypes: getAttackTypes(alerts)
      },
      configuration: honeypotConfig,
      generatedAt: new Date().toISOString()
    };

    const filename = `honeypot-analytics-${new Date().toISOString().split('T')[0]}`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.json(analytics);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: 'Export analytics failed' });
  }
});

// Helper functions
function convertToCSV(logs: any[]): string {
  if (logs.length === 0) return '';
  
  const headers = Object.keys(logs[0]).join(',');
  const rows = logs.map(log => 
    Object.values(log).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

function convertAlertsToCSV(alerts: any[]): string {
  if (alerts.length === 0) return '';
  
  const headers = Object.keys(alerts[0]).join(',');
  const rows = alerts.map(alert => 
    Object.values(alert).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

function convertToXML(logs: any[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<trafficLogs>\n';
  
  logs.forEach(log => {
    xml += '  <log>\n';
    Object.entries(log).forEach(([key, value]) => {
      xml += `    <${key}>${escapeXML(String(value))}</${key}>\n`;
    });
    xml += '  </log>\n';
  });
  
  xml += '</trafficLogs>';
  return xml;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getTopIPs(logs: any[]): Array<{ip: string, count: number}> {
  const ipCounts = logs.reduce((acc, log) => {
    acc[log.sourceIp] = (acc[log.sourceIp] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getTopEndpoints(logs: any[]): Array<{endpoint: string, count: number}> {
  const endpointCounts = logs.reduce((acc, log) => {
    acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({ endpoint, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getAttackTypes(alerts: any[]): Array<{type: string, count: number}> {
  const typeCounts = alerts.reduce((acc, alert) => {
    acc[alert.attackType] = (acc[alert.attackType] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count: count as number }))
    .sort((a, b) => b.count - a.count);
}

export default router;
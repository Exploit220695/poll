import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { trafficCapture } from "./services/trafficCapture";
import { anomalyDetection } from "./services/anomalyDetection";
import { honeypotIntegration } from "./services/honeypotIntegration";
import { insertTrafficLogSchema, insertAlertSchema, type WebSocketMessage } from "@shared/schema";
import exportRoutes from "./routes/export.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store WebSocket connections
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  function broadcast(message: WebSocketMessage) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // API Routes

  // Get system metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestMetrics();
      const models = await storage.getMlModels();
      const recentAlerts = await storage.getRecentAlerts(10);
      
      res.json({
        metrics,
        models,
        recentAlerts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Get traffic logs
  app.get("/api/traffic-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = await storage.getTrafficLogs(limit, offset);
      const total = await storage.getTrafficLogs(1000, 0); // Get total count
      
      res.json({
        logs,
        total: total.length,
        limit,
        offset
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic logs" });
    }
  });

  // Get traffic log by ID
  app.get("/api/traffic-logs/:id", async (req, res) => {
    try {
      const log = await storage.getTrafficLog(req.params.id);
      if (!log) {
        return res.status(404).json({ message: "Traffic log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic log" });
    }
  });

  // Get alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const alerts = await storage.getAlerts(limit, offset);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Get recent alerts
  app.get("/api/alerts/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const alerts = await storage.getRecentAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent alerts" });
    }
  });

  // Mark alert as resolved
  app.patch("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, { isResolved: true });
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Get ML models
  app.get("/api/ml-models", async (req, res) => {
    try {
      const models = await storage.getMlModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ML models" });
    }
  });

  // Get attack vector statistics
  app.get("/api/attack-vectors", async (req, res) => {
    try {
      const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const logs = await storage.getTrafficLogsByTimeRange(oneDay, new Date());
      
      const attackTypes: { [key: string]: number } = {};
      logs.forEach(log => {
        if (log.classification !== "Normal") {
          attackTypes[log.classification] = (attackTypes[log.classification] || 0) + 1;
        }
      });
      
      const total = Object.values(attackTypes).reduce((sum, count) => sum + count, 0);
      const percentages: { [key: string]: number } = {};
      
      Object.entries(attackTypes).forEach(([type, count]) => {
        percentages[type] = total > 0 ? Math.round((count / total) * 100) : 0;
      });
      
      res.json(percentages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attack vectors" });
    }
  });

  // Get anomaly detection results
  app.get("/api/anomalies", async (req, res) => {
    try {
      const anomalies = await anomalyDetection.detectAnomalies();
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ message: "Failed to detect anomalies" });
    }
  });

  // Honeypot Integration APIs
  
  // Get honeypot captured logs
  app.get("/api/honeypot/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = honeypotIntegration.getCapturedLogs(limit);
      res.json({
        logs,
        total: logs.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch honeypot logs" });
    }
  });

  // Get honeypot statistics
  app.get("/api/honeypot/stats", async (req, res) => {
    try {
      const stats = honeypotIntegration.getHoneypotStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch honeypot stats" });
    }
  });

  // Start honeypot monitoring
  app.post("/api/honeypot/start", async (req, res) => {
    try {
      honeypotIntegration.startMonitoring();
      res.json({ message: "Honeypot monitoring started successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start honeypot monitoring" });
    }
  });

  // Stop honeypot monitoring
  app.post("/api/honeypot/stop", async (req, res) => {
    try {
      honeypotIntegration.stopMonitoring();
      res.json({ message: "Honeypot monitoring stopped successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to stop honeypot monitoring" });
    }
  });

  // Mount export routes
  app.use("/api/export", exportRoutes);

  // Export traffic logs
  app.get("/api/export/logs", async (req, res) => {
    try {
      const logs = await storage.getTrafficLogs(1000, 0);
      const csv = [
        "Timestamp,Source IP,Method,Endpoint,Threat Level,Classification,Anomaly Score",
        ...logs.map(log => 
          `${log.timestamp},${log.sourceIp},${log.method},${log.endpoint},${log.threatLevel},${log.classification},${log.anomalyScore || 0}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=traffic-logs.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export logs" });
    }
  });

  // Simulate honeypot traffic (for demonstration)
  app.post("/api/simulate-traffic", async (req, res) => {
    try {
      await trafficCapture.generateSimulatedTraffic();
      
      // Broadcast real-time update
      const metrics = await storage.getLatestMetrics();
      broadcast({
        type: 'metrics_update',
        data: metrics
      });
      
      res.json({ message: "Traffic simulation completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate traffic" });
    }
  });

  // Start honeypot monitoring automatically
  honeypotIntegration.startMonitoring();
  console.log('[HoneyGuard] Honeypot monitoring started automatically');

  // Start traffic simulation interval (every 5 seconds for demo)
  setInterval(async () => {
    try {
      await trafficCapture.generateSimulatedTraffic();
      
      // Get updated data
      const metrics = await storage.getLatestMetrics();
      const recentLogs = await storage.getTrafficLogs(1, 0);
      const recentAlerts = await storage.getRecentAlerts(1);
      
      // Broadcast updates
      if (recentLogs.length > 0) {
        broadcast({
          type: 'traffic_update',
          data: {
            log: recentLogs[0],
            totalRequests: metrics?.totalRequests || 0,
            detectedThreats: metrics?.detectedThreats || 0
          }
        });
      }
      
      if (recentAlerts.length > 0 && recentAlerts[0].timestamp > new Date(Date.now() - 10000)) {
        broadcast({
          type: 'alert',
          data: recentAlerts[0]
        });
      }
      
      broadcast({
        type: 'metrics_update',
        data: metrics
      });
      
    } catch (error) {
      console.error("Traffic simulation error:", error);
    }
  }, 5000);

  return httpServer;
}

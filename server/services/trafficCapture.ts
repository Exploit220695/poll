import { storage } from "../storage";
import { type InsertTrafficLog, type InsertAlert } from "@shared/schema";
import { mlEngine } from "./mlEngine.js";
import { anomalyDetection } from "./anomalyDetection.js";

export interface CapturedRequest {
  ip: string;
  method: string;
  url: string;
  userAgent?: string;
  payload?: string;
  headers?: Record<string, string>;
}

export class TrafficCapture {
  private attackPatterns = {
    sqlInjection: [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bDROP\b.*\bTABLE\b)/i,
      /(\bINSERT\b.*\bINTO\b)/i,
      /(\'\s*OR\s*\'\d*\'\s*=\s*\'\d*)/i,
      /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i
    ],
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror\s*=/gi
    ],
    bruteForce: [
      /admin/i,
      /login/i,
      /password/i,
      /auth/i
    ]
  };

  async processRequest(request: CapturedRequest): Promise<void> {
    try {
      // Analyze request for threats
      const analysis = await this.analyzeRequest(request);
      
      // Create traffic log
      const trafficLog = await storage.createTrafficLog({
        sourceIp: request.ip,
        method: request.method,
        endpoint: request.url,
        userAgent: request.userAgent,
        payload: request.payload,
        responseCode: 200, // Default response
        threatLevel: analysis.threatLevel,
        classification: analysis.classification,
        isBlocked: analysis.isBlocked,
        anomalyScore: analysis.anomalyScore,
        mlPrediction: analysis.mlPrediction
      });

      // Create alert if threat detected
      if (analysis.threatLevel !== "LOW") {
        await storage.createAlert({
          title: analysis.alertTitle,
          description: analysis.alertDescription,
          severity: analysis.threatLevel,
          sourceIp: request.ip,
          attackType: analysis.classification,
          trafficLogId: trafficLog.id
        });
      }

      // Update system metrics
      await this.updateMetrics();
      
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }

  private async analyzeRequest(request: CapturedRequest) {
    const payload = request.payload || "";
    const url = request.url || "";
    const userAgent = request.userAgent || "";
    
    // Check for SQL Injection
    const sqlInjectionDetected = this.attackPatterns.sqlInjection.some(pattern => 
      pattern.test(payload) || pattern.test(url)
    );

    // Check for XSS
    const xssDetected = this.attackPatterns.xss.some(pattern =>
      pattern.test(payload) || pattern.test(url)
    );

    // Check for Brute Force (multiple attempts to auth endpoints)
    const bruteForceDetected = this.attackPatterns.bruteForce.some(pattern =>
      pattern.test(url)
    ) && request.method === "POST";

    // Use ML for anomaly detection
    const mlPrediction = await mlEngine.predict({
      sourceIp: request.ip,
      method: request.method,
      endpoint: request.url,
      payloadLength: payload.length,
      userAgent: userAgent
    });

    const anomalyScore = await anomalyDetection.calculateAnomalyScore(request);

    // Determine threat level and classification
    let threatLevel = "LOW";
    let classification = "Normal";
    let alertTitle = "";
    let alertDescription = "";
    let isBlocked = false;

    if (sqlInjectionDetected) {
      threatLevel = "HIGH";
      classification = "SQL Injection";
      alertTitle = "SQL Injection Detected";
      alertDescription = `Malicious SQL injection attempt from ${request.ip} on ${request.url}`;
      isBlocked = true;
    } else if (xssDetected) {
      threatLevel = "MEDIUM";
      classification = "XSS Attempt";
      alertTitle = "XSS Attack Blocked";
      alertDescription = `Cross-site scripting attempt detected from ${request.ip}`;
      isBlocked = true;
    } else if (bruteForceDetected) {
      threatLevel = "MEDIUM";
      classification = "Brute Force";
      alertTitle = "Brute Force Attempt";
      alertDescription = `Multiple authentication attempts detected from ${request.ip}`;
      isBlocked = false;
    } else if (anomalyScore > 0.7) {
      threatLevel = "MEDIUM";
      classification = "Anomalous Behavior";
      alertTitle = "Anomalous Traffic Pattern";
      alertDescription = `Unusual traffic pattern detected from ${request.ip} (Score: ${anomalyScore.toFixed(2)})`;
      isBlocked = false;
    }

    return {
      threatLevel,
      classification,
      alertTitle,
      alertDescription,
      isBlocked,
      anomalyScore,
      mlPrediction
    };
  }

  private async updateMetrics() {
    const logs = await storage.getTrafficLogs(1000, 0);
    const alerts = await storage.getRecentAlerts(100);
    const models = await storage.getMlModels();
    
    const totalRequests = logs.length;
    const detectedThreats = alerts.filter(alert => !alert.isResolved).length;
    const anomalyScore = logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.anomalyScore || 0), 0) / logs.length 
      : 0;
    const mlAccuracy = models.length > 0
      ? models.reduce((sum, model) => sum + (model.accuracy || 0), 0) / models.length
      : 0;

    await storage.createMetrics({
      totalRequests,
      detectedThreats,
      anomalyScore: anomalyScore * 10, // Scale to 0-10
      mlAccuracy: mlAccuracy * 100, // Convert to percentage
      systemStatus: "online"
    });
  }

  // Simulate realistic traffic for demonstration
  async generateSimulatedTraffic() {
    const attackIps = ["192.168.1.100", "203.45.67.89", "198.123.45.67", "10.0.0.15"];
    const normalIps = ["172.16.0.1", "192.168.1.50", "10.1.1.100", "203.0.113.45"];
    const endpoints = ["/login", "/admin", "/search", "/api/users", "/dashboard", "/profile"];
    const methods = ["GET", "POST", "PUT", "DELETE"];

    const scenarios = [
      // SQL Injection attack
      {
        ip: attackIps[0],
        method: "POST",
        url: "/login",
        payload: "username=admin' OR '1'='1&password=test",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      // XSS attack
      {
        ip: attackIps[2],
        method: "POST", 
        url: "/search",
        payload: "q=<script>alert('XSS')</script>",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
      // Brute force
      {
        ip: attackIps[1],
        method: "POST",
        url: "/admin",
        payload: "username=admin&password=123456",
        userAgent: "curl/7.68.0"
      },
      // Normal traffic
      {
        ip: normalIps[0],
        method: "GET",
        url: "/dashboard",
        payload: "",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    ];

    // Process a random scenario
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    await this.processRequest(scenario);
  }
}

export const trafficCapture = new TrafficCapture();

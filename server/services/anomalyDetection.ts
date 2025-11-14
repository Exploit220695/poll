import { mlEngine } from "./mlEngine";
import { type CapturedRequest } from "./trafficCapture";
import { storage } from "../storage";

export class AnomalyDetection {
  private thresholds = {
    isolationForest: 0.6,
    requestFrequency: 100, // requests per minute
    payloadSize: 10000, // bytes
    suspiciousIpBehavior: 0.8
  };

  async calculateAnomalyScore(request: CapturedRequest): Promise<number> {
    const scores: number[] = [];
    
    // ML-based anomaly detection
    const features = {
      sourceIp: request.ip,
      method: request.method,
      endpoint: request.url,
      payloadLength: request.payload?.length || 0,
      userAgent: request.userAgent || ""
    };
    
    const numericFeatures = this.featurize(features);
    const isolationScore = mlEngine.calculateIsolationScore(numericFeatures);
    scores.push(isolationScore);
    
    // Frequency-based anomaly detection
    const frequencyScore = await this.calculateFrequencyAnomaly(request.ip);
    scores.push(frequencyScore);
    
    // Payload size anomaly
    const payloadScore = this.calculatePayloadAnomaly(request.payload?.length || 0);
    scores.push(payloadScore);
    
    // Behavioral anomaly
    const behaviorScore = await this.calculateBehavioralAnomaly(request.ip, request.url);
    scores.push(behaviorScore);
    
    // Return weighted average
    const weights = [0.4, 0.2, 0.2, 0.2];
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < scores.length; i++) {
      weightedSum += scores[i] * weights[i];
      totalWeight += weights[i];
    }
    
    return weightedSum / totalWeight;
  }

  private featurize(features: any): number[] {
    return [
      this.ipToNumeric(features.sourceIp),
      this.methodToNumeric(features.method),
      this.endpointToNumeric(features.endpoint),
      Math.min(features.payloadLength / 1000, 1),
      this.userAgentToNumeric(features.userAgent)
    ];
  }

  private ipToNumeric(ip: string): number {
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
  }

  private methodToNumeric(method: string): number {
    const methodMap: { [key: string]: number } = {
      'GET': 0.1,
      'POST': 0.3,
      'PUT': 0.2,
      'DELETE': 0.4,
      'PATCH': 0.25
    };
    return methodMap[method] || 0.5;
  }

  private endpointToNumeric(endpoint: string): number {
    const sensitivePatterns = [/admin/, /login/, /auth/, /api/, /config/];
    let score = 0.1;
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(endpoint.toLowerCase())) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private userAgentToNumeric(userAgent: string): number {
    const suspiciousPatterns = [/bot/i, /crawler/i, /scanner/i, /curl/i, /wget/i];
    let score = 0.1;
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private async calculateFrequencyAnomaly(ip: string): Promise<number> {
    // Get recent requests from this IP
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentLogs = await storage.getTrafficLogsByTimeRange(oneMinuteAgo, new Date());
    const ipRequests = recentLogs.filter(log => log.sourceIp === ip);
    
    const requestCount = ipRequests.length;
    
    if (requestCount > this.thresholds.requestFrequency) {
      return Math.min(requestCount / this.thresholds.requestFrequency, 1.0);
    }
    
    return requestCount / this.thresholds.requestFrequency;
  }

  private calculatePayloadAnomaly(payloadSize: number): number {
    if (payloadSize > this.thresholds.payloadSize) {
      return Math.min(payloadSize / this.thresholds.payloadSize, 1.0);
    }
    
    return payloadSize / this.thresholds.payloadSize;
  }

  private async calculateBehavioralAnomaly(ip: string, endpoint: string): Promise<number> {
    // Check historical behavior patterns for this IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const historicalLogs = await storage.getTrafficLogsByTimeRange(oneHourAgo, new Date());
    const ipLogs = historicalLogs.filter(log => log.sourceIp === ip);
    
    if (ipLogs.length === 0) {
      return 0.3; // New IP gets moderate score
    }
    
    // Check for unusual endpoint access patterns
    const uniqueEndpoints = new Set(ipLogs.map(log => log.endpoint));
    const endpointDiversity = uniqueEndpoints.size / ipLogs.length;
    
    // Check for method diversity
    const uniqueMethods = new Set(ipLogs.map(log => log.method));
    const methodDiversity = uniqueMethods.size;
    
    // Higher diversity in short time = more suspicious
    let behaviorScore = 0;
    
    if (endpointDiversity > 0.8) behaviorScore += 0.3;
    if (methodDiversity > 3) behaviorScore += 0.3;
    
    // Check for access to sensitive endpoints
    const sensitiveAccess = ipLogs.some(log => 
      /admin|login|auth|config/i.test(log.endpoint)
    );
    
    if (sensitiveAccess) behaviorScore += 0.4;
    
    return Math.min(behaviorScore, 1.0);
  }

  async detectAnomalies(): Promise<{ ip: string; score: number; reason: string }[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await storage.getTrafficLogsByTimeRange(oneHourAgo, new Date());
    
    // Group by IP
    const ipGroups = new Map<string, typeof recentLogs>();
    recentLogs.forEach(log => {
      if (!ipGroups.has(log.sourceIp)) {
        ipGroups.set(log.sourceIp, []);
      }
      ipGroups.get(log.sourceIp)!.push(log);
    });
    
    const anomalies: { ip: string; score: number; reason: string }[] = [];
    
    Array.from(ipGroups.entries()).forEach(([ip, logs]) => {
      const avgAnomalyScore = logs.reduce((sum: number, log: any) => 
        sum + (log.anomalyScore || 0), 0) / logs.length;
      
      if (avgAnomalyScore > 0.7) {
        let reason = "High anomaly score detected";
        
        if (logs.length > 50) reason += ", High request frequency";
        if (logs.some((log: any) => (log.payload?.length || 0) > 5000)) {
          reason += ", Large payloads";
        }
        if (new Set(logs.map((log: any) => log.endpoint)).size > 10) {
          reason += ", Diverse endpoint access";
        }
        
        anomalies.push({
          ip,
          score: avgAnomalyScore,
          reason
        });
      }
    });
    
    return anomalies.sort((a, b) => b.score - a.score);
  }
}

export const anomalyDetection = new AnomalyDetection();

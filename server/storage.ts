import { 
  type User, 
  type InsertUser, 
  type TrafficLog, 
  type InsertTrafficLog,
  type Alert,
  type InsertAlert,
  type MlModel,
  type InsertMlModel,
  type SystemMetrics,
  type InsertSystemMetrics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Traffic log methods
  getTrafficLogs(limit?: number, offset?: number): Promise<TrafficLog[]>;
  getTrafficLog(id: string): Promise<TrafficLog | undefined>;
  createTrafficLog(log: InsertTrafficLog): Promise<TrafficLog>;
  getTrafficLogsByTimeRange(start: Date, end: Date): Promise<TrafficLog[]>;
  getTrafficStatsByThreatLevel(): Promise<{ [key: string]: number }>;

  // Alert methods
  getAlerts(limit?: number, offset?: number): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  getRecentAlerts(limit: number): Promise<Alert[]>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;

  // ML Model methods
  getMlModels(): Promise<MlModel[]>;
  getMlModel(id: string): Promise<MlModel | undefined>;
  createMlModel(model: InsertMlModel): Promise<MlModel>;
  updateMlModel(id: string, updates: Partial<MlModel>): Promise<MlModel | undefined>;

  // System metrics methods
  getLatestMetrics(): Promise<SystemMetrics | undefined>;
  createMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  getMetricsHistory(limit: number): Promise<SystemMetrics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trafficLogs: Map<string, TrafficLog>;
  private alerts: Map<string, Alert>;
  private mlModels: Map<string, MlModel>;
  private systemMetrics: Map<string, SystemMetrics>;

  constructor() {
    this.users = new Map();
    this.trafficLogs = new Map();
    this.alerts = new Map();
    this.mlModels = new Map();
    this.systemMetrics = new Map();

    // Initialize with default ML models
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default ML models
    await this.createMlModel({
      name: "XGBoost Classifier",
      type: "gradient_boosting",
      algorithm: "xgboost",
      status: "active",
      accuracy: 0.96,
      precision: 0.954,
      recall: 0.967,
      lastTrained: new Date(),
      trainingData: { features: ["request_frequency", "payload_entropy", "endpoint_risk", "ip_reputation", "timing_pattern"], samples: 75000 }
    });

    await this.createMlModel({
      name: "Random Forest",
      type: "supervised",
      algorithm: "random_forest",
      status: "active",
      accuracy: 0.92,
      precision: 0.915,
      recall: 0.928,
      lastTrained: new Date(),
      trainingData: { features: ["ip", "method", "payload", "user_agent"], samples: 50000 }
    });

    await this.createMlModel({
      name: "Isolation Forest",
      type: "unsupervised", 
      algorithm: "isolation_forest",
      status: "active",
      accuracy: 0.87,
      precision: 0.865,
      recall: 0.882,
      lastTrained: new Date(),
      trainingData: { features: ["request_size", "response_time", "session_duration"], samples: 35000 }
    });

    await this.createMlModel({
      name: "LSTM Neural Network",
      type: "sequence",
      algorithm: "lstm",
      status: "active",
      accuracy: 0.89,
      precision: 0.883,
      recall: 0.895,
      lastTrained: new Date(),
      trainingData: { features: ["sequence_patterns", "temporal_features"], samples: 60000 }
    });

    await this.createMlModel({
      name: "Autoencoder",
      type: "unsupervised",
      algorithm: "autoencoder",
      status: "active",
      accuracy: 0.91,
      precision: 0.902,
      recall: 0.917,
      lastTrained: new Date(),
      trainingData: { features: ["request_reconstruction", "pattern_deviation", "novelty_detection"], samples: 55000 }
    });

    // Create initial system metrics
    await this.createMetrics({
      totalRequests: 24567,
      detectedThreats: 147,
      anomalyScore: 7.2,
      mlAccuracy: 94.7,
      systemStatus: "online"
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Traffic log methods
  async getTrafficLogs(limit = 50, offset = 0): Promise<TrafficLog[]> {
    const logs = Array.from(this.trafficLogs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
    return logs;
  }

  async getTrafficLog(id: string): Promise<TrafficLog | undefined> {
    return this.trafficLogs.get(id);
  }

  async createTrafficLog(insertLog: InsertTrafficLog): Promise<TrafficLog> {
    const id = `traffic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const log: TrafficLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
      threatLevel: insertLog.threatLevel || "LOW",
      classification: insertLog.classification || "Normal",
      isBlocked: insertLog.isBlocked || false,
      anomalyScore: insertLog.anomalyScore || 0,
      userAgent: insertLog.userAgent || null,
      payload: insertLog.payload || null,
      responseCode: insertLog.responseCode || null,
      mlPrediction: insertLog.mlPrediction || null,
    };
    this.trafficLogs.set(id, log);
    return log;
  }

  async getTrafficLogsByTimeRange(start: Date, end: Date): Promise<TrafficLog[]> {
    return Array.from(this.trafficLogs.values()).filter(log => {
      const timestamp = new Date(log.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  }

  async getTrafficStatsByThreatLevel(): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    Array.from(this.trafficLogs.values()).forEach(log => {
      stats[log.threatLevel] = (stats[log.threatLevel] || 0) + 1;
    });
    return stats;
  }

  // Alert methods
  async getAlerts(limit = 50, offset = 0): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
    return alerts;
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: new Date(),
      isResolved: insertAlert.isResolved || false,
      sourceIp: insertAlert.sourceIp || null,
      trafficLogId: insertAlert.trafficLogId || null,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getRecentAlerts(limit: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, ...updates };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  // ML Model methods
  async getMlModels(): Promise<MlModel[]> {
    return Array.from(this.mlModels.values());
  }

  async getMlModel(id: string): Promise<MlModel | undefined> {
    return this.mlModels.get(id);
  }

  async createMlModel(insertModel: InsertMlModel): Promise<MlModel> {
    const id = randomUUID();
    const model: MlModel = { 
      ...insertModel, 
      id,
      status: insertModel.status || "inactive",
      accuracy: insertModel.accuracy || null,
      precision: insertModel.precision || null,
      recall: insertModel.recall || null,
      lastTrained: insertModel.lastTrained || null,
      trainingData: insertModel.trainingData || null
    };
    this.mlModels.set(id, model);
    return model;
  }

  async updateMlModel(id: string, updates: Partial<MlModel>): Promise<MlModel | undefined> {
    const model = this.mlModels.get(id);
    if (model) {
      const updatedModel = { ...model, ...updates };
      this.mlModels.set(id, updatedModel);
      return updatedModel;
    }
    return undefined;
  }

  // System metrics methods
  async getLatestMetrics(): Promise<SystemMetrics | undefined> {
    const metrics = Array.from(this.systemMetrics.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return metrics[0];
  }

  async createMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = randomUUID();
    const metrics: SystemMetrics = {
      ...insertMetrics,
      id,
      timestamp: new Date(),
      totalRequests: insertMetrics.totalRequests || 0,
      detectedThreats: insertMetrics.detectedThreats || 0,
      anomalyScore: insertMetrics.anomalyScore || 0,
      mlAccuracy: insertMetrics.mlAccuracy || 0,
      systemStatus: insertMetrics.systemStatus || "online"
    };
    this.systemMetrics.set(id, metrics);
    return metrics;
  }

  async getMetricsHistory(limit: number): Promise<SystemMetrics[]> {
    return Array.from(this.systemMetrics.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();

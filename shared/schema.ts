import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trafficLogs = pgTable("traffic_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sourceIp: text("source_ip").notNull(),
  method: text("method").notNull(),
  endpoint: text("endpoint").notNull(),
  userAgent: text("user_agent"),
  payload: text("payload"),
  responseCode: integer("response_code"),
  threatLevel: text("threat_level").notNull().default("LOW"), // LOW, MEDIUM, HIGH
  classification: text("classification").notNull().default("Normal"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  anomalyScore: real("anomaly_score").default(0),
  mlPrediction: jsonb("ml_prediction"),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  sourceIp: text("source_ip"),
  attackType: text("attack_type").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  trafficLogId: varchar("traffic_log_id").references(() => trafficLogs.id),
});

export const mlModels = pgTable("ml_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // supervised, unsupervised
  algorithm: text("algorithm").notNull(), // random_forest, isolation_forest, lstm
  status: text("status").notNull().default("inactive"), // active, inactive, training
  accuracy: real("accuracy").default(0),
  precision: real("precision").default(0),
  recall: real("recall").default(0),
  lastTrained: timestamp("last_trained"),
  trainingData: jsonb("training_data"),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  totalRequests: integer("total_requests").notNull().default(0),
  detectedThreats: integer("detected_threats").notNull().default(0),
  anomalyScore: real("anomaly_score").notNull().default(0),
  mlAccuracy: real("ml_accuracy").notNull().default(0),
  systemStatus: text("system_status").notNull().default("online"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrafficLogSchema = createInsertSchema(trafficLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
});

export const insertMlModelSchema = createInsertSchema(mlModels).omit({
  id: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TrafficLog = typeof trafficLogs.$inferSelect;
export type InsertTrafficLog = z.infer<typeof insertTrafficLogSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type MlModel = typeof mlModels.$inferSelect;
export type InsertMlModel = z.infer<typeof insertMlModelSchema>;

export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;

// WebSocket message types
export interface WebSocketMessage {
  type: 'traffic_update' | 'alert' | 'metrics_update' | 'ml_status';
  data: any;
}

export interface TrafficUpdate {
  log: TrafficLog;
  totalRequests: number;
  detectedThreats: number;
}

export interface MetricsUpdate {
  totalRequests: number;
  detectedThreats: number;
  anomalyScore: number;
  mlAccuracy: number;
}

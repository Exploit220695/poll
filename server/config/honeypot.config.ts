import { z } from "zod";

// Schema untuk konfigurasi honeypot
export const HoneypotConfigSchema = z.object({
  targetDomain: z.string().default("tniad.mil.id"),
  targetDescription: z.string().default("Indonesian Army Command Website Honeypot"),
  honeypotType: z.enum(["web", "ftp", "ssh", "database"]).default("web"),
  
  // Konfigurasi monitoring
  monitoring: z.object({
    enabled: z.boolean().default(true),
    realTimeUpdates: z.boolean().default(true),
    alertThreshold: z.number().min(0).max(1).default(0.7),
    maxLogsRetention: z.number().default(10000),
    exportFormat: z.enum(["csv", "json", "xml"]).default("csv")
  }),

  // Tools toggles: enable/disable features and columns
  tools: z.object({
    exportEnabled: z.boolean().default(true),
    alertsEnabled: z.boolean().default(true),
    analyticsEnabled: z.boolean().default(true),
    mlEnabled: z.boolean().default(true),
    websocketEnabled: z.boolean().default(true)
  }),

  // Column visibility for logs table (UI reads this to show/hide columns)
  toolsColumns: z.record(z.boolean()).default({
    timestamp: true,
    sourceIp: true,
    endpoint: true,
    method: true,
    status: true,
    threatLevel: true,
    attackType: true,
    userAgent: true
  }),

  // Konfigurasi ML dan deteksi ancaman
  detection: z.object({
    mlModelsEnabled: z.boolean().default(true),
    anomalyThreshold: z.number().min(0).max(1).default(0.6),
    autoBlockThreats: z.boolean().default(false),
    sensitiveEndpoints: z.array(z.string()).default([
      "/admin", "/login", "/auth", "/config", "/dashboard",
      "/api", "/database", "/backup", "/logs", "/system"
    ])
  }),

  // Konfigurasi khusus untuk tniad.mil.id
  tniadSettings: z.object({
    mimicRealSite: z.boolean().default(true),
    customPages: z.array(z.string()).default([
      "/berita", "/struktur-organisasi", "/layanan", "/kontak",
      "/pengumuman", "/data-personel", "/operasi", "/latihan"
    ]),
    indonesianContent: z.boolean().default(true),
    militaryTerminology: z.boolean().default(true)
  }),

  // Konfigurasi alert dan notifikasi
  alerts: z.object({
    emailNotifications: z.boolean().default(false),
    webhookUrl: z.string().optional(),
    discordWebhook: z.string().optional(),
    telegramBotToken: z.string().optional(),
    telegramChatId: z.string().optional()
  }),

  // Konfigurasi database dan penyimpanan
  storage: z.object({
    type: z.enum(["memory", "postgresql"]).default("memory"),
    backupEnabled: z.boolean().default(true),
    backupInterval: z.number().default(3600),
    maxBackupFiles: z.number().default(10)
  })
});

export type HoneypotConfig = z.infer<typeof HoneypotConfigSchema>;

// Konfigurasi default untuk tniad.mil.id
export const defaultTniadConfig: HoneypotConfig = {
  targetDomain: "tniad.mil.id",
  targetDescription: "Sistem Honeypot untuk Website Komando Tentara Nasional Indonesia - Angkatan Darat",
  honeypotType: "web",
  
  monitoring: {
    enabled: true,
    realTimeUpdates: true,
    alertThreshold: 0.7,
    maxLogsRetention: 50000,
    exportFormat: "csv"
  },

  tools: {
    exportEnabled: true,
    alertsEnabled: true,
    analyticsEnabled: true,
    mlEnabled: true,
    websocketEnabled: true
  },

  toolsColumns: {
    timestamp: true,
    sourceIp: true,
    endpoint: true,
    method: true,
    status: true,
    threatLevel: true,
    attackType: true,
    userAgent: true
  },

  detection: {
    mlModelsEnabled: true,
    anomalyThreshold: 0.6,
    autoBlockThreats: false,
    sensitiveEndpoints: [
      "/admin", "/login", "/auth", "/dashboard", "/api",
      "/berita/admin", "/struktur-organisasi/internal", 
      "/data-personel", "/operasi/rahasia", "/sistem-informasi",
      "/database", "/backup", "/logs", "/config"
    ]
  },

  tniadSettings: {
    mimicRealSite: true,
    customPages: [
      "/", "/beranda", "/profil", "/berita", "/pengumuman",
      "/struktur-organisasi", "/satuan", "/layanan", "/kontak",
      "/data-personel", "/sistem-informasi", "/operasi",
      "/latihan", "/sejarah", "/visi-misi", "/galeri"
    ],
    indonesianContent: true,
    militaryTerminology: true
  },

  alerts: {
    emailNotifications: false,
    webhookUrl: undefined,
    discordWebhook: undefined,
    telegramBotToken: undefined,
    telegramChatId: undefined
  },

  storage: {
    type: "memory",
    backupEnabled: true,
    backupInterval: 1800,
    maxBackupFiles: 20
  }
};

// Fungsi untuk memuat konfigurasi
export function loadHoneypotConfig(): HoneypotConfig {
  try {
    return defaultTniadConfig;
  } catch (error) {
    console.warn("Failed to load honeypot config, using defaults:", error);
    return defaultTniadConfig;
  }
}

// Fungsi untuk menyimpan konfigurasi
export function saveHoneypotConfig(config: HoneypotConfig): boolean {
  try {
    HoneypotConfigSchema.parse(config);
    console.log("Honeypot configuration saved:", config.targetDomain);
    return true;
  } catch (error) {
    console.error("Failed to save honeypot config:", error);
    return false;
  }
}

export const honeypotConfig = loadHoneypotConfig();

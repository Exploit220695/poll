// server/integrate-traffic.ts
// Integrasi ke server Express utama:
// - pasang middleware pencatat per-request ke TrafficStats
// - buat Socket.IO terlampir ke http.Server
// - pasang namespace waktu dan traffic emitter
// - mount endpoint mitigasi, attacks, detections, targets, export
// - terapkan requireAdmin pada endpoint admin
// Komentar dan pesan dalam Bahasa Indonesia.

import http from "http";
import { Express } from "express";
import { Server } from "socket.io";
import mitigationRouter from "./mitigation-endpoints";
import { TrafficStats } from "./traffic-stats";
import { pasangNamespaceWaktu } from "./time-socket";
import { mulaiEmitterTraffic } from "./traffic-emitter";
import { mulaiMonitor } from "./honeypot-monitor";
import { AttackDetector } from "./attack-detector";
import makeAttacksRouter from "./routes/attacks";
import makeDetectionsRouter from "./routes/detections";
import targetsRouter from "./routes/targets";
import exportRouter from "./routes/export";
import { requireAdmin } from "./middleware/auth";

/**
 * initTraffic
 * app: instance Express
 * server: http.Server yang sudah dibuat di server utama
 */
export function initTraffic(app: Express, server: http.Server) {
  // Buat instance Socket.IO terlampir ke server HTTP
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // Buat statistik lalu lintas (efisien)
  const trafficStats = new TrafficStats(60);

  // Buat AttackDetector
  const attackDetector = new AttackDetector(io);

  // Middleware: catat setiap request (sebelum route lain)
  app.use((req, res, next) => {
    // Ambil IP dan info request
    const ipHeader = req.headers["x-forwarded-for"];
    const ip = typeof ipHeader === "string" ? ipHeader.split(",")[0].trim() : (req.ip || (req.socket && req.socket.remoteAddress) || "unknown");
    const method = req.method;
    const path = req.path;
    const headers = req.headers;
    // Port: jika client menyertakan port pada header host
    let port: number | undefined = undefined;
    const hostHeader = headers["host"];
    if (hostHeader && typeof hostHeader === "string") {
      const parts = hostHeader.split(":");
      if (parts.length > 1) port = Number(parts[1]);
    }

    // catat ke trafficStats (efisien)
    trafficStats.tambahEvent(String(ip));

    // kirim event lebih detail ke attackDetector
    attackDetector.tambahEvent({ ip, method, path, headers, port, ts: Date.now() });

    next();
  });

  // Mount router mitigasi (proteksi admin)
  app.use("/api/mitigation", requireAdmin, mitigationRouter);

  // Mount API attacks & detections
  // - Buat router attacks yang mengizinkan GET publik tapi memerlukan admin untuk POST/DELETE via middleware di router.
  app.use("/api/attacks", makeAttacksRouter(attackDetector));
  app.use("/api/detections", makeDetectionsRouter(attackDetector));

  // Mount targets router; melindungi POST/DELETE dengan requireAdmin di sini
  // targetsRouter menyediakan GET semua default; kita melindungi operasi yang membutuhkan admin
  app.use("/api/targets", targetsRouter);

  // Mount export router (protect with admin)
  app.use("/api/export", requireAdmin, exportRouter);

  // Pasang namespace waktu dan emitter traffic
  pasangNamespaceWaktu(io);
  mulaiEmitterTraffic(io, trafficStats, 1000);

  // Mulai monitor honeypot (membaca data/targets.json)
  mulaiMonitor(io, 30_000, 50);

  // Kembalikan objek penting untuk referensi jika diperlukan
  return { io, trafficStats, attackDetector };
}

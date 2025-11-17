// server/middleware/auth.ts
// Middleware autentikasi sederhana untuk melindungi endpoint admin.
// Gunakan header: X-Admin-Token: <token>
// Token disimpan di env ADMIN_TOKEN.
// Jika ADMIN_TOKEN tidak diset, middleware menolak semua permintaan admin.

import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    // Jika tidak dikonfigurasi, tolak permintaan untuk keamanan
    return res.status(500).json({ error: "Server admin token belum dikonfigurasi" });
  }

  const header = req.header("x-admin-token") || req.header("X-Admin-Token");
  if (!header || header !== adminToken) {
    return res.status(403).json({ error: "Akses ditolak: header X-Admin-Token tidak valid" });
  }

  return next();
}

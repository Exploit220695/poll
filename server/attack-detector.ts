import fs from "fs";
import path from "path";
import { Server } from "socket.io";

const DATA_FILE = path.join(process.cwd(), "data", "attacks.json");
const DETECTIONS_LOG = path.join(process.cwd(), "data", "detections.json");

export type AttackRule = {
  id: string;
  nama: string;
  teknik: string;
  deskripsi?: string;
  match: any;
  createdAt?: number;
};

export type Detection = {
  ts: number;
  ruleId: string;
  nama: string;
  teknik: string;
  ip?: string;
  details?: any;
};

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
  if (!fs.existsSync(DETECTIONS_LOG)) fs.writeFileSync(DETECTIONS_LOG, "[]", "utf8");
}

export class AttackDetector {
  private rules: AttackRule[] = [];
  private events: any[] = [];
  private io?: Server;
  private detections: Detection[] = [];

  constructor(io?: Server) {
    ensureDataDir();
    this.io = io;
    this.loadRules();
    this.loadDetections();
  }

  loadRules() {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf8") || "[]";
      this.rules = JSON.parse(raw);
    } catch (err) {
      console.error("Gagal memuat rule serangan:", err);
      this.rules = [];
    }
  }

  saveRules() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.rules, null, 2), "utf8");
  }

  loadDetections() {
    try {
      this.detections = JSON.parse(fs.readFileSync(DETECTIONS_LOG, "utf8") || "[]");
    } catch {
      this.detections = [];
    }
  }

  saveDetections() {
    fs.writeFileSync(DETECTIONS_LOG, JSON.stringify(this.detections.slice(-1000), null, 2), "utf8");
  }

  listRules() { return this.rules; }

  addRule(rule: Partial<AttackRule>): AttackRule {
    const newRule: AttackRule = {
      id: (rule.id || `rule-${Date.now()}-${Math.random().toString(36).slice(2,6)}`),
      nama: rule.nama || "Unnamed",
      teknik: rule.teknik || "unknown",
      deskripsi: rule.deskripsi || "",
      match: rule.match || {},
      createdAt: Date.now()
    };
    this.rules.push(newRule);
    this.saveRules();
    return newRule;
  }

  removeRule(id: string) { this.rules = this.rules.filter(r => r.id !== id); this.saveRules(); }

  tambahEvent(event: { ts?: number; ip?: string; method?: string; path?: string; headers?: any; port?: number; size?: number }) {
    const ev = { ts: event.ts || Date.now(), ...event };
    this.events.push(ev);
    const now = Date.now();
    const windowMs = 60 * 1000;
    while (this.events.length && this.events[0].ts < now - windowMs) this.events.shift();
    this.evaluateRules(ev);
  }

  private evaluateRules(latestEvent: any) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const windowEvents = this.events.filter(e => e.ts >= now - windowMs);
    const rps = windowEvents.length / (windowMs / 1000);
    const uniqueIps = new Set(windowEvents.map(e => e.ip)).size;

    for (const rule of this.rules) {
      const m = rule.match || {};
      let matched = false;
      const details: any = { rps, uniqueIps, latest: latestEvent };

      if (m.type === "rps_and_port") {
        const ports = m.ports || [];
        if (ports.length === 0) {
          if (rps >= (m.minRps || 0)) matched = true;
        } else {
          const portCount = windowEvents.filter(e => ports.includes(e.port)).length;
          const portRps = portCount / (windowMs / 1000);
          details.portRps = portRps;
          if (portRps >= (m.minRps || 0)) matched = true;
        }
      } else if (m.type === "path_and_uniqueips") {
        const re = m.pathRegex ? new RegExp(m.pathRegex) : null;
        const matchedEvents = windowEvents.filter(e => re ? re.test(e.path || "") : true);
        const localRps = matchedEvents.length / (windowMs / 1000);
        const localUniqueIps = new Set(matchedEvents.map(e => e.ip)).size;
        details.localRps = localRps;
        details.localUniqueIps = localUniqueIps;
        if (localRps >= (m.minRps || 0) && localUniqueIps >= (m.minUniqueIps || 0)) matched = true;
      } else if (m.type === "header_contains") {
        const key = m.headerKey;
        const value = m.headerValue;
        if (latestEvent.headers && latestEvent.headers[key] && String(latestEvent.headers[key]).includes(value)) matched = true;
      } else if (m.type === "port_only") {
        if ((m.port && latestEvent.port === m.port) || (Array.isArray(m.ports) && m.ports.includes(latestEvent.port))) matched = true;
      } else if (m.type === "custom") {
        matched = false;
      } else {
        if (rps >= (m.minRps || 1e9)) matched = true;
      }

      if (matched) {
        const det: Detection = {
          ts: Date.now(),
          ruleId: rule.id,
          nama: rule.nama,
          teknik: rule.teknik,
          ip: latestEvent.ip,
          details
        };
        this.recordDetection(det);
      }
    }
  }

  private recordDetection(det: Detection) {
    this.detections.push(det);
    this.saveDetections();
    try { this.io?.of("/attacks").emit("detection", det); } catch (err) { console.error("Gagal emit detection:", err); }
    console.warn("DETEKSI:", det.teknik, det.nama, det.details);
  }

  listDetections(limit = 200) { return this.detections.slice(-limit).reverse(); }
}

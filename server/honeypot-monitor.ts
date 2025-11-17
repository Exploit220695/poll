// server/honeypot-monitor.ts
// Honeypot monitor yang menggunakan concurrency limit sederhana.
// Emit hasil ke namespace /honeypot.
// Perubahan: batasi koneksi paralel agar tidak membuka banyak socket sekaligus.

import net from "net";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";

const CONFIG_FILE = path.join(process.cwd(), "data", "targets.json");

// baca targets dari file
function bacaTargets() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return [];
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8") || "[]");
  } catch (err) {
    console.error("Gagal baca targets:", err);
    return [];
  }
}

// concurrency-limited runner
async function runWithLimit<T>(items: T[], limit: number, fn: (it: T) => Promise<any>) {
  const results: any[] = [];
  let idx = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) break;
      try {
        results[i] = await fn(items[i]);
      } catch (e) {
        results[i] = e;
      }
    }
  });
  await Promise.all(workers);
  return results;
}

export function mulaiMonitor(io: Server, intervalMs = 30_000, concurrency = 50) {
  setInterval(async () => {
    const targets = bacaTargets();
    // flatten tasks (domain, port)
    const tasks = [];
    for (const t of targets) {
      const ports = Array.isArray(t.ports) ? t.ports : [];
      for (const p of ports) tasks.push({ domain: t.domain, port: p });
    }

    // run checks with concurrency limit
    await runWithLimit(tasks, concurrency, async (task) => {
      const alive = await checkTcp(task.domain, task.port, 2000).catch(() => false);
      io.of("/honeypot").emit("port-status", {
        domain: task.domain,
        port: task.port,
        alive,
        ts: Date.now(),
      });
      return null;
    });
  }, intervalMs);
}

function checkTcp(host: string, port: number, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const onDone = (alive: boolean) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(alive);
    };

    socket.setTimeout(timeout);
    socket.once("connect", () => onDone(true));
    socket.once("timeout", () => onDone(false));
    socket.once("error", () => onDone(false));
    socket.connect(port, host);
  });
}

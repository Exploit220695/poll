// server/traffic-stats.ts
// Implementasi efisien untuk menghitung RPS dan unique IP window.
// - fixed-size bucket per detik (sliding window)
// - Map untuk per-IP counts dengan eviksi berbasis lastSeen
// Semua komentar & pesan dalam Bahasa Indonesia.

export type Snapshot = {
  ts: number;
  rps: number;
  uniqueIPs: number;
  totalRequests: number;
};

export class TrafficStats {
  private windowSeconds: number;
  private buckets: number[]; // counts per second
  private bucketStartSec: number; // epoch second of buckets[0]
  private totalInWindow: number;
  private ipCounts: Map<string, { count: number; lastSeenSec: number }>;

  constructor(windowSeconds = 60) {
    this.windowSeconds = windowSeconds;
    this.buckets = new Array(windowSeconds).fill(0);
    this.bucketStartSec = Math.floor(Date.now() / 1000);
    this.totalInWindow = 0;
    this.ipCounts = new Map();
  }

  private rollTo(nowSec: number) {
    const elapsed = nowSec - this.bucketStartSec;
    if (elapsed <= 0) return;
    if (elapsed >= this.windowSeconds) {
      // reset all
      this.buckets.fill(0);
      this.bucketStartSec = nowSec;
      this.totalInWindow = 0;
      return;
    }
    // slide window
    for (let i = 0; i < elapsed; i++) {
      const idx = (i + (this.bucketStartSec % this.windowSeconds)) % this.windowSeconds;
      this.totalInWindow -= this.buckets[idx];
      this.buckets[idx] = 0;
    }
    this.bucketStartSec = nowSec;
  }

  tambahEvent(ip?: string) {
    const nowSec = Math.floor(Date.now() / 1000);
    this.rollTo(nowSec);
    const offset = (nowSec - this.bucketStartSec) % this.windowSeconds;
    const idx = (this.bucketStartSec + offset) % this.windowSeconds;
    // increment bucket
    this.buckets[idx] = (this.buckets[idx] || 0) + 1;
    this.totalInWindow += 1;

    // update ipCounts
    if (ip) {
      const prev = this.ipCounts.get(ip);
      if (prev) {
        prev.count += 1;
        prev.lastSeenSec = nowSec;
      } else {
        this.ipCounts.set(ip, { count: 1, lastSeenSec: nowSec });
      }
    }

    // evict stale IPs (lazy)
    const cutoff = nowSec - this.windowSeconds;
    for (const [k, v] of this.ipCounts) {
      if (v.lastSeenSec < cutoff) this.ipCounts.delete(k);
    }
  }

  snapshot(): Snapshot {
    const nowSec = Math.floor(Date.now() / 1000);
    this.rollTo(nowSec);
    const rps = this.totalInWindow / this.windowSeconds;
    return {
      ts: Date.now(),
      rps,
      uniqueIPs: this.ipCounts.size,
      totalRequests: this.totalInWindow,
    };
  }
}

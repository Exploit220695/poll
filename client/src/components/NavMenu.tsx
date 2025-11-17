import React from "react";
import { Link } from "wouter";

export default function NavMenu() {
  return (
    <nav className="p-4">
      <ul className="flex gap-4">
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/dashboard/real-time">Grafik Real-time</Link></li>
        <li><Link href="/dashboard/targets">Konfigurasi Target</Link></li>
        <li><Link href="/dashboard/attacks">Daftar Rule</Link></li>
        <li><Link href="/dashboard/detections">Deteksi</Link></li>
        <li><Link href="/dashboard/export">Export</Link></li>
      </ul>
    </nav>
  );
}

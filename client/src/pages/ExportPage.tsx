import React, { useState } from "react";

export default function ExportPage() {
  const [status, setStatus] = useState("");

  async function download(type: string, format: string) {
    setStatus("Mempersiapkan download...");
    try {
      const res = await fetch(`/api/export?type=${type}&format=${format}`);
      if (!res.ok) throw new Error("Gagal mengunduh");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Selesai");
    } catch (err: any) {
      setStatus("Gagal: " + (err?.message || err));
    }
  }

  return (
    <div className="p-4">
      <h3>Export Data</h3>
      <div>
        <button onClick={() => download("detections", "csv")}>Download Detections (CSV)</button>
        <button onClick={() => download("detections", "json")}>Download Detections (JSON)</button>
      </div>
      <div className="mt-2">
        <button onClick={() => download("attacks", "csv")}>Download Attacks (CSV)</button>
        <button onClick={() => download("targets", "csv")}>Download Targets (CSV)</button>
      </div>
      <div className="mt-2 text-sm">{status}</div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

type Config = any;

export default function ToolsPanel() {
  const [config, setConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="p-4 text-red-600">Error loading config: {error}</div>;
  if (!config) return <div className="p-4">Loading tools config…</div>;

  const toggle = (path: string[]) => {
    const updated = { ...config };
    let node: any = updated;
    for (let i = 0; i < path.length - 1; i++) {
      node = node[path[i]];
    }
    const key = path[path.length - 1];
    node[key] = !node[key];
    setConfig(updated);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools: config.tools,
          toolsColumns: config.toolsColumns
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Tools Configuration</h3>

      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.tools.exportEnabled} onChange={() => toggle(["tools","exportEnabled"])} />
          Export Enabled
        </label>
        <label className="flex items-center gap-2 mt-1">
          <input type="checkbox" checked={config.tools.alertsEnabled} onChange={() => toggle(["tools","alertsEnabled"])} />
          Alerts Enabled
        </label>
        <label className="flex items-center gap-2 mt-1">
          <input type="checkbox" checked={config.tools.analyticsEnabled} onChange={() => toggle(["tools","analyticsEnabled"])} />
          Analytics Enabled
        </label>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold">Visible Columns</h4>
        {Object.entries(config.toolsColumns).map(([col, visible]: any) => (
          <label key={col} className="flex items-center gap-2">
            <input type="checkbox" checked={visible} onChange={() => toggle(["toolsColumns", col])} />
            <span className="capitalize">{col}</span>
          </label>
        ))}
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Configuration"}
      </button>
    </div>
  );
}

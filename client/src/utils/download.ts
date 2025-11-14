export async function downloadExport(url: string, defaultFilename?: string) {
  const resp = await fetch(url, {
    credentials: "same-origin",
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Export failed: ${resp.status} ${resp.statusText} ${text}`);
  }

  const disposition = resp.headers.get("Content-Disposition") || "";
  let filename = defaultFilename || "export";
  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match && match[1]) filename = match[1];

  const blob = await resp.blob();
  const urlBlob = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = urlBlob;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);
}

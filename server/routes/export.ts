// server/routes/export.ts
// Endpoint export untuk streaming data (detections, attacks, targets).
// Query: ?type=detections|attacks|targets&format=csv|json

import express from "express";
import path from "path";
import fs from "fs";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";
import { stringify } from "csv-stringify";

const router = express.Router();

function fileForType(type: string) {
  if (type === "detections") return path.join(process.cwd(), "data", "detections.json");
  if (type === "attacks") return path.join(process.cwd(), "data", "attacks.json");
  if (type === "targets") return path.join(process.cwd(), "data", "targets.json");
  return null;
}

router.get("/", (req, res) => {
  const type = String(req.query.type || "detections");
  const format = String(req.query.format || "csv");

  const file = fileForType(type);
  if (!file || !fs.existsSync(file)) return res.status(404).json({ error: "Data tidak ditemukan" });

  if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${type}.json"`);
    fs.createReadStream(file).pipe(res);
    return;
  }

  // CSV streaming
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${type}.csv"`);

  const pipeline = chain([
    fs.createReadStream(file),
    parser(),
    streamArray(),
    (data: any) => data.value,
    stringify({ header: true })
  ]);
  pipeline.pipe(res);
});

export default router;

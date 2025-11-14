import { Router } from "express";
import { honeypotConfig, saveHoneypotConfig } from "../config/honeypot.config";

const router = Router();

// GET current config (read-only representation)
router.get("/", (_req, res) => {
  res.json(honeypotConfig);
});

// PATCH partial update to config (only top-level props included in body will be updated)
router.patch("/", async (req, res) => {
  try {
    const incoming = req.body;
    // shallow merge of incoming into existing (for nested objects you may want deep merge)
    const updated = { ...honeypotConfig, ...incoming };

    const ok = saveHoneypotConfig(updated as any);
    if (!ok) return res.status(400).json({ error: "Invalid configuration" });
    return res.json({ success: true, config: updated });
  } catch (error) {
    console.error("Failed to update config:", error);
    return res.status(500).json({ error: "Save failed" });
  }
});

export default router;

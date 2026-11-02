import { Hono } from "hono";
import type { CookerTelemetry } from "../types/cooker.js";

const device = new Hono();

let latestTelemetry: CookerTelemetry | null = null;

export function updateTelemetry(data: CookerTelemetry) {
  latestTelemetry = data;
}

device.get("/status", (c) => {
  return c.json({
    success: true,
    connected: latestTelemetry?.connected ?? false,
    data: latestTelemetry
  });
});

device.get("/health", (c) => {
  return c.json({
    success: true,
    service: "mcl02m-monitor",
    mode: "read-only"
  });
});

export default device;

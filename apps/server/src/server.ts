import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import {
  connectCooker,
  disconnectCooker,
  isCookerConnected,
  readCookerTelemetry,
} from "./device/cooker.js";
import { loadTranslations } from "./services/translator.js";

type MenuSnapshot = {
  raw: string | null;
  text: string | null;
  label: string | null;
  observedAt: string;
};

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
  })
);

let latestTelemetry: Awaited<
  ReturnType<typeof readCookerTelemetry>
> | null = null;

let lastError: string | null = null;
let polling = false;

const menuHistory: MenuSnapshot[] = [];

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "mcl02m-monitor",
  });
});

app.get("/api/cooker", (c) => {
  return c.json({
    connected: isCookerConnected(),
    lastUpdated: latestTelemetry?.receivedAt ?? null,
    telemetry: latestTelemetry,
    error: lastError,
  });
});

app.get("/api/cooker/menu-history", (c) => {
  return c.json(menuHistory);
});

async function pollCooker() {
  if (polling) return;

  polling = true;

  try {
    if (!isCookerConnected()) {
      await connectCooker();
    }

    latestTelemetry = await readCookerTelemetry();
    lastError = null;

    const menu = latestTelemetry.menu;

    if (menu) {
      const snapshot: MenuSnapshot = {
        raw: menu.raw,
        text: menu.text,
        label: menu.label,
        observedAt: latestTelemetry.receivedAt,
      };

      const previous = menuHistory[menuHistory.length - 1];

      if (!previous || previous.raw !== snapshot.raw) {
        menuHistory.push(snapshot);

        if (menuHistory.length > 100) {
          menuHistory.shift();
        }

        console.log("OLED menu changed:", snapshot);
      }
    }
  } catch (error) {
    lastError =
      error instanceof Error ? error.message : "Unknown device error";

    console.warn("Cooker unavailable:", lastError);
  } finally {
    polling = false;
  }
}

async function main() {
  await loadTranslations();

  // Start the API even if the cooker is offline.
  try {
    await connectCooker();
    await pollCooker();
  } catch (error) {
    console.warn(
      "Cooker is currently unavailable. Monitoring will continue and retry."
    );
  }

  setInterval(async () => {
    try {
      await pollCooker();
    } catch (error) {
      console.warn("Cooker polling failed:", error);
    }
  }, 3000);

  serve({
    fetch: app.fetch,
    port: 3001,
    hostname: "127.0.0.1",
  });

  console.log("Monitoring API running at http://127.0.0.1:3001");
}

async function shutdown() {
  console.log("Shutting down monitoring service...");

  await disconnectCooker();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch(async (error) => {
  console.error("Failed to start monitoring service:", error);
  await disconnectCooker();
  process.exit(1);
});

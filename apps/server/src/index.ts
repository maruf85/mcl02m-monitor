import "dotenv/config";

import { Hono } from "hono";
import { serve } from "@hono/node-server";

import deviceRoutes from "./routes/device.js";

const app = new Hono();

app.route("/api/device", deviceRoutes);

app.get("/", (c) =>
  c.json({
    name: "MCL02M Monitor",
    version: "0.1.0"
  })
);

serve({
  fetch: app.fetch,
  port: 3001,
  hostname: "127.0.0.1"
});

console.log("MCL02M Monitor running on port 3001");

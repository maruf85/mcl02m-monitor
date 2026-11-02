import "dotenv/config";
import { XiaomiMiHome } from "xmihome";

const ip = process.env.COOKER_IP;
const token = process.env.COOKER_TOKEN;
const model = process.env.COOKER_MODEL;

if (!ip || !token || !model) {
  throw new Error("Missing cooker configuration in .env");
}

if (!/^[a-fA-F0-9]{32}$/.test(token)) {
  throw new Error("Invalid cooker token format.");
}

const miHome = new XiaomiMiHome({
  devices: [
    {
      address: ip,
      token,
      model,
      name: "Mijia Induction Cooker 2",
    },
  ],
  connectionType: "miio",
  logLevel: "warn",
});

const customProperties = [
  { did: "3-1", siid: 3, piid: 1 },
  { did: "3-2", siid: 3, piid: 2 },
  { did: "3-3", siid: 3, piid: 3 },
  { did: "3-4", siid: 3, piid: 4 },
  { did: "3-5", siid: 3, piid: 5 },
  { did: "3-6", siid: 3, piid: 6 },
  { did: "3-7", siid: 3, piid: 7 },
  { did: "3-8", siid: 3, piid: 8 },
  { did: "3-9", siid: 3, piid: 9 },
  { did: "3-10", siid: 3, piid: 10 },
  { did: "3-11", siid: 3, piid: 11 },
  { did: "3-13", siid: 3, piid: 13 },
  { did: "3-27", siid: 3, piid: 27 },
  { did: "3-28", siid: 3, piid: 28 },
  { did: "3-32", siid: 3, piid: 32 },
  { did: "3-39", siid: 3, piid: 39 },
  { did: "3-41", siid: 3, piid: 41 },
] as const;

async function main() {
  let device: Awaited<ReturnType<typeof miHome.getDevice>> | undefined;

  try {
    console.log("Connecting to cooker...");

    device = await miHome.getDevice({
      address: ip,
      token,
      model,
      name: "Mijia Induction Cooker 2",
    });

    await device.connect();

    console.log("Connected:", device.connectionType);

    const rawDevice = (device as any).device;

    if (!rawDevice || typeof rawDevice.call !== "function") {
      throw new Error("Underlying MIoT device API is unavailable.");
    }

    const [generic, custom] = await Promise.all([
      device.getProperties(),
      rawDevice.call("get_properties", [...customProperties]),
    ]);

    const telemetry = {
      receivedAt: new Date().toISOString(),
      generic,
      custom: Object.fromEntries(
        custom.map((property: { piid: number; code: number; value?: unknown }) => [
          property.piid,
          {
            code: property.code,
            value: property.value,
          },
        ])
      ),
    };

    console.log("\nCooker telemetry:");
    console.dir(telemetry, { depth: null });
  } catch (error) {
    console.error("Monitoring test failed:", error);
    process.exitCode = 1;
  } finally {
    if (device) {
      await device.disconnect().catch(() => {});
    }

    miHome.destroy();
  }
}

main();

import "dotenv/config";
import { XiaomiMiHome } from "xmihome";
import { loadTranslations, translateMenuText } from "../services/translator.js";

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
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 27, 28, 32, 39, 41,
].map((piid) => ({
  did: `3-${piid}`,
  siid: 3,
  piid,
}));

let device: any = null;
let connected = false;

export async function connectCooker() {
  if (device) return;

  await loadTranslations();

  device = await miHome.getDevice({
    address: ip,
    token,
    model,
    name: "Mijia Induction Cooker 2",
  });

  await device.connect();
  connected = true;

  console.log("Cooker connected successfully.");
}

function decodeMenuText(value: unknown): string | null {
  if (typeof value !== "string" || !/^[a-fA-F0-9]+$/.test(value)) {
    return null;
  }

  const bytes = Buffer.from(value, "hex");

  if (bytes.length < 9) return null;

  const textBytes = bytes.subarray(5, 9);

  return new TextDecoder("gbk").decode(textBytes).replace(/\0/g, "").trim();
}

export async function readCookerTelemetry() {
  if (!device || !connected) {
    throw new Error("Cooker is not connected.");
  }

  const rawDevice = device.device;

  const [generic, custom] = await Promise.all([
    device.getProperties(),
    rawDevice.call("get_properties", customProperties),
  ]);

  const customValues = Object.fromEntries(
    custom.map((property: any) => [
      property.piid,
      {
        code: property.code,
        value: property.value,
      },
    ])
  );

  const menuText = decodeMenuText(customValues[1]?.value);
  const menuLabel = await translateMenuText(menuText);

  return {
    receivedAt: new Date().toISOString(),
    generic,
    menu: {
      raw: customValues[1]?.value ?? null,
      text: menuText,
      label: menuLabel,
    },
    custom: customValues,
  };
}

export function isCookerConnected() {
  return connected;
}

export async function disconnectCooker() {
  connected = false;

  if (device) {
    await device.disconnect().catch(() => {});
    device = null;
  }

  miHome.destroy();
}

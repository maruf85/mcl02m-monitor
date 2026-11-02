declare module "xmihome" {
  import EventEmitter from "events";

  interface DeviceConfig {
    id?: string;
    name?: string;
    model?: string;
    address?: string;
    mac?: string;
    token?: string;
    bindkey?: string;
  }

  interface XiaomiMiHomeConfig {
    credentials?: Record<string, unknown>;
    credentialsFile?: string;
    connectionType?: "miio" | "bluetooth" | "cloud";
    devices?: DeviceConfig[];
    logLevel?: "none" | "error" | "warn" | "info" | "debug";
  }

  interface MiotProperty {
    siid: number;
    piid: number;
  }

  interface DiscoveredDevice extends DeviceConfig {
    isOnline?: boolean;
  }

  class Device extends EventEmitter {
    connectionType?: "miio" | "bluetooth" | "cloud";
    properties: Record<string, unknown>;

    connect(connectionType?: "miio" | "bluetooth" | "cloud"): Promise<void>;
    disconnect(): Promise<void>;
    getProperties(properties?: MiotProperty[]): Promise<Record<string, unknown>>;
    static getDeviceId(config: DeviceConfig): string;
    static create(
      config: DeviceConfig,
      client: XiaomiMiHome
    ): Promise<Device>;
  }

  class XiaomiMiHome extends EventEmitter {
    constructor(config?: XiaomiMiHomeConfig);
    config: XiaomiMiHomeConfig | null;

    get miot(): unknown;
    get bluetooth(): unknown;

    destroy(): Promise<void>;
    getDevice(config: DeviceConfig): Promise<Device>;
    getDevices(
      options?: {
        timeout?: number;
        connectionType?: "miio" | "bluetooth" | "miio+bluetooth" | "cloud";
        onDeviceFound?: (
          device: DiscoveredDevice,
          devices: DiscoveredDevice[],
          type: "miio" | "bluetooth" | "cloud"
        ) => boolean | { include?: boolean; stop?: boolean };
      }
    ): Promise<DiscoveredDevice[]>;
  }

  export { XiaomiMiHome, Device };
}

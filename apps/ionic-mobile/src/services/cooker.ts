/**
 * Read-only cooker monitor service boundary.
 *
 * Raw UDP is intentionally delegated to a Capacitor native plugin. Browser
 * networking is not suitable for MiIO UDP. No write/control command API exists.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

export interface CookerPacket {
  payload: string;
  deviceId?: number;
  stamp?: number;
}

export interface CookerTransportPlugin {
  open(options: { host: string; port: number }): Promise<{ opened: boolean }>;
  exchange(options: { packet: string; timeoutMs?: number }): Promise<CookerPacket>;
  close(): Promise<void>;
}

const NativeCookerTransport = registerPlugin<CookerTransportPlugin>('CookerTransport');

export const cookerTransport = {
  get isNative() {
    return Capacitor.isNativePlatform();
  },
  async open(host: string, port = 54321) {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Cooker UDP is available only in the native Android/iOS app.');
    }
    return NativeCookerTransport.open({ host, port });
  },
  exchange(packet: string, timeoutMs = 2500) {
    return NativeCookerTransport.exchange({ packet, timeoutMs });
  },
  close() {
    return NativeCookerTransport.close();
  },
};

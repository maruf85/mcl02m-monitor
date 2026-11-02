export interface MiotProperty {
  siid: number;
  piid: number;
}

export interface MiotPropertyResult {
  siid: number;
  piid: number;
  code: number;
  value?: unknown;
}

export interface MiotClient {
  getProperties(
    properties: MiotProperty[]
  ): Promise<MiotPropertyResult[]>;
}

export interface CookerTelemetry {
  connected: boolean;
  model: "chunmi.ihcooker.v2";

  temperature: number | null;
  targetTemperature: number | null;

  heatLevel: number | null;
  fireGears: number | null;

  remainingTime: number | null;
  workingTime: number | null;

  cookingMode: number | null;
  phase: number | null;

  status: number | null;
  errorCode: number | null;

  lastUpdated: string | null;
}

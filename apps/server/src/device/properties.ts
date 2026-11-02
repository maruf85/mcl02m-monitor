export const COOKER_MODEL = "chunmi.ihcooker.v2";

export const COOKER_PROPERTIES = {
  inductionCooker: {
    service: 2,
    properties: {
      status: 1,
      fault: 2,
      on: 3,
      cookMode: 4,
      remainingTime: 5,
      workingTime: 6,
      heatLevel: 7
    }
  },

  custom: {
    // Manufacturer-specific service.
    // Actual service and property identifiers must
    // be verified against the complete MIoT spec.
    temperature: "temperature",
    targetTemperature: "target-temperature",
    fireGears: "fire-gears",
    phase: "phase",
    workStatus: "work-status",
    errorCode: "error-code"
  }
} as const;

import { useState, useEffect, useRef } from "react";

interface MenuInfo {
  raw: string | null;
  text: string | null;
  label: string | null;
}

interface Telemetry {
  receivedAt: string;
  generic: Record<string, number | boolean>;
  menu: MenuInfo;
  custom: Record<string, { code: number; value: unknown }>;
}

interface CookerResponse {
  connected: boolean;
  lastUpdated: string | null;
  telemetry: Telemetry | null;
  error: string | null;
}

const API_URL = "/api/cooker";

export default function useCooker() {
  const [data, setData] = useState<CookerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const abortedRef = useRef(false);

  const fetchCooker = async () => {
    abortedRef.current = false;
    try {
      const res = await fetch(API_URL);
      if (abortedRef.current) return;
      const json: CookerResponse = await res.json();
      setData(json);
    } catch {
      if (!abortedRef.current) {
        setData({
          connected: false,
          lastUpdated: null,
          telemetry: null,
          error: "Cannot reach monitoring API",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooker();
    const interval = setInterval(fetchCooker, 3000);
    return () => {
      abortedRef.current = true;
      clearInterval(interval);
    };
  }, []);

  return data;
}

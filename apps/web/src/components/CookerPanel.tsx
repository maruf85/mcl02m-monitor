import useCooker from "../hooks/useCooker";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  CookingPot,
  Flame,
  RefreshCw,
  Thermometer,
  Wifi,
  WifiOff,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";

interface MenuSnapshot {
  raw: string | null;
  text: string | null;
  label: string | null;
  observedAt: string;
}

function formatRemainingTime(seconds: number): string {
  if (typeof seconds !== "number" || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CookerPanel() {
  const { connected, lastUpdated, telemetry, error } = useCooker() ?? {};
  const [menuHistory, setMenuHistory] = useState<MenuSnapshot[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const generic = telemetry?.generic ?? {};
  const custom = telemetry?.custom ?? {};
  const menuLabel = telemetry?.menu?.label ?? null;
  const menuText = telemetry?.menu?.text ?? null;

  const temperature = custom["7"]?.value;
  const heatLevel = generic["induction-cooker_heat-level"];
  const remainingTime = generic["induction-cooker_left-time"];
  const fault = generic["induction-cooker_fault"];

  const hasFault = typeof fault === "number" && fault !== 0;

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/cooker/menu-history");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setMenuHistory(data);
      } catch {
        // ignore
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-5 rounded-full bg-zinc-800 p-5">
            <CookingPot
              size={42}
              className={connected ? "text-emerald-400" : "text-zinc-400"}
            />
          </div>
          <h2 className="text-2xl font-semibold">
            {connected ? "Monitoring" : "Offline"}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {connected
              ? "Live device telemetry is being monitored"
              : error ?? "Cooker is not connected."}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Menu */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-400">Menu</p>
            <CookingPot size={19} className="text-zinc-500" />
          </div>
          <p className="text-3xl font-semibold tracking-tight">
            {menuLabel ?? "—"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">{menuText ?? ""}</p>
        </div>

        {/* Temperature */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-400">Temperature</p>
            <Thermometer size={19} className="text-zinc-500" />
          </div>
          <p className="text-3xl font-semibold tracking-tight">
            {typeof temperature === "number" ? `${temperature}°C` : "—"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Raw value</p>
        </div>

        {/* Heat level */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-400">Heat level</p>
            <Flame size={19} className="text-zinc-500" />
          </div>
          <p className="text-3xl font-semibold tracking-tight">
            {typeof heatLevel === "number" ? heatLevel : "—"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Device setting</p>
        </div>

        {/* Remaining time */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-400">Remaining time</p>
            <Clock3 size={19} className="text-zinc-500" />
          </div>
          <p className="text-3xl font-semibold tracking-tight">
            {typeof remainingTime === "number"
              ? formatRemainingTime(remainingTime)
              : "—"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">MM:SS</p>
        </div>

        {/* Device faults */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-400">Device faults</p>
            {hasFault ? (
              <AlertCircle size={19} className="text-red-400" />
            ) : (
              <CheckCircle2 size={19} className="text-emerald-400" />
            )}
          </div>
          <p
            className={`text-3xl font-semibold tracking-tight ${
              hasFault ? "text-red-400" : ""
            }`}
          >
            {hasFault ? String(fault) : "None"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {hasFault ? "Fault reported" : "No reported fault"}
          </p>
        </div>
      </div>

      {/* Connection details */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-zinc-400" />
          <h3 className="font-medium">Connection details</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Last updated</span>
            <span>
              {lastUpdated
                ? new Date(lastUpdated).toLocaleTimeString()
                : "Not available"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Monitoring interval</span>
            <span>3 seconds</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Device fault status</span>
            <span className="flex items-center gap-2">
              {hasFault ? (
                <AlertCircle size={16} className="text-red-400" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-400" />
              )}
              {hasFault ? "Fault reported" : "No reported fault"}
            </span>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm transition hover:bg-zinc-800"
        >
          <RefreshCw size={16} />
          Refresh now
        </button>
      </div>

      {/* Menu history */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-zinc-400" />
          <h3 className="font-medium">Menu History</h3>
          <span className="ml-auto text-xs text-zinc-500">
            {menuHistory.length} change
            {menuHistory.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loadingHistory ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : menuHistory.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No menu changes recorded yet
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...menuHistory].reverse().map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-500 text-xs">
                    {new Date(item.observedAt).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-300">
                    {item.label ?? item.text ?? "—"}
                  </span>
                </div>
                {item.raw && (
                  <span className="font-mono text-xs text-zinc-600">
                    {item.raw.slice(0, 12)}...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

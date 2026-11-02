import { Wifi, WifiOff } from "lucide-react";
import CookerPanel from "./components/CookerPanel";
import useCooker from "./hooks/useCooker";

export default function App() {
  const { connected } = useCooker() ?? {};

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-zinc-800 p-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-300"
              >
                <path d="M10 2h4" />
                <path d="M12 2v8" />
                <path d="M4.93 4.93a8.963 8.963 0 0 1 14.14 0" />
                <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />
                <path d="M4 12V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Mijia Cooker Monitor</h1>
              <p className="text-xs text-zinc-500">
                Xiaomi Mijia Induction Cooker 2
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
              connected
                ? "border-emerald-800 bg-emerald-950/60 text-emerald-400"
                : "border-red-800 bg-red-950/60 text-red-400"
            }`}
          >
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connected ? "Connected" : "Disconnected"}
          </div>
        </header>

        <CookerPanel />
      </div>
    </div>
  );
}

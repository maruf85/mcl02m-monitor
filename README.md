# MCL02M Monitor

Local read-only monitor for the Xiaomi Mijia Induction Cooker 2 (chunmi.ihcooker.v2).

## Features

- **Live telemetry** — temperature, heat level, remaining time, cooking phase
- **Menu tracking** — decodes the cooker's OLED display text (Chinese → English)
- **Change history** — records every menu transition with timestamps
- **Fault detection** — alerts when the device reports an error code
- **Read-only** — no start/stop/pause controls; monitoring only

## Architecture

```
apps/
├── server/           # Node.js API (Hono + xmihome)
│   ├── src/
│   │   ├── device/
│   │   │   ├── cooker.ts      # MIoT connection & telemetry read
│   │   │   ├── miot-client.ts # Read-only client interface
│   │   │   └── properties.ts  # MIoT property constants
│   │   ├── services/
│   │   │   └── translator.ts  # GBK decoding + dictionary
│   │   └── server.ts          # Express/Hono server + polling
│   └── data/
│       └── menu-translations.json  # Persisted Chinese→English map
└── web/              # React + Vite + Tailwind frontend
    └── src/
        ├── App.tsx
        ├── components/
        │   └── CookerPanel.tsx
        └── hooks/
            └── useCooker.ts
```

## Setup

### Prerequisites

- Node.js 22+
- pnpm 10+
- The cooker on the same local network as this machine

### Installation

```bash
pnpm install
```

### Configuration

Copy the example env file and update with your device credentials:

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env`:

```env
COOKER_IP=192.168.10.186
COOKER_TOKEN=your_32_char_hex_token
COOKER_MODEL=chunmi.ihcooker.v2
PORT=3001
```

### Getting the Token

Use the [Mi Home app](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome) on your phone:

1. Go to **Profile → About Mi Home → tap MIoT version repeatedly** to enable developer tools
2. Navigate to your cooker's device page
3. Tap the **gear icon → Network info**
4. Copy the **token** (32 hex characters)

Alternatively, extract it from your Mi Home cloud backup or use a tool like [miio](https://github.com/unichris/miio).

**GUI Miio Token Extractor** — a cross-platform desktop app that reads the token from the Mi Home app's local storage: [mLihs/GUI-Miio-Tokenextrator-All-Plattforms](https://github.com/mLihs/GUI-Miio-Tokenextrator-All-Plattforms)

## Running

### Development (both apps)

```bash
pnpm dev
```

### Backend only

```bash
pnpm run monitor
```

### Frontend only

```bash
pnpm run dev:web
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://127.0.0.1:3001/api/cooker |
| Health | http://127.0.0.1:3001/api/health |
| Menu history | http://127.0.0.1:3001/api/cooker/menu-history |

## API

### `GET /api/cooker`

Returns current cooker state.

```json
{
  "connected": true,
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "telemetry": {
    "receivedAt": "2024-01-15T10:30:00.000Z",
    "generic": {
      "induction-cooker_heat-level": 5,
      "induction-cooker_left-time": 1800
    },
    "menu": {
      "raw": "4e2d5c60a1b2c3d4e5f6",
      "text": "手动",
      "label": "Manual"
    },
    "custom": {
      "7": { "code": 0, "value": 100 },
      "8": { "code": 0, "value": 200 }
    }
  },
  "error": null
}
```

### `GET /api/cooker/menu-history`

Returns up to 100 recorded menu changes, newest first.

```json
[
  {
    "raw": "4e2d5c60a1b2c3d4e5f6",
    "text": "手动",
    "label": "Manual",
    "observedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### `GET /api/health`

```json
{ "status": "ok", "service": "mcl02m-monitor" }
```

## Menu Translations

The cooker displays its menu in Chinese on the OLED screen. The server decodes these using GBK encoding and maps them to English labels.

Custom translations are persisted in `apps/server/data/menu-translations.json`. When the server encounters an unknown Chinese string, it auto-saves the mapping on next restart. You can also manually edit the file:

```json
{
  "关机": "Shutdown",
  "手动": "Manual",
  "火锅": "Hot Pot",
  "新增菜单": "New Menu"
}
```

## Troubleshooting

### Cooker not connecting

1. Verify the cooker is powered on and on the same Wi-Fi
2. Check the IP address — run `ping 192.168.10.186` (or your IP)
3. Ensure the token is exactly 32 hex characters
4. Restart the server: `pnpm run monitor`

### Blank frontend

- Check browser console for errors
- Ensure the backend is running: `curl http://127.0.0.1:3001/api/health`
- Restart: `pnpm dev`

### Port already in use

```bash
# Windows
taskkill /F /IM node.exe
taskkill /F /IM tsx.exe

# Then restart
pnpm dev
```

## License

ISC

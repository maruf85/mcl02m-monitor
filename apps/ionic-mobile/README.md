# Ionic MCL02M Monitor

Native Ionic React + Capacitor app for monitoring Xiaomi Mijia Induction Cooker 2 (MCL02M).

## Development (Windows)

```bash
pnpm install
pnpm --filter @mcl02m/ionic-mobile dev
```

## Native targets

```bash
pnpm --filter @mcl02m/ionic-mobile exec cap add android
pnpm --filter @mcl02m/ionic-mobile exec cap add ios
```

Android builds can be developed on Windows. iOS builds require macOS + Xcode.

## Safety

- Read-only monitoring only.
- No cooker control/write commands are implemented.
- Device token must be stored securely and never committed/logged.
- Raw UDP networking will be implemented through a dedicated Capacitor native plugin; browser networking is not used for cooker communication.

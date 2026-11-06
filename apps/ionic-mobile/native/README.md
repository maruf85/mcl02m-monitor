# Native Capacitor transport integration

The Android UDP plugin source is kept outside Capacitor's generated project so `cap add android`
can create its normal project structure without overwriting hand-authored native files.

## Android setup

From `apps/ionic-mobile`:

```bash
pnpm exec cap add android
```

Then:
1. Copy `native/android/CookerTransportPlugin.java` into
   `android/app/src/main/java/com/maruf/mcl02monitor/CookerTransportPlugin.java`.
2. Add `<uses-permission android:name="android.permission.INTERNET" />` to the
   generated `android/app/src/main/AndroidManifest.xml` inside the root `<manifest>`.
3. Add the import and `registerPlugin(CookerTransportPlugin.class)` to the generated
   `MainActivity.java` as shown in `native/android/MainActivity.registration.java`.
4. Run `pnpm exec cap sync android`, then open the Android project in Android Studio.

The plugin uses UDP port 54321 only, bounds packet size and timeout, and never logs packet
contents. Its `exchange` method is a transport primitive for the app's protocol service;
only the read-only MiIO monitor service should call it. Do not add cooker write/control commands.

## Current boundary

The native plugin is source code awaiting integration into a generated Capacitor Android project.
It has not yet been compiled or exercised on a device. iOS requires a corresponding Swift plugin
and Xcode/macOS; this Android implementation does not provide iOS UDP support.

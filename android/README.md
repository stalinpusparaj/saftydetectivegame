# Safety Detective Town — Android app

This is a thin **Kotlin** wrapper that puts the game on the Play Store as a
[Trusted Web Activity (TWA)](https://developer.chrome.com/docs/android/trusted-web-activity):
it launches the real game — the same `index.html` at the repo root, already
live at <https://stalinpusparaj.github.io/saftydetectivegame/> — full-screen,
with no browser address bar, once the site's own
`/.well-known/assetlinks.json` proves to Android that this app and that
website belong to the same developer.

**The game itself is not reimplemented here.** Updating `index.html` at the
repo root updates the game for every player, web and Android, with no new
Android release needed. A new Android build is only needed for changes to
the wrapper itself — permissions, icon, package id, the one native feature
below.

The one thing this app adds beyond loading the website: a local, optional,
once-a-day "come back and play" notification if the game has sat unopened
a while, implemented in `LauncherActivity.kt` / `ReminderWorker.kt`. It is
entirely on-device (no account, no server, nothing sent anywhere) and a
parent can turn it off any time in Android Settings → Apps → Safety
Detective Town → Notifications.

## Prerequisites

- **JDK 17.** `brew install openjdk@17` on a Mac, or any JDK 17 install.
- **Android SDK**, with `platform-36`+ and matching build-tools, either via
  Android Studio (simplest) or the command-line tools
  (`brew install android-commandlinetools`, then
  `sdkmanager --install "platform-tools" "platforms;android-36" "build-tools;36.1.0"`,
  adjusting versions to whatever is current when you read this).
- **Gradle.** You don't need it installed globally — see "First-time setup"
  below for how `gradlew` gets generated once, after which `./gradlew` alone
  downloads the exact pinned Gradle version on its own.

## First-time setup

1. **Point at your SDK.** Either open this folder in Android Studio (it
   writes `local.properties` for you), or create it by hand:
   ```
   echo "sdk.dir=/path/to/your/Android/sdk" > local.properties
   ```
   This file is machine-specific and is never committed.

2. **Generate the Gradle wrapper**, once, using any Gradle 9.x you have
   locally (`brew install gradle`, or Android Studio's bundled one):
   ```
   gradle wrapper --gradle-version 9.8.2 --distribution-type bin
   ```
   This writes `gradlew`, `gradlew.bat`, and `gradle/wrapper/`. From then on,
   use `./gradlew` for everything — it downloads Gradle 9.8.2 itself the
   first time, so you never need a global Gradle again.

3. **(Release builds only) Point at a signing key** — see
   [Signing and releasing](#signing-and-releasing) below before running
   `bundleRelease`. Debug builds (`assembleDebug`) work without this.

## Building

```bash
./gradlew assembleDebug      # unsigned debug APK, for testing on a device/emulator
./gradlew bundleRelease      # signed .aab, the format Play Console wants
```

Outputs land in `app/build/outputs/apk/debug/app-debug.apk` and
`app/build/outputs/bundle/release/app-release.aab`.

To install the debug build on a connected device or emulator:
```bash
./gradlew installDebug
```

## Signing and releasing

Release builds are signed using `android/keystore.properties`, a file that
is **never committed** (see `.gitignore`) because it points at a real
private signing key. Without it, `bundleRelease` still runs but silently
falls back to the debug key — fine for your own testing, but Play Console
will reject that bundle.

Create `android/keystore.properties` (same folder as this README) with:
```properties
storeFile=/absolute/path/to/your/upload-keystore.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

If you don't have a keystore yet, generate one:
```bash
keytool -genkeypair -v -keystore upload-keystore.jks -alias upload \
  -keyalg RSA -keysize 2048 -validity 10950 -storetype PKCS12
```
**Keep this file somewhere safe and backed up, outside this repo.** If you
ever lose it, you cannot publish an update to the same Play Store listing
again under your own upload key (Google's "App Signing by Google Play"
program can recover from a lost *upload* key, but only if you still have
Play Console access — there is no recovery for losing both).

After generating or changing the keystore, update
`.well-known/assetlinks.json` in the **separate**
`stalinpusparaj.github.io` repository (the website's domain root, not this
one) with the new certificate's SHA-256 fingerprint:
```bash
keytool -list -v -keystore upload-keystore.jks -alias upload | grep SHA256
```
Without a matching `assetlinks.json`, the app still works, but falls back
to showing a browser address bar instead of opening the game full-screen.

## Project layout

```
android/
  app/
    src/main/
      AndroidManifest.xml      # the real configuration: launch URL, colours,
                                # orientation, splash — all as TWA meta-data
      kotlin/.../LauncherActivity.kt   # launches the TWA, schedules the reminder
      kotlin/.../ReminderWorker.kt     # the once-a-day local reminder check
      res/                      # icons, colours, the two Kotlin strings.xml
                                 # (the GAME's own English/Tamil text lives in
                                 # index.html, not here — this is only the
                                 # Android app's own small surface: name,
                                 # notification text)
  keystore.properties           # not committed — see above
  local.properties               # not committed — machine-specific SDK path
```

## Why a Trusted Web Activity instead of a native rewrite

The game is a single self-contained `index.html` (Three.js, ~330 KB) that
already works as an installable, offline-capable PWA on every platform.
Reimplementing six 3D interactive cases natively would mean maintaining two
codebases that could drift apart. A TWA gets the real game onto Play with a
few hundred lines of configuration instead, and every improvement to
`index.html` reaches Android players immediately, with no store review
wait. This is also consistent with how other Gemmy Apps games ship on
Android.

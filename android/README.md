# Android wrapper app

This is a thin Android wrapper (WebView shell) around the live game at
https://stalinpusparaj.github.io/saftydetectivegame/. It does not bundle the
game's own content — it just loads that URL — so updating `index.html` on the
website does not require a new Android release.

## Setting up `keystore.properties`

Release builds are signed using values read from `android/keystore.properties`.
That file is intentionally **not committed to git** (see `android/.gitignore`)
because it holds your signing key's passwords. `app/build.gradle.kts` reads it
like this:

```kotlin
val keystoreProps = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
```

To create it yourself:

1. Generate a signing key (skip this if you already have one for this app):

   ```
   keytool -genkey -v -keystore release.keystore -alias safetydetectivetown \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

   Store the resulting `.keystore` file somewhere safe, outside of git (for
   example directly in `android/`, since that path is also git-ignored, or
   anywhere else on disk).

2. In `android/`, create a file named `keystore.properties` with these four
   properties:

   ```
   storeFile=/absolute/or/relative/path/to/release.keystore
   storePassword=your-keystore-password
   keyAlias=safetydetectivetown
   keyPassword=your-key-password
   ```

   `storeFile` is resolved relative to the `android/` project root
   (`rootProject.file(...)`).

3. Run `./gradlew bundleRelease` from `android/` as usual. If
   `keystore.properties` is missing, the release build config falls back to
   the debug signing config, which is fine for local testing but **must not**
   be used for a Play Store upload.

## Keeping the same signing key

Every future `.aab` uploaded to Google Play for this app **must** be signed
with the same key as the first release — Play rejects updates signed with a
different key. Keep `release.keystore` and its passwords backed up somewhere
safe and private; losing them means you can never update this app listing
again under the same package ID.

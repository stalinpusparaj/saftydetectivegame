import java.util.Properties

plugins {
    id("com.android.application")
    // AGP 9+ has Kotlin support built in (see https://kotl.in/gradle/agp-built-in-kotlin);
    // the separate org.jetbrains.kotlin.android plugin must NOT also be applied.
}

// Release signing comes from android/keystore.properties, a file that never
// gets committed (see .gitignore). Without it, `assembleRelease` still works
// but falls back to the debug key — fine for local testing, not for Play.
val keystoreProps = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "com.gemmyapps.safetydetectivetown"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.gemmyapps.safetydetectivetown"
        minSdk = 24
        targetSdk = 37
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        if (keystoreProps.getProperty("storeFile") != null) {
            create("release") {
                storeFile = rootProject.file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.findByName("release") ?: signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    // No kotlinOptions{} block: with AGP 9's built-in Kotlin, the Kotlin
    // jvmTarget defaults to compileOptions.targetCompatibility above
    // (see https://developer.android.com/build/migrate-to-built-in-kotlin).
}

dependencies {
    // The Trusted Web Activity wrapper: launches the PWA at
    // https://stalinpusparaj.github.io/saftydetectivegame/ full-screen,
    // with no browser chrome, once the site's /.well-known/assetlinks.json
    // verifies this app. See app/src/main/AndroidManifest.xml.
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.4")
    implementation("androidx.browser:browser:1.10.0")
    implementation("androidx.core:core-ktx:1.19.1")

    // Local, account-free "come back and play" reminder (see
    // LauncherActivity.kt / ReminderWorker.kt) — one of the engagement
    // features requested alongside the web game's own gamification.
    implementation("androidx.work:work-runtime-ktx:2.12.0")
}

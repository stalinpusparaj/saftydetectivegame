// Root build file. Plugin versions are declared once here (apply false)
// and applied per-module in app/build.gradle.kts, the standard Android
// Gradle Plugin + Kotlin Gradle Plugin pattern.
plugins {
    id("com.android.application") version "9.5.0" apply false
    // No separate Kotlin Gradle plugin: AGP 9+ builds Kotlin in natively.
}

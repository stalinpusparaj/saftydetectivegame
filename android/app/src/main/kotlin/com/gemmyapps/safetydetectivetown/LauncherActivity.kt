package com.gemmyapps.safetydetectivetown

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit
import com.google.androidbrowserhelper.trusted.LauncherActivity as TwaLauncherActivity

/**
 * Launches the Trusted Web Activity pointed at the Safety Detective Town
 * game (see AndroidManifest.xml's DEFAULT_URL and SCREEN_ORIENTATION
 * meta-data — that's where the real configuration lives; this class adds
 * only what the library doesn't already do).
 *
 * The one thing it adds: a record of "last opened", and a once-a-day
 * local check (ReminderWorker) that gently invites a child back if the
 * game has sat untouched — fully on-device, no account, no server, no
 * data about the child leaves the phone. See ReminderWorker's doc
 * comment for exactly what it does and does not do.
 */
class LauncherActivity : TwaLauncherActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putLong(KEY_LAST_OPENED, System.currentTimeMillis())
            .apply()
        requestNotificationPermissionIfNeeded()
        scheduleReminders()
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < 33) return
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) {
            // Fire-and-forget: this activity hands off to the TWA right
            // away, so there is no later UI state here to update with the
            // result. ReminderWorker checks the live permission each time
            // it runs, so a grant, a denial, or a later change in system
            // settings all take effect on their own without this activity
            // needing to know the outcome.
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        }
    }

    private fun scheduleReminders() {
        val request = PeriodicWorkRequestBuilder<ReminderWorker>(24, TimeUnit.HOURS)
            .setInitialDelay(24, TimeUnit.HOURS)
            .build()
        // KEEP: re-launching the app (which calls this every time) must
        // never reset or duplicate the schedule, only make sure it exists.
        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            ReminderWorker.UNIQUE_WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            request,
        )
    }

    companion object {
        const val PREFS = "safety_detective_town"
        const val KEY_LAST_OPENED = "last_opened_at"
    }
}

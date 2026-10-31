package com.gemmyapps.safetydetectivetown

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

/**
 * Runs roughly once a day via WorkManager (scheduled from
 * LauncherActivity). If the game has not been opened in the last 20
 * hours, shows ONE local notification inviting the child back to solve
 * the next case; otherwise does nothing.
 *
 * Privacy: everything here stays on the device. No network request, no
 * account, no identifier sent anywhere — the only thing read is the
 * local "when was this app last opened" timestamp this same app wrote
 * to its own private SharedPreferences. A parent can turn this off at
 * any time from Android's own Settings → Apps → Safety Detective Town →
 * Notifications, the same way as for any other app.
 */
class ReminderWorker(appContext: Context, params: WorkerParameters) :
    Worker(appContext, params) {

    override fun doWork(): Result {
        val ctx = applicationContext
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
        ) {
            return Result.success()
        }

        val prefs = ctx.getSharedPreferences(LauncherActivity.PREFS, Context.MODE_PRIVATE)
        val lastOpened = prefs.getLong(LauncherActivity.KEY_LAST_OPENED, 0L)
        val quietLongEnough = System.currentTimeMillis() - lastOpened >= TimeUnit.HOURS.toMillis(20)
        if (!quietLongEnough) return Result.success()

        ensureChannel(ctx)

        val openIntent = Intent(ctx, LauncherActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            ctx, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setColor(ContextCompat.getColor(ctx, R.color.skyAccent))
            .setContentTitle(ctx.getString(R.string.reminder_title))
            .setContentText(ctx.getString(R.string.reminder_text))
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        (ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(NOTIFICATION_ID, notification)
        return Result.success()
    }

    private fun ensureChannel(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            ctx.getString(R.string.reminder_channel_name),
            NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
            description = ctx.getString(R.string.reminder_channel_description)
        }
        manager.createNotificationChannel(channel)
    }

    companion object {
        const val UNIQUE_WORK_NAME = "daily_detective_reminder"
        const val CHANNEL_ID = "detective_reminders"
        const val NOTIFICATION_ID = 1001
    }
}

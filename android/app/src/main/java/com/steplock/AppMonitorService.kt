package com.steplock

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat

class AppMonitorService : Service() {

    companion object {
        private const val CHANNEL_ID = "steplock_service"
        private const val NOTIFICATION_ID = 1001
        private const val CHECK_INTERVAL_MS = 1000L
    }

    private lateinit var prefs: SharedPreferences
    private val handler = Handler(Looper.getMainLooper())
    private var isRunning = false

    private val updateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                "com.steplock.UPDATE_BLOCK_STATUS" -> {
                    val stepGoalMet = intent.getBooleanExtra("step_goal_met", false)
                    val currentSteps = intent.getIntExtra("current_steps", 0)
                    val stepGoal = intent.getIntExtra("step_goal", 5000)
                    prefs.edit()
                        .putBoolean("step_goal_met", stepGoalMet)
                        .putInt("current_steps", currentSteps)
                        .putInt("step_goal", stepGoal)
                        .apply()
                }
                "com.steplock.UPDATE_LOCKED_APPS" -> {
                    // locked_apps already updated in prefs by AppBlockerModule
                }
            }
        }
    }

    private val monitorRunnable = object : Runnable {
        override fun run() {
            if (!isRunning) return
            checkForegroundApp()
            handler.postDelayed(this, CHECK_INTERVAL_MS)
        }
    }

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("StepLockPrefs", Context.MODE_PRIVATE)
        createNotificationChannel()

        val filter = IntentFilter().apply {
            addAction("com.steplock.UPDATE_BLOCK_STATUS")
            addAction("com.steplock.UPDATE_LOCKED_APPS")
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(updateReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(updateReceiver, filter)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildNotification())
        isRunning = true
        handler.post(monitorRunnable)
        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        handler.removeCallbacks(monitorRunnable)
        try { unregisterReceiver(updateReceiver) } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun checkForegroundApp() {
        val stepGoalMet = prefs.getBoolean("step_goal_met", false)
        if (stepGoalMet) return

        val lockedApps = prefs.getStringSet("locked_apps", emptySet()) ?: emptySet()
        if (lockedApps.isEmpty()) return

        val foregroundPackage = getForegroundPackage() ?: return
        if (foregroundPackage == packageName) return

        if (lockedApps.contains(foregroundPackage)) {
            val currentSteps = prefs.getInt("current_steps", 0)
            val stepGoal = prefs.getInt("step_goal", 5000)
            val lockIntent = Intent(this, LockActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("blocked_package", foregroundPackage)
                putExtra("current_steps", currentSteps)
                putExtra("step_goal", stepGoal)
            }
            startActivity(lockIntent)
        }
    }

    private fun getForegroundPackage(): String? {
        return try {
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val now = System.currentTimeMillis()
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                now - 10_000,
                now
            )
            stats?.maxByOrNull { it.lastTimeUsed }?.packageName
        } catch (e: Exception) {
            null
        }
    }

    private fun buildNotification(): Notification {
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, mainIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("StepLock Active")
            .setContentText("Monitoring apps to keep you moving 👟")
            .setSmallIcon(android.R.drawable.ic_menu_directions)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "StepLock Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps StepLock running in the background"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}

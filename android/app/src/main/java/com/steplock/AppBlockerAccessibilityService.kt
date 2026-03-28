package com.steplock

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.view.accessibility.AccessibilityEvent
import android.os.Build

class AppBlockerAccessibilityService : AccessibilityService() {

    private lateinit var prefs: SharedPreferences
    private var stepGoalMet = false
    private var lockedApps = setOf<String>()

    private val updateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                "com.steplock.UPDATE_BLOCK_STATUS" -> {
                    stepGoalMet = intent.getBooleanExtra("step_goal_met", false)
                }
                "com.steplock.UPDATE_LOCKED_APPS" -> {
                    lockedApps = prefs.getStringSet("locked_apps", emptySet()) ?: emptySet()
                }
            }
        }
    }

    override fun onServiceConnected() {
        prefs = getSharedPreferences("StepLockPrefs", Context.MODE_PRIVATE)
        stepGoalMet = prefs.getBoolean("step_goal_met", false)
        lockedApps = prefs.getStringSet("locked_apps", emptySet()) ?: emptySet()

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

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val packageName = event.packageName?.toString() ?: return
        if (packageName == applicationContext.packageName) return

        // Refresh from prefs in case broadcasts were missed
        stepGoalMet = prefs.getBoolean("step_goal_met", false)
        lockedApps = prefs.getStringSet("locked_apps", emptySet()) ?: emptySet()

        if (!stepGoalMet && lockedApps.contains(packageName)) {
            val currentSteps = prefs.getInt("current_steps", 0)
            val stepGoal = prefs.getInt("step_goal", 5000)
            val lockIntent = Intent(this, LockActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("blocked_package", packageName)
                putExtra("current_steps", currentSteps)
                putExtra("step_goal", stepGoal)
            }
            startActivity(lockIntent)
        }
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        try { unregisterReceiver(updateReceiver) } catch (_: Exception) {}
    }
}

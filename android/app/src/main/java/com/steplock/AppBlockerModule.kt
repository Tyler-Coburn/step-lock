package com.steplock

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.text.TextUtils

import com.facebook.react.bridge.*

class AppBlockerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppBlockerModule"

    @ReactMethod
    fun checkUsageStatsPermission(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    reactContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    reactContext.packageName
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission() {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            try {
                val intent = Intent(Settings.ACTION_SETTINGS).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
            } catch (_: Exception) {}
        }
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        try {
            val componentName = ComponentName(reactContext, AppBlockerAccessibilityService::class.java)
            val enabledServices = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val colonSplitter = TextUtils.SimpleStringSplitter(':')
            colonSplitter.setString(enabledServices)
            while (colonSplitter.hasNext()) {
                val componentNameString = colonSplitter.next()
                val enabledService = ComponentName.unflattenFromString(componentNameString)
                if (enabledService != null && enabledService == componentName) {
                    promise.resolve(true)
                    return
                }
            }
            promise.resolve(false)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
        } catch (e: Exception) {}
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            val result = Arguments.createArray()
            for (app in apps) {
                if (pm.getLaunchIntentForPackage(app.packageName) != null) {
                    val map = Arguments.createMap()
                    map.putString("name", pm.getApplicationLabel(app).toString())
                    map.putString("packageName", app.packageName)
                    result.pushMap(map)
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun startMonitoring(lockedApps: ReadableArray, stepGoalMet: Boolean) {
        try {
            val prefs = reactContext.getSharedPreferences("StepLockPrefs", Context.MODE_PRIVATE)
            val packagesList = mutableListOf<String>()
            for (i in 0 until lockedApps.size()) {
                packagesList.add(lockedApps.getString(i))
            }
            prefs.edit()
                .putStringSet("locked_apps", packagesList.toSet())
                .putBoolean("step_goal_met", stepGoalMet)
                .apply()

            val intent = Intent(reactContext, AppMonitorService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
        } catch (e: Exception) {
            // ignore
        }
    }

    @ReactMethod
    fun stopMonitoring() {
        try {
            val intent = Intent(reactContext, AppMonitorService::class.java)
            reactContext.stopService(intent)
        } catch (e: Exception) {}
    }

    @ReactMethod
    fun updateBlockStatus(stepGoalMet: Boolean, currentSteps: Int, stepGoal: Int) {
        try {
            val prefs = reactContext.getSharedPreferences("StepLockPrefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putBoolean("step_goal_met", stepGoalMet)
                .putInt("current_steps", currentSteps)
                .putInt("step_goal", stepGoal)
                .apply()

            val intent = Intent("com.steplock.UPDATE_BLOCK_STATUS").apply {
                setPackage(reactContext.packageName)
                putExtra("step_goal_met", stepGoalMet)
                putExtra("current_steps", currentSteps)
                putExtra("step_goal", stepGoal)
            }
            reactContext.sendBroadcast(intent)
        } catch (e: Exception) {}
    }

    @ReactMethod
    fun updateLockedApps(lockedApps: ReadableArray) {
        try {
            val prefs = reactContext.getSharedPreferences("StepLockPrefs", Context.MODE_PRIVATE)
            val packagesList = mutableListOf<String>()
            for (i in 0 until lockedApps.size()) {
                packagesList.add(lockedApps.getString(i))
            }
            prefs.edit()
                .putStringSet("locked_apps", packagesList.toSet())
                .apply()

            val intent = Intent("com.steplock.UPDATE_LOCKED_APPS").apply {
                setPackage(reactContext.packageName)
            }
            reactContext.sendBroadcast(intent)
        } catch (e: Exception) {}
    }
}

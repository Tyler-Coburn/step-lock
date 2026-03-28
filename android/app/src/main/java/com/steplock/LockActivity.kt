package com.steplock

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class LockActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make full screen and show over lock screen
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        )
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }

        val blockedPackage = intent.getStringExtra("blocked_package") ?: ""
        val currentSteps = intent.getIntExtra("current_steps", 0)
        val stepGoal = intent.getIntExtra("step_goal", 5000)
        val stepsNeeded = maxOf(0, stepGoal - currentSteps)

        val appName = try {
            val pm = packageManager
            val appInfo = pm.getApplicationInfo(blockedPackage, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            blockedPackage
        }

        // Root layout
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#1a1a2e"))
            setPadding(64, 64, 64, 64)
        }

        // Lock icon
        val lockIcon = TextView(this).apply {
            text = "🔒"
            textSize = 72f
            gravity = Gravity.CENTER
        }

        // App Locked title
        val title = TextView(this).apply {
            text = "App Locked"
            textSize = 32f
            setTextColor(Color.parseColor("#ff5252"))
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 8)
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }

        // App name
        val appNameView = TextView(this).apply {
            text = appName
            textSize = 20f
            setTextColor(Color.parseColor("#cccccc"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 48)
        }

        // Card background for step info
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#16213e"))
            setPadding(48, 40, 48, 40)
        }

        val stepCountLabel = TextView(this).apply {
            text = "Your Steps Today"
            textSize = 13f
            setTextColor(Color.parseColor("#888888"))
            gravity = Gravity.CENTER
            letterSpacing = 0.1f
        }

        val stepCountView = TextView(this).apply {
            text = "%,d".format(currentSteps)
            textSize = 48f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }

        val goalView = TextView(this).apply {
            text = "Goal: %,d steps".format(stepGoal)
            textSize = 14f
            setTextColor(Color.parseColor("#888888"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 24)
        }

        val neededView = TextView(this).apply {
            text = "🚶 Walk %,d more steps to unlock".format(stepsNeeded)
            textSize = 15f
            setTextColor(Color.parseColor("#ff9800"))
            gravity = Gravity.CENTER
        }

        card.addView(stepCountLabel)
        card.addView(stepCountView)
        card.addView(goalView)
        card.addView(neededView)

        // Motivational message
        val message = TextView(this).apply {
            text = "Put down the phone and get moving! You're almost there 💪"
            textSize = 14f
            setTextColor(Color.parseColor("#aaaaaa"))
            gravity = Gravity.CENTER
            setPadding(0, 40, 0, 40)
            lineSpacingMultiplier = 1.4f
        }

        // Take a Walk button
        val walkButton = Button(this).apply {
            text = "🚶  Take a Walk"
            textSize = 16f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#6c63ff"))
            setPadding(40, 28, 40, 28)
        }

        // Open StepLock button
        val openAppButton = Button(this).apply {
            text = "📱  Open StepLock"
            textSize = 14f
            setTextColor(Color.parseColor("#6c63ff"))
            setBackgroundColor(Color.parseColor("#16213e"))
            setPadding(40, 20, 40, 20)
        }

        walkButton.setOnClickListener {
            // Go to home screen
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(homeIntent)
            finish()
        }

        openAppButton.setOnClickListener {
            val mainIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(mainIntent)
            finish()
        }

        root.addView(lockIcon)
        root.addView(title)
        root.addView(appNameView)
        root.addView(card)
        root.addView(message)

        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }

        val walkParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            bottomMargin = 16
        }
        val openParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )

        buttonLayout.addView(walkButton, walkParams)
        buttonLayout.addView(openAppButton, openParams)
        root.addView(buttonLayout)

        setContentView(root)
    }

    // Prevent back button from dismissing the lock screen
    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        // Do nothing — back button is disabled
    }
}

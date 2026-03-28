# StepLock 👟🔒

> **Lock your social media apps behind daily step goals. Walk to unlock!**

StepLock is a React Native (Expo bare workflow) Android app that tracks your daily steps using your phone's built-in pedometer and blocks selected social media apps until you reach your step goal for the day.

---

## Features

- **📊 Step Tracking** – Real-time step counting using the device's built-in step counter sensor (via `expo-sensors`)
- **🔒 App Blocking** – Detects when locked social media apps are opened and shows a lock screen overlay
- **🎯 Customizable Goals** – Set a daily step goal from 1,000 to 20,000 steps (default: 5,000)
- **📱 App Selection** – Choose which social apps to lock: Instagram, TikTok, Twitter/X, Facebook, YouTube, Reddit, Snapchat
- **🌙 Daily Reset** – Automatically resets step count at midnight for a fresh start each day
- **💪 Motivational UI** – Animated progress ring, lock/unlock status badge, and encouraging messages
- **🔔 Background Monitoring** – Foreground service continuously monitors app usage

## How It Works

1. Open StepLock and set your daily step goal in **Settings**
2. Go to the **Apps** tab and toggle on the social media apps you want to lock
3. Grant the two required permissions (Usage Stats + Accessibility Service) via the Settings tab
4. Walk until you hit your step goal — locked apps will be blocked until you do!
5. Once your goal is met 🎉, all locked apps are accessible for the rest of the day

## App Blocking — How It Works Technically

StepLock uses two complementary methods:

| Method | How |
|---|---|
| **Accessibility Service** | Detects `TYPE_WINDOW_STATE_CHANGED` events — most responsive, triggers immediately when app opens |
| **Background Service** | Polls `UsageStatsManager` every second as a reliable fallback |

Both services read from shared `StepLockPrefs` to know which apps are locked and whether the step goal has been met. Step data is synced from the JS layer via the `AppBlockerModule` native bridge.

## Screens

| Screen | Description |
|---|---|
| **Home** | Animated SVG progress ring, step count, goal, lock/unlock badge, motivational message |
| **Apps** | Toggle list of 7 social media apps to lock |
| **Settings** | Adjust step goal, auto-reset, grant permissions, manual step reset |

## Project Structure

```
step-lock/
├── App.tsx                          # Root component
├── index.js                         # Expo entry point
├── app.json                         # Expo config
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Bottom tab navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Step counter + progress ring
│   │   ├── AppsScreen.tsx           # Locked app selection
│   │   └── SettingsScreen.tsx       # Goal + permissions + preferences
│   ├── hooks/
│   │   └── useStepCounter.ts        # Pedometer hook with midnight reset
│   └── utils/
│       ├── constants.ts             # Social media apps, default goal
│       └── storage.ts               # AsyncStorage helpers
└── android/
    └── app/src/main/java/com/steplock/
        ├── AppBlockerModule.kt      # RN bridge (permissions, start/stop)
        ├── AppBlockerPackage.kt     # RN package registration
        ├── AppBlockerAccessibilityService.kt  # Accessibility-based blocker
        ├── AppMonitorService.kt     # Foreground service (UsageStats polling)
        ├── LockActivity.kt          # Full-screen lock screen
        ├── BootReceiver.kt          # Auto-start on reboot
        └── MainApplication.kt      # Registers AppBlockerPackage
```

## Getting Started

### Prerequisites

- Node.js 18+
- Android Studio with Android SDK
- A physical Android device or emulator (API 26+ recommended)
- Java 17+

### Install & Run

```bash
# Install dependencies
npm install

# Run on Android (connects to a device/emulator)
npm run android
```

### First-Time Setup on Device

1. Install the app
2. Open StepLock → go to **Settings** tab
3. Tap **Enable** next to "Usage Stats Permission" → find StepLock → toggle ON
4. Tap **Enable** next to "Accessibility Service" → find StepLock → toggle ON
5. Select apps to lock in the **Apps** tab
6. Start walking! 🚶

## Required Android Permissions

| Permission | Purpose |
|---|---|
| `ACTIVITY_RECOGNITION` | Step counting via pedometer sensor |
| `PACKAGE_USAGE_STATS` | Detect which app is in the foreground |
| `FOREGROUND_SERVICE` | Run monitoring service in background |
| `SYSTEM_ALERT_WINDOW` | Dev tools (React Native requirement) |
| `RECEIVE_BOOT_COMPLETED` | Restart monitoring service after reboot |
| `POST_NOTIFICATIONS` | Show "StepLock Active" notification |

## Tech Stack

- **React Native** 0.83 (Expo bare workflow)
- **Expo SDK** 55
- **expo-sensors** (Pedometer)
- **@react-navigation/bottom-tabs** (Navigation)
- **@react-native-async-storage/async-storage** (Persistence)
- **react-native-svg** (Progress ring)
- **Kotlin** (Native Android modules)

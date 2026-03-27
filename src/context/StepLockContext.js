import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';

const StepLockContext = createContext();

const STORAGE_KEYS = {
  LOCKED_APPS: 'steplock_locked_apps',
  STEP_COUNT: 'steplock_step_count',
  LAST_RESET_DATE: 'steplock_last_reset_date',
};

const DEFAULT_APPS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'logo-tiktok',
    iconFamily: 'Ionicons',
    stepsRequired: 500,
    color: '#00f2ea',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'logo-instagram',
    iconFamily: 'Ionicons',
    stepsRequired: 1000,
    color: '#E1306C',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'logo-snapchat',
    iconFamily: 'Ionicons',
    stepsRequired: 5000,
    color: '#FFFC00',
  },
];

function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function StepLockProvider({ children }) {
  const [lockedApps, setLockedApps] = useState(DEFAULT_APPS);
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const simulationInterval = useRef(null);

  // Load saved data
  useEffect(() => {
    loadData();
  }, []);

  // Set up pedometer
  useEffect(() => {
    let subscription = null;

    async function setupPedometer() {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();

        try {
          const result = await Pedometer.getStepCountAsync(start, end);
          if (result) {
            setStepCount(prev => Math.max(prev, result.steps));
          }
        } catch (e) {
          // Pedometer history not available
        }

        subscription = Pedometer.watchStepCount(result => {
          setStepCount(prev => prev + result.steps);
        });
      } else {
        // Start simulated step counter for demo/web
        startSimulation();
      }
    }

    setupPedometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [lockedApps, stepCount, isLoading]);

  // Check for daily reset
  useEffect(() => {
    checkDailyReset();
    const resetCheck = setInterval(checkDailyReset, 60000);
    return () => clearInterval(resetCheck);
  }, []);

  function startSimulation() {
    simulationInterval.current = setInterval(() => {
      setStepCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 1000);
  }

  async function checkDailyReset() {
    try {
      const lastResetDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
      const today = getTodayDateString();
      if (lastResetDate !== today) {
        setStepCount(0);
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
      }
    } catch (e) {
      // ignore
    }
  }

  async function loadData() {
    try {
      const [appsData, stepsData, lastResetDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LOCKED_APPS),
        AsyncStorage.getItem(STORAGE_KEYS.STEP_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE),
      ]);

      const today = getTodayDateString();

      if (lastResetDate !== today) {
        setStepCount(0);
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
      } else if (stepsData) {
        setStepCount(parseInt(stepsData, 10) || 0);
      }

      if (appsData) {
        setLockedApps(JSON.parse(appsData));
      }
    } catch (e) {
      // Use defaults
    }
    setIsLoading(false);
  }

  async function saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.LOCKED_APPS, JSON.stringify(lockedApps)),
        AsyncStorage.setItem(STORAGE_KEYS.STEP_COUNT, String(stepCount)),
      ]);
    } catch (e) {
      // ignore
    }
  }

  const addApp = useCallback((app) => {
    setLockedApps(prev => [...prev, { ...app, id: app.id || Date.now().toString() }]);
  }, []);

  const removeApp = useCallback((appId) => {
    setLockedApps(prev => prev.filter(a => a.id !== appId));
  }, []);

  const updateAppSteps = useCallback((appId, stepsRequired) => {
    setLockedApps(prev =>
      prev.map(a => (a.id === appId ? { ...a, stepsRequired } : a))
    );
  }, []);

  const isAppUnlocked = useCallback((appId) => {
    const app = lockedApps.find(a => a.id === appId);
    if (!app) return true;
    return stepCount >= app.stepsRequired;
  }, [lockedApps, stepCount]);

  const getProgress = useCallback((appId) => {
    const app = lockedApps.find(a => a.id === appId);
    if (!app) return 1;
    return Math.min(stepCount / app.stepsRequired, 1);
  }, [lockedApps, stepCount]);

  const addSteps = useCallback((amount) => {
    setStepCount(prev => prev + amount);
  }, []);

  const resetSteps = useCallback(() => {
    setStepCount(0);
  }, []);

  return (
    <StepLockContext.Provider
      value={{
        lockedApps,
        stepCount,
        isPedometerAvailable,
        isLoading,
        addApp,
        removeApp,
        updateAppSteps,
        isAppUnlocked,
        getProgress,
        addSteps,
        resetSteps,
      }}
    >
      {children}
    </StepLockContext.Provider>
  );
}

export function useStepLock() {
  const context = useContext(StepLockContext);
  if (!context) {
    throw new Error('useStepLock must be used within a StepLockProvider');
  }
  return context;
}

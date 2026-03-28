import { useState, useEffect, useRef, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import { AppState, AppStateStatus, NativeModules, Platform } from 'react-native';
import {
  saveTodaySteps,
  getTodaySteps,
  saveLastResetDate,
  getLastResetDate,
  getStepGoal,
} from '../utils/storage';

function notifyNative(steps: number, goal: number): void {
  if (Platform.OS === 'android' && NativeModules.AppBlockerModule) {
    try {
      NativeModules.AppBlockerModule.updateBlockStatus(steps >= goal, steps, goal);
    } catch (_) {}
  }
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

interface StepCounterState {
  steps: number;
  goal: number;
  isAvailable: boolean;
  isUnlocked: boolean;
  resetSteps: () => void;
}

export function useStepCounter(): StepCounterState {
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(5000);
  const [isAvailable, setIsAvailable] = useState(false);
  const baseStepsRef = useRef(0);
  const subscriptionRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);

  const checkMidnightReset = useCallback(async () => {
    const today = getTodayDateString();
    const lastReset = await getLastResetDate();
    if (lastReset !== today) {
      await saveTodaySteps(0);
      await saveLastResetDate(today);
      setSteps(0);
      baseStepsRef.current = 0;
      return true;
    }
    return false;
  }, []);

  const loadGoal = useCallback(async () => {
    const savedGoal = await getStepGoal();
    setGoal(savedGoal);
  }, []);

  const startPedometer = useCallback(async () => {
    const available = await Pedometer.isAvailableAsync().catch(() => false);
    setIsAvailable(available);

    if (!available) {
      const persisted = await getTodaySteps();
      setSteps(persisted);
      return;
    }

    const wasReset = await checkMidnightReset();
    if (!wasReset) {
      const persisted = await getTodaySteps();
      setSteps(persisted);
      baseStepsRef.current = persisted;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }

    subscriptionRef.current = Pedometer.watchStepCount(result => {
      const newSteps = baseStepsRef.current + result.steps;
      setSteps(newSteps);
      saveTodaySteps(newSteps);
    });
  }, [checkMidnightReset]);

  useEffect(() => {
    loadGoal();
    startPedometer();

    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        await loadGoal();
        await checkMidnightReset();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      subscription.remove();
      subscriptionRef.current?.remove();
    };
  }, [loadGoal, startPedometer, checkMidnightReset]);

  // Keep native layer in sync whenever steps or goal changes
  useEffect(() => {
    notifyNative(steps, goal);
  }, [steps, goal]);

  const resetSteps = useCallback(async () => {
    await saveTodaySteps(0);
    await saveLastResetDate(getTodayDateString());
    baseStepsRef.current = 0;
    setSteps(0);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    await startPedometer();
  }, [startPedometer]);

  return {
    steps,
    goal,
    isAvailable,
    isUnlocked: steps >= goal,
    resetSteps,
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_STEP_GOAL } from './constants';

export async function saveStepGoal(goal: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, String(goal));
  } catch (e) {
    console.error('saveStepGoal error', e);
  }
}

export async function getStepGoal(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.STEP_GOAL);
    return val ? parseInt(val, 10) : DEFAULT_STEP_GOAL;
  } catch (e) {
    return DEFAULT_STEP_GOAL;
  }
}

export async function saveLockedApps(apps: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCKED_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('saveLockedApps error', e);
  }
}

export async function getLockedApps(): Promise<string[]> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.LOCKED_APPS);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}

export async function saveTodaySteps(steps: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TODAY_STEPS, String(steps));
  } catch (e) {
    console.error('saveTodaySteps error', e);
  }
}

export async function getTodaySteps(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_STEPS);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
}

export async function saveLastResetDate(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, date);
  } catch (e) {
    console.error('saveLastResetDate error', e);
  }
}

export async function getLastResetDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
  } catch (e) {
    return null;
  }
}

export async function saveAutoReset(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_RESET, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('saveAutoReset error', e);
  }
}

export async function getAutoReset(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_RESET);
    return val !== 'false'; // default true
  } catch (e) {
    return true;
  }
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  NativeModules,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveStepGoal, getStepGoal, saveAutoReset, getAutoReset } from '../utils/storage';
import { DEFAULT_STEP_GOAL } from '../utils/constants';

const { AppBlockerModule } = NativeModules;

const MIN_GOAL = 1000;
const MAX_GOAL = 20000;
const STEP_SIZE = 500;

export default function SettingsScreen() {
  const [stepGoal, setStepGoal] = useState(DEFAULT_STEP_GOAL);
  const [autoReset, setAutoReset] = useState(true);
  const [hasUsagePermission, setHasUsagePermission] = useState(false);
  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    const goal = await getStepGoal();
    const auto = await getAutoReset();
    setStepGoal(goal);
    setAutoReset(auto);
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'android' && AppBlockerModule) {
      try {
        const usage = await AppBlockerModule.checkUsageStatsPermission();
        setHasUsagePermission(usage);
        const accessibility = await AppBlockerModule.checkAccessibilityPermission();
        setHasAccessibilityPermission(accessibility);
      } catch (_) {}
    }
  };

  const handleGoalDecrease = useCallback(async () => {
    const newGoal = Math.max(MIN_GOAL, stepGoal - STEP_SIZE);
    setStepGoal(newGoal);
    await saveStepGoal(newGoal);
  }, [stepGoal]);

  const handleGoalIncrease = useCallback(async () => {
    const newGoal = Math.min(MAX_GOAL, stepGoal + STEP_SIZE);
    setStepGoal(newGoal);
    await saveStepGoal(newGoal);
  }, [stepGoal]);

  const handleAutoResetChange = useCallback(async (value: boolean) => {
    setAutoReset(value);
    await saveAutoReset(value);
  }, []);

  const handleResetSteps = () => {
    Alert.alert(
      "Reset Today's Steps",
      "Are you sure you want to reset today's step count to 0?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const { saveTodaySteps, saveLastResetDate } = await import('../utils/storage');
            await saveTodaySteps(0);
            await saveLastResetDate(new Date().toISOString().split('T')[0]);
            Alert.alert('Done', "Today's steps have been reset.");
          },
        },
      ],
    );
  };

  const handleOpenUsageSettings = () => {
    if (Platform.OS === 'android' && AppBlockerModule) {
      AppBlockerModule.requestUsageStatsPermission();
    }
  };

  const handleOpenAccessibilitySettings = () => {
    if (Platform.OS === 'android' && AppBlockerModule) {
      AppBlockerModule.openAccessibilitySettings();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Step Goal */}
        <Text style={styles.sectionTitle}>Step Goal</Text>
        <View style={styles.card}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>Daily Step Goal</Text>
            <Text style={styles.goalValue}>{stepGoal.toLocaleString()}</Text>
          </View>
          <View style={styles.goalControls}>
            <TouchableOpacity
              style={[styles.goalBtn, stepGoal <= MIN_GOAL && styles.goalBtnDisabled]}
              onPress={handleGoalDecrease}
              disabled={stepGoal <= MIN_GOAL}
            >
              <Text style={styles.goalBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.goalBarBg}>
              <View
                style={[
                  styles.goalBarFill,
                  {
                    width: `${((stepGoal - MIN_GOAL) / (MAX_GOAL - MIN_GOAL)) * 100}%` as any,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={[styles.goalBtn, stepGoal >= MAX_GOAL && styles.goalBtnDisabled]}
              onPress={handleGoalIncrease}
              disabled={stepGoal >= MAX_GOAL}
            >
              <Text style={styles.goalBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1,000</Text>
            <Text style={styles.sliderLabel}>20,000</Text>
          </View>
        </View>

        {/* Auto Reset */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-reset at Midnight</Text>
              <Text style={styles.settingHint}>Reset step count each day automatically</Text>
            </View>
            <Switch
              value={autoReset}
              onValueChange={handleAutoResetChange}
              trackColor={{ false: '#2a2a4a', true: '#6c63ff' }}
              thumbColor={autoReset ? '#fff' : '#666'}
            />
          </View>
        </View>

        {/* Manual Reset */}
        <TouchableOpacity style={styles.dangerButton} onPress={handleResetSteps}>
          <Text style={styles.dangerButtonText}>🔄  Reset Today's Steps</Text>
        </TouchableOpacity>

        {/* Permissions */}
        <Text style={styles.sectionTitle}>App Blocking Permissions</Text>
        <View style={styles.card}>
          <View style={styles.permissionBlock}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionTitle}>
                {hasUsagePermission ? '✅' : '❌'} Usage Stats Permission
              </Text>
              {!hasUsagePermission && (
                <TouchableOpacity style={styles.enableBtn} onPress={handleOpenUsageSettings}>
                  <Text style={styles.enableBtnText}>Enable</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.permissionDesc}>
              Required to detect which app is in the foreground. Grant "Usage access" for StepLock in Settings.
            </Text>
          </View>

          <View style={[styles.permissionBlock, styles.permissionBlockBorder]}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionTitle}>
                {hasAccessibilityPermission ? '✅' : '❌'} Accessibility Service
              </Text>
              {!hasAccessibilityPermission && (
                <TouchableOpacity style={styles.enableBtn} onPress={handleOpenAccessibilitySettings}>
                  <Text style={styles.enableBtnText}>Enable</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.permissionDesc}>
              Required for advanced app blocking. Enable "StepLock" in Accessibility Services.
            </Text>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How App Blocking Works</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>
            1. Select which apps to lock in the Apps tab.{'\n'}
            2. Grant Usage Stats permission above.{'\n'}
            3. Enable the Accessibility Service above.{'\n'}
            4. Walk until you reach your step goal.{'\n'}
            5. Once unlocked, all locked apps become accessible for the rest of the day.{'\n\n'}
            The step count resets each midnight for a fresh start.
          </Text>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>StepLock v1.0.0</Text>
          <Text style={styles.aboutSubtext}>
            Stay active. Earn your scroll time. 🚶‍♂️
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c63ff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 15,
    color: '#ccc',
  },
  goalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  goalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  goalBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalBtnDisabled: {
    backgroundColor: '#2a2a4a',
  },
  goalBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  goalBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a4a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 11,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#ccc',
  },
  settingHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dangerButton: {
    backgroundColor: '#2d1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff5252',
    marginBottom: 4,
  },
  dangerButtonText: {
    color: '#ff5252',
    fontSize: 15,
    fontWeight: '600',
  },
  permissionBlock: {
    paddingVertical: 10,
  },
  permissionBlockBorder: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
    marginTop: 8,
    paddingTop: 18,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  permissionTitle: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
    flex: 1,
  },
  permissionDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  enableBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  enableBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 22,
  },
  aboutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutSubtext: {
    color: '#888',
    fontSize: 13,
  },
});

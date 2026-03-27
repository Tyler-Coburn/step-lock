import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStepLock } from '../../src/context/StepLockContext';
import AppCard from '../../src/components/AppCard';

export default function HomeScreen() {
  const { stepCount, lockedApps, isPedometerAvailable, addSteps } = useStepLock();

  const totalRequired = lockedApps.length > 0
    ? Math.max(...lockedApps.map(a => a.stepsRequired))
    : 10000;

  const overallProgress = Math.min(stepCount / totalRequired, 1);
  const unlockedCount = lockedApps.filter(a => stepCount >= a.stepsRequired).length;

  // Sort apps: locked first (by closest to unlock), then unlocked
  const sortedApps = [...lockedApps].sort((a, b) => {
    const aUnlocked = stepCount >= a.stepsRequired;
    const bUnlocked = stepCount >= b.stepsRequired;
    if (aUnlocked && !bUnlocked) return 1;
    if (!aUnlocked && bUnlocked) return -1;
    return a.stepsRequired - b.stepsRequired;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>StepLock</Text>
          <Text style={styles.subtitle}>Walk to unlock your apps</Text>
        </View>

        {/* Step Counter Display */}
        <View style={styles.stepCounterContainer}>
          <View style={styles.stepCircle}>
            <View style={styles.stepCircleInner}>
              <Ionicons name="footsteps" size={28} color="#6C63FF" style={styles.stepIcon} />
              <Text style={styles.stepCountText}>{stepCount.toLocaleString()}</Text>
              <Text style={styles.stepsLabel}>steps today</Text>
            </View>
            {/* Progress ring visual */}
            <View style={[styles.progressRing, { borderColor: `rgba(108, 99, 255, ${0.15 + overallProgress * 0.85})` }]} />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="lock-open" size={18} color="#4CAF50" />
              <Text style={styles.statValue}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="lock-closed" size={18} color="#FF6B6B" />
              <Text style={styles.statValue}>{lockedApps.length - unlockedCount}</Text>
              <Text style={styles.statLabel}>Locked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="apps" size={18} color="#6C63FF" />
              <Text style={styles.statValue}>{lockedApps.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Pedometer status */}
        {!isPedometerAvailable && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={18} color="#FFB74D" />
            <Text style={styles.demoBannerText}>
              Demo mode: Steps are simulated. On a real device, your actual steps will be tracked.
            </Text>
          </View>
        )}

        {/* Simulate steps button (for demo) */}
        {!isPedometerAvailable && (
          <View style={styles.simulateRow}>
            {[50, 100, 500].map(amount => (
              <TouchableOpacity
                key={amount}
                style={styles.simulateButton}
                onPress={() => addSteps(amount)}
              >
                <Ionicons name="add" size={16} color="#6C63FF" />
                <Text style={styles.simulateButtonText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* App unlock progress */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App Unlock Progress</Text>
        </View>

        {sortedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="apps-outline" size={48} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No apps locked yet</Text>
            <Text style={styles.emptySubtext}>Go to App Locks to add apps</Text>
          </View>
        ) : (
          sortedApps.map(app => (
            <AppCard key={app.id} app={app} stepCount={stepCount} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  stepCounterContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepCircle: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#16213e',
    zIndex: 1,
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
  },
  stepIcon: {
    marginBottom: 4,
  },
  stepCountText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepsLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  demoBannerText: {
    fontSize: 12,
    color: '#FFB74D',
    flex: 1,
  },
  simulateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  simulateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 4,
  },
});

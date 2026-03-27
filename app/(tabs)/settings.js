import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStepLock } from '../../src/context/StepLockContext';

export default function SettingsScreen() {
  const { stepCount, lockedApps, isPedometerAvailable, resetSteps, addSteps } = useStepLock();

  function handleResetSteps() {
    if (Platform.OS === 'web') {
      if (confirm('Reset your step count to 0? This will re-lock all apps.')) {
        resetSteps();
      }
    } else {
      Alert.alert(
        'Reset Steps',
        'Reset your step count to 0? This will re-lock all apps.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: resetSteps },
        ]
      );
    }
  }

  const unlockedCount = lockedApps.filter(a => stepCount >= a.stepsRequired).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your StepLock experience</Text>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="footsteps" size={24} color="#6C63FF" />
                <Text style={styles.summaryValue}>{stepCount.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Steps</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="lock-open" size={24} color="#4CAF50" />
                <Text style={styles.summaryValue}>{unlockedCount}</Text>
                <Text style={styles.summaryLabel}>Unlocked</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="lock-closed" size={24} color="#FF6B6B" />
                <Text style={styles.summaryValue}>{lockedApps.length - unlockedCount}</Text>
                <Text style={styles.summaryLabel}>Locked</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pedometer Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step Tracking</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Ionicons
                  name={isPedometerAvailable ? 'hardware-chip' : 'phone-portrait'}
                  size={22}
                  color={isPedometerAvailable ? '#4CAF50' : '#FFB74D'}
                />
                <View>
                  <Text style={styles.cardRowTitle}>Pedometer</Text>
                  <Text style={styles.cardRowSubtitle}>
                    {isPedometerAvailable ? 'Using device pedometer' : 'Simulated (demo mode)'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isPedometerAvailable ? '#4CAF50' : '#FFB74D' },
                ]}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Ionicons name="refresh" size={22} color="#6C63FF" />
                <View>
                  <Text style={styles.cardRowTitle}>Daily Reset</Text>
                  <Text style={styles.cardRowSubtitle}>Steps reset at midnight each day</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {!isPedometerAvailable && (
            <>
              <TouchableOpacity style={styles.actionCard} onPress={() => addSteps(1000)}>
                <Ionicons name="flash" size={22} color="#6C63FF" />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Add 1,000 Steps</Text>
                  <Text style={styles.actionSubtitle}>Simulate walking for testing</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => addSteps(5000)}>
                <Ionicons name="rocket" size={22} color="#E040FB" />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Add 5,000 Steps</Text>
                  <Text style={styles.actionSubtitle}>Unlock most apps quickly</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionCard, styles.dangerCard]}
            onPress={handleResetSteps}
          >
            <Ionicons name="refresh-circle" size={22} color="#FF6B6B" />
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, styles.dangerText]}>Reset Steps</Text>
              <Text style={styles.actionSubtitle}>Set step count back to 0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <Ionicons name="footsteps" size={32} color="#6C63FF" />
              <Text style={styles.aboutTitle}>StepLock</Text>
            </View>
            <Text style={styles.aboutDescription}>
              StepLock helps you build healthier habits by requiring you to walk a set number of
              steps before accessing your favorite apps. Stay active, stay healthy!
            </Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#16213e',
    borderRadius: 18,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  cardRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardRowSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    gap: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.15)',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  aboutCard: {
    backgroundColor: '#16213e',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aboutDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
  },
});

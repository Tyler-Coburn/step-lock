import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppCard({ app, stepCount, onPress }) {
  const progress = Math.min(stepCount / app.stepsRequired, 1);
  const isUnlocked = progress >= 1;
  const stepsRemaining = Math.max(app.stepsRequired - stepCount, 0);

  return (
    <TouchableOpacity
      style={[styles.card, isUnlocked && styles.cardUnlocked]}
      onPress={() => onPress && onPress(app)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: app.color + '20' }]}>
        <Ionicons
          name={app.icon}
          size={32}
          color={app.color}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.appName}>{app.name}</Text>
        <Text style={styles.stepsText}>
          {isUnlocked
            ? 'Unlocked!'
            : `${stepsRemaining.toLocaleString()} steps to go`}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: isUnlocked ? '#4CAF50' : app.color,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.statusContainer}>
        {isUnlocked ? (
          <View style={styles.unlockedBadge}>
            <Ionicons name="lock-open" size={20} color="#4CAF50" />
          </View>
        ) : (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={20} color="#FF6B6B" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardUnlocked: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  stepsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statusContainer: {
    marginLeft: 12,
  },
  unlockedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

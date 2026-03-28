import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStepCounter } from '../hooks/useStepCounter';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 220;
const STROKE_WIDTH = 16;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomeScreen() {
  const { steps, goal, isAvailable, isUnlocked } = useStepCounter();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progress = Math.min(steps / goal, 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const percent = Math.round(progress * 100);
  const stepsNeeded = Math.max(0, goal - steps);
  const accentColor = isUnlocked ? '#4caf50' : '#6c63ff';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#2a2a4a"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress arc */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={accentColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          {/* Center text */}
          <View style={styles.ringCenter}>
            <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>
            <Text style={styles.stepLabel}>steps today</Text>
            <Text style={[styles.percentText, { color: accentColor }]}>{percent}%</Text>
          </View>
        </View>

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: isUnlocked ? '#1b4a1e' : '#3a1a1a' }]}>
          <Text style={[styles.badgeText, { color: isUnlocked ? '#4caf50' : '#ff5252' }]}>
            {isUnlocked ? '🔓  UNLOCKED' : '🔒  LOCKED'}
          </Text>
        </View>

        {/* Goal info card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardItem}>
              <Text style={styles.cardValue}>{goal.toLocaleString()}</Text>
              <Text style={styles.cardLabel}>Daily Goal</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardItem}>
              <Text style={[styles.cardValue, { color: isUnlocked ? '#4caf50' : '#ff9800' }]}>
                {isUnlocked ? '0' : stepsNeeded.toLocaleString()}
              </Text>
              <Text style={styles.cardLabel}>Steps Needed</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percent}%` as any, backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>{percent}% of daily goal</Text>
        </View>

        {/* Motivational message */}
        <View style={[styles.messageCard, { borderColor: isUnlocked ? '#4caf50' : '#ff9800' }]}>
          <Text style={styles.messageEmoji}>{isUnlocked ? '🎉' : '🚶'}</Text>
          <Text style={styles.messageText}>
            {isUnlocked
              ? "Great job! You've earned your social media time!"
              : `Take a walk to unlock your apps! ${stepsNeeded.toLocaleString()} more steps to go.`}
          </Text>
        </View>

        {/* Pedometer unavailable notice */}
        {!isAvailable && Platform.OS === 'android' && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ Step counter not available on this device. Install on a physical device to track steps.
            </Text>
          </View>
        )}
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
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -1,
  },
  stepLabel: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 2,
  },
  percentText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  cardItem: {
    alignItems: 'center',
    flex: 1,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#2a2a4a',
    marginVertical: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#2a2a4a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  messageCard: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  messageEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  warningCard: {
    width: '100%',
    backgroundColor: '#2d2000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  warningText: {
    color: '#ff9800',
    fontSize: 13,
    lineHeight: 19,
  },
});

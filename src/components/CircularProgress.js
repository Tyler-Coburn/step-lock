import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CircularProgress({ progress, size = 200, strokeWidth = 12, stepCount, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(Math.max(progress, 0), 1);

  // We'll use a simple view-based circular progress since SVG isn't available by default
  const degrees = progressValue * 360;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'rgba(255,255,255,0.1)',
          },
        ]}
      />
      {/* Progress indicator using conic gradient simulation */}
      <View
        style={[
          styles.progressContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {/* Top half */}
        <View style={[styles.halfContainer, { width: size, height: size / 2 }]}>
          <View
            style={[
              styles.half,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: degrees > 0 ? '#6C63FF' : 'transparent',
                transform: [{ rotate: `${Math.min(degrees, 180)}deg` }],
              },
            ]}
          />
        </View>
      </View>
      {/* Center content */}
      <View style={[styles.centerContent, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2 }]}>
        <Text style={styles.stepCount}>{stepCount.toLocaleString()}</Text>
        <Text style={styles.label}>{label || 'steps today'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  progressContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  halfContainer: {
    overflow: 'hidden',
  },
  half: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  stepCount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

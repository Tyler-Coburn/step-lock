import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StepLockProvider } from '../src/context/StepLockContext';

export default function RootLayout() {
  return (
    <StepLockProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f23' },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </StepLockProvider>
  );
}

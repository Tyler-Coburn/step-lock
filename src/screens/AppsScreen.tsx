import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  NativeModules,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SOCIAL_MEDIA_APPS } from '../utils/constants';
import { saveLockedApps, getLockedApps } from '../utils/storage';

interface AppItem {
  id: string;
  name: string;
  packageName: string;
  emoji: string;
}

export default function AppsScreen() {
  const [lockedAppIds, setLockedAppIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLockedApps();
  }, []);

  const loadLockedApps = async () => {
    const saved = await getLockedApps();
    setLockedAppIds(saved);
    setLoading(false);
  };

  const toggleApp = useCallback(
    async (appId: string) => {
      const newLocked = lockedAppIds.includes(appId)
        ? lockedAppIds.filter(id => id !== appId)
        : [...lockedAppIds, appId];
      setLockedAppIds(newLocked);
      await saveLockedApps(newLocked);

      // Notify native module if available
      if (Platform.OS === 'android' && NativeModules.AppBlockerModule) {
        const lockedPackages = SOCIAL_MEDIA_APPS.filter(app =>
          newLocked.includes(app.id),
        ).map(app => app.packageName);
        try {
          NativeModules.AppBlockerModule.updateLockedApps(lockedPackages);
        } catch (_) {}
      }
    },
    [lockedAppIds],
  );

  const lockedCount = lockedAppIds.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>{lockedCount > 0 ? '🔒' : '🔓'}</Text>
          <View>
            <Text style={styles.summaryTitle}>
              {lockedCount === 0
                ? 'No apps locked'
                : `${lockedCount} app${lockedCount !== 1 ? 's' : ''} locked`}
            </Text>
            <Text style={styles.summarySubtitle}>
              {lockedCount === 0
                ? 'Select apps to lock below'
                : 'Unlock by reaching your step goal'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Social Media Apps</Text>
        <Text style={styles.sectionHint}>
          Toggle the apps you want to lock behind your step goal.
        </Text>

        {/* App list */}
        <View style={styles.appList}>
          {SOCIAL_MEDIA_APPS.map((app: AppItem, index: number) => {
            const isLocked = lockedAppIds.includes(app.id);
            return (
              <TouchableOpacity
                key={app.id}
                style={[
                  styles.appRow,
                  index < SOCIAL_MEDIA_APPS.length - 1 && styles.appRowBorder,
                ]}
                onPress={() => toggleApp(app.id)}
                activeOpacity={0.7}
              >
                <View style={styles.appIcon}>
                  <Text style={styles.appEmoji}>{app.emoji}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appPackage}>{app.packageName}</Text>
                </View>
                <Switch
                  value={isLocked}
                  onValueChange={() => toggleApp(app.id)}
                  trackColor={{ false: '#2a2a4a', true: '#6c63ff' }}
                  thumbColor={isLocked ? '#fff' : '#666'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 App blocking requires the Accessibility Service to be enabled. Go to Settings to enable it.
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  summaryEmoji: {
    fontSize: 36,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  appList: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  appRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appEmoji: {
    fontSize: 22,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  appPackage: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  noteText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 19,
  },
});

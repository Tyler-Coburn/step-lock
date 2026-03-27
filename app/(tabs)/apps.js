import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStepLock } from '../../src/context/StepLockContext';
import AddAppModal from '../../src/components/AddAppModal';

export default function AppsScreen() {
  const { lockedApps, stepCount, addApp, removeApp, updateAppSteps } = useStepLock();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [editSteps, setEditSteps] = useState('');

  function handleRemoveApp(app) {
    if (Platform.OS === 'web') {
      if (confirm(`Remove ${app.name} from locked apps?`)) {
        removeApp(app.id);
      }
    } else {
      Alert.alert(
        'Remove App',
        `Remove ${app.name} from locked apps?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeApp(app.id) },
        ]
      );
    }
  }

  function handleStartEdit(app) {
    setEditingApp(app.id);
    setEditSteps(String(app.stepsRequired));
  }

  function handleSaveEdit(appId) {
    const steps = parseInt(editSteps, 10);
    if (steps && steps > 0) {
      updateAppSteps(appId, steps);
    }
    setEditingApp(null);
    setEditSteps('');
  }

  const existingAppIds = lockedApps.map(a => a.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>App Locks</Text>
            <Text style={styles.subtitle}>Manage your locked apps</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Current step count banner */}
        <View style={styles.stepBanner}>
          <Ionicons name="footsteps" size={20} color="#6C63FF" />
          <Text style={styles.stepBannerText}>
            Current steps: <Text style={styles.stepBannerCount}>{stepCount.toLocaleString()}</Text>
          </Text>
        </View>

        {/* Locked apps list */}
        {lockedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="lock-open-outline" size={56} color="rgba(255,255,255,0.15)" />
            </View>
            <Text style={styles.emptyTitle}>No apps locked</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add apps that require steps before use
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.emptyAddButtonText}>Add Your First App</Text>
            </TouchableOpacity>
          </View>
        ) : (
          lockedApps.map(app => {
            const progress = Math.min(stepCount / app.stepsRequired, 1);
            const isUnlocked = progress >= 1;
            const isEditing = editingApp === app.id;

            return (
              <View key={app.id} style={[styles.appItem, isUnlocked && styles.appItemUnlocked]}>
                <View style={styles.appItemHeader}>
                  <View style={[styles.appIcon, { backgroundColor: app.color + '20' }]}>
                    <Ionicons name={app.icon} size={28} color={app.color} />
                  </View>

                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{app.name}</Text>
                    {isEditing ? (
                      <View style={styles.editRow}>
                        <TextInput
                          style={styles.editInput}
                          value={editSteps}
                          onChangeText={setEditSteps}
                          keyboardType="number-pad"
                          autoFocus
                          selectTextOnFocus
                        />
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => handleSaveEdit(app.id)}
                        >
                          <Ionicons name="checkmark" size={18} color="#4CAF50" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => handleStartEdit(app)}>
                        <Text style={styles.appSteps}>
                          {app.stepsRequired.toLocaleString()} steps required
                          <Text style={styles.editHint}> (tap to edit)</Text>
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.appActions}>
                    <View style={[styles.statusBadge, isUnlocked ? styles.unlockedBadge : styles.lockedBadge]}>
                      <Ionicons
                        name={isUnlocked ? 'lock-open' : 'lock-closed'}
                        size={14}
                        color={isUnlocked ? '#4CAF50' : '#FF6B6B'}
                      />
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress * 100}%`,
                          backgroundColor: isUnlocked ? '#4CAF50' : app.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {isUnlocked
                      ? 'Unlocked!'
                      : `${Math.round(progress * 100)}% — ${(app.stepsRequired - stepCount).toLocaleString()} steps to go`}
                  </Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStartEdit(app)}
                  >
                    <Ionicons name="create-outline" size={16} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.actionButtonText}>Edit Steps</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveApp(app)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                    <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <AddAppModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addApp}
        existingAppIds={existingAppIds}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  stepBannerText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  stepBannerCount: {
    fontWeight: '800',
    color: '#6C63FF',
  },
  appItem: {
    backgroundColor: '#16213e',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  appItemUnlocked: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  appItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appSteps: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  editHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    fontStyle: 'italic',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    width: 100,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appActions: {
    marginLeft: 8,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  progressSection: {
    marginTop: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  removeButtonText: {
    color: '#FF6B6B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  emptyAddButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

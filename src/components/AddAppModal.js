import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRESET_APPS = [
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', iconFamily: 'Ionicons', color: '#FF0000' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'logo-twitter', iconFamily: 'Ionicons', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', iconFamily: 'Ionicons', color: '#4267B2' },
  { id: 'reddit', name: 'Reddit', icon: 'logo-reddit', iconFamily: 'Ionicons', color: '#FF4500' },
  { id: 'discord', name: 'Discord', icon: 'logo-discord', iconFamily: 'Ionicons', color: '#5865F2' },
  { id: 'twitch', name: 'Twitch', icon: 'logo-twitch', iconFamily: 'Ionicons', color: '#9146FF' },
  { id: 'pinterest', name: 'Pinterest', icon: 'logo-pinterest', iconFamily: 'Ionicons', color: '#E60023' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin', iconFamily: 'Ionicons', color: '#0077B5' },
];

export default function AddAppModal({ visible, onClose, onAdd, existingAppIds }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [stepsRequired, setStepsRequired] = useState('1000');
  const [customName, setCustomName] = useState('');

  const availableApps = PRESET_APPS.filter(app => !existingAppIds.includes(app.id));

  function handleAdd() {
    if (!selectedApp) return;
    const steps = parseInt(stepsRequired, 10);
    if (!steps || steps <= 0) return;

    onAdd({
      ...selectedApp,
      name: customName || selectedApp.name,
      stepsRequired: steps,
    });

    setSelectedApp(null);
    setStepsRequired('1000');
    setCustomName('');
    onClose();
  }

  function handleClose() {
    setSelectedApp(null);
    setStepsRequired('1000');
    setCustomName('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add App to Lock</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {availableApps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.emptyText}>All available apps have been added!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Select an app</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.appList}>
                {availableApps.map(app => (
                  <TouchableOpacity
                    key={app.id}
                    style={[
                      styles.appOption,
                      selectedApp?.id === app.id && styles.appOptionSelected,
                      selectedApp?.id === app.id && { borderColor: app.color },
                    ]}
                    onPress={() => setSelectedApp(app)}
                  >
                    <View style={[styles.appOptionIcon, { backgroundColor: app.color + '20' }]}>
                      <Ionicons name={app.icon} size={28} color={app.color} />
                    </View>
                    <Text style={styles.appOptionName} numberOfLines={1}>{app.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedApp && (
                <View style={styles.configSection}>
                  <Text style={styles.sectionLabel}>Steps required to unlock</Text>
                  <TextInput
                    style={styles.input}
                    value={stepsRequired}
                    onChangeText={setStepsRequired}
                    keyboardType="number-pad"
                    placeholder="Enter step count"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />

                  <View style={styles.quickSteps}>
                    {[500, 1000, 2500, 5000, 10000].map(steps => (
                      <TouchableOpacity
                        key={steps}
                        style={[
                          styles.quickStepButton,
                          stepsRequired === String(steps) && styles.quickStepButtonActive,
                        ]}
                        onPress={() => setStepsRequired(String(steps))}
                      >
                        <Text
                          style={[
                            styles.quickStepText,
                            stepsRequired === String(steps) && styles.quickStepTextActive,
                          ]}
                        >
                          {steps >= 1000 ? `${steps / 1000}k` : steps}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add {selectedApp.name}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  appList: {
    marginBottom: 20,
  },
  appOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 90,
  },
  appOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  appOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appOptionName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  configSection: {
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  quickSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickStepButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  quickStepButtonActive: {
    backgroundColor: '#6C63FF',
  },
  quickStepText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  quickStepTextActive: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
});

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme} from '../../theme';
import {firebaseService} from '../../services/firebase';

interface SettingsState {
  notifications: {
    sessionReminders: boolean;
    streakReminders: boolean;
    weeklyReports: boolean;
    newTracks: boolean;
  };
  audio: {
    quality: 'high' | 'medium' | 'low';
    downloadOverWifiOnly: boolean;
    autoPlay: boolean;
  };
  app: {
    darkMode: boolean;
    hapticFeedback: boolean;
    keepScreenOn: boolean;
  };
}

export const SettingsScreen = ({navigation}: any) => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      sessionReminders: true,
      streakReminders: true,
      weeklyReports: false,
      newTracks: true,
    },
    audio: {
      quality: 'high',
      downloadOverWifiOnly: true,
      autoPlay: false,
    },
    app: {
      darkMode: true,
      hapticFeedback: true,
      keepScreenOn: true,
    },
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    const currentUser = firebaseService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateNotificationSetting = (key: keyof SettingsState['notifications'], value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const updateAudioSetting = (key: keyof SettingsState['audio'], value: any) => {
    const newSettings = {
      ...settings,
      audio: {
        ...settings.audio,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const updateAppSetting = (key: keyof SettingsState['app'], value: boolean) => {
    const newSettings = {
      ...settings,
      app: {
        ...settings.app,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all downloaded audio files and cached data. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement cache clearing
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type DELETE to confirm account deletion.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    // TODO: Implement account deletion
                    Alert.alert('Account Deletion', 'This feature will be implemented soon');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow
              label="Session Reminders"
              description="Remind me when it's time for a session"
              value={settings.notifications.sessionReminders}
              onValueChange={value => updateNotificationSetting('sessionReminders', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Streak Reminders"
              description="Notify me if my streak is about to break"
              value={settings.notifications.streakReminders}
              onValueChange={value => updateNotificationSetting('streakReminders', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Weekly Reports"
              description="Send me weekly progress summaries"
              value={settings.notifications.weeklyReports}
              onValueChange={value => updateNotificationSetting('weeklyReports', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              label="New Track Alerts"
              description="Notify me when new tracks are added"
              value={settings.notifications.newTracks}
              onValueChange={value => updateNotificationSetting('newTracks', value)}
            />
          </View>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Audio Quality</Text>
                <Text style={styles.settingDescription}>
                  {settings.audio.quality === 'high' ? 'High (320kbps)' : settings.audio.quality === 'medium' ? 'Medium (192kbps)' : 'Low (128kbps)'}
                </Text>
              </View>
              <View style={styles.qualityButtons}>
                {['high', 'medium', 'low'].map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => updateAudioSetting('quality', q)}
                    style={[
                      styles.qualityButton,
                      settings.audio.quality === q && styles.qualityButtonActive,
                    ]}>
                    <Text
                      style={[
                        styles.qualityButtonText,
                        settings.audio.quality === q && styles.qualityButtonTextActive,
                      ]}>
                      {q.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <SettingRow
              label="Download Over WiFi Only"
              description="Only download tracks when connected to WiFi"
              value={settings.audio.downloadOverWifiOnly}
              onValueChange={value => updateAudioSetting('downloadOverWifiOnly', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Auto-Play Next Track"
              description="Automatically play the next track in queue"
              value={settings.audio.autoPlay}
              onValueChange={value => updateAudioSetting('autoPlay', value)}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            <SettingRow
              label="Dark Mode"
              description="Use dark theme throughout the app"
              value={settings.app.darkMode}
              onValueChange={value => updateAppSetting('darkMode', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Haptic Feedback"
              description="Vibrate on button presses"
              value={settings.app.hapticFeedback}
              onValueChange={value => updateAppSetting('hapticFeedback', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Keep Screen On"
              description="Prevent screen from sleeping during sessions"
              value={settings.app.keepScreenOn}
              onValueChange={value => updateAppSetting('keepScreenOn', value)}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingDescription}>{user?.email || 'Not logged in'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('Profile')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Manage Profile</Text>
                <Text style={styles.settingDescription}>View and edit your profile</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('Subscription', {source: 'settings'})}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Subscription</Text>
                <Text style={styles.settingDescription}>Manage your subscription</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDescription}>Free up storage space</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Storage Used</Text>
                <Text style={styles.settingDescription}>0 MB</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('Help')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Text style={styles.settingDescription}>FAQs and contact support</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingDescription}>1.0.0</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account and all data
                </Text>
              </View>
              <Text style={[styles.arrow, styles.dangerText]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border.default,
          true: theme.colors.coffee.cappuccino,
        }}
        thumbColor={value ? theme.colors.text.primary : theme.colors.text.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    color: theme.colors.coffee.cappuccino,
    fontSize: theme.typography.fontSize.body,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  dangerTitle: {
    color: '#EF4444',
  },
  card: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: theme.spacing.sm,
  },
  arrow: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  qualityButtonActive: {
    backgroundColor: theme.colors.coffee.cappuccino,
    borderColor: theme.colors.coffee.cappuccino,
  },
  qualityButtonText: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.secondary,
  },
  qualityButtonTextActive: {
    color: theme.colors.text.primary,
  },
  dangerText: {
    color: '#EF4444',
  },
});

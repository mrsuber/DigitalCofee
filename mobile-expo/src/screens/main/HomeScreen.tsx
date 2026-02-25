import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';
import {Button} from '../../components/common/Button';
import {apiService} from '../../services/api';
import {firebaseService} from '../../services/firebase';
import {Track, User} from '../../types';

export const HomeScreen = ({navigation}: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [alphaTracks, setAlphaTracks] = useState<Track[]>([]);
  const [betaTracks, setBetaTracks] = useState<Track[]>([]);
  const [selectedWave, setSelectedWave] = useState<'alpha' | 'beta' | null>(
    null,
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load user profile
    console.log('Fetching user profile...');
    const profileResult = await apiService.getUserProfile();
    console.log('Profile result:', JSON.stringify(profileResult, null, 2));

    if (profileResult.data) {
      setUser(profileResult.data);
      console.log('User set:', profileResult.data);
    } else if (profileResult.error) {
      console.error('Failed to load profile:', profileResult.error);

      // If user not found, try to create profile (fallback for edge cases)
      if (profileResult.error.includes('not found')) {
        console.log('User profile not found, attempting to create...');
        const currentUser = firebaseService.getCurrentUser();

        if (currentUser?.email && currentUser?.displayName) {
          // Try to create profile
          const createResult = await apiService.register(
            currentUser.email,
            '',
            currentUser.displayName || 'User',
          );

          if (createResult.error) {
            Alert.alert(
              'Profile Error',
              'Failed to create your profile. Please contact support.',
              [
                {
                  text: 'Sign Out',
                  onPress: () => firebaseService.signOut(),
                },
              ],
            );
          } else {
            // Profile created, reload data
            loadData();
            return;
          }
        } else {
          Alert.alert(
            'Profile Error',
            'Your account is missing required information. Please sign in again.',
            [
              {
                text: 'Sign Out',
                onPress: () => firebaseService.signOut(),
              },
            ],
          );
        }
      } else {
        Alert.alert('Profile Error', profileResult.error);
      }
    }

    // Load tracks
    console.log('Fetching tracks...');
    const tracksResult = await apiService.getTracks();
    console.log('Tracks result:', JSON.stringify(tracksResult, null, 2));

    if (tracksResult.data) {
      setAlphaTracks(tracksResult.data.alpha);
      setBetaTracks(tracksResult.data.beta);
    } else if (tracksResult.error) {
      console.error('Failed to load tracks:', tracksResult.error);
    }
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSelectWave = (wave: 'alpha' | 'beta') => {
    setSelectedWave(wave);
  };

  const handleStartSession = (track: Track) => {
    navigation.navigate('Player', {track});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name || 'There'}
            </Text>
            <Text style={styles.subtitle}>Ready to enhance your mind?</Text>
          </View>
          <TouchableOpacity onPress={handleProfile}>
            <Text style={styles.profileText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        {user && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.stats.totalSessions}
                </Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.stats.totalMinutes}
                </Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.stats.currentStreak}
                </Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* Wave Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Mode</Text>

          <TouchableOpacity
            onPress={() => handleSelectWave('alpha')}
            activeOpacity={0.8}
            style={styles.waveCardContainer}>
            <LinearGradient
              colors={[theme.colors.alpha.primary, theme.colors.alpha.light]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.waveCard,
                selectedWave === 'alpha' && styles.waveCardSelected,
              ]}>
              <Text style={styles.waveTitle}>Alpha Waves</Text>
              <Text style={styles.waveSubtitle}>8-12 Hz</Text>
              <Text style={styles.waveDescription}>
                Enhance creativity, relaxation, and ideation. Perfect for
                brainstorming and creative work.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectWave('beta')}
            activeOpacity={0.8}
            style={styles.waveCardContainer}>
            <LinearGradient
              colors={[theme.colors.beta.primary, theme.colors.beta.light]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.waveCard,
                selectedWave === 'beta' && styles.waveCardSelected,
              ]}>
              <Text style={styles.waveTitle}>Beta Waves</Text>
              <Text style={styles.waveSubtitle}>12-30 Hz</Text>
              <Text style={styles.waveDescription}>
                Boost focus, alertness, and active thinking. Ideal for tasks
                requiring concentration.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Track List */}
        {selectedWave && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedWave === 'alpha' ? 'Alpha' : 'Beta'} Tracks
            </Text>
            {(selectedWave === 'alpha' ? alphaTracks : betaTracks).map(
              track => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackCard}
                  onPress={() => handleStartSession(track)}>
                  <View>
                    <Text style={styles.trackName}>{track.name}</Text>
                    <Text style={styles.trackDuration}>
                      {Math.floor(track.duration / 60)} minutes
                    </Text>
                  </View>
                  <Text style={styles.playIcon}>▶</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  profileText: {
    color: theme.colors.coffee.cappuccino,
    fontSize: theme.typography.fontSize.bodySmall,
  },
  statsCard: {
    backgroundColor: theme.colors.background.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  statsTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.coffee.cappuccino,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border.default,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  waveCardContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  waveCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  waveCardSelected: {
    ...theme.shadows.xl,
  },
  waveTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  waveSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  waveDescription: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.bodySmall,
  },
  trackCard: {
    backgroundColor: theme.colors.background.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  trackDuration: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  playIcon: {
    fontSize: 24,
    color: theme.colors.coffee.cappuccino,
  },
});

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';
import {apiService} from '../../services/api';
import {firebaseService} from '../../services/firebase';
import {Track, User, Session} from '../../types';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - theme.spacing.lg * 2;

export const HomeScreen = ({navigation}: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [alphaTracks, setAlphaTracks] = useState<Track[]>([]);
  const [betaTracks, setBetaTracks] = useState<Track[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load user profile
    const profileResult = await apiService.getUserProfile();
    if (profileResult.data) {
      setUser(profileResult.data);
    } else if (profileResult.error) {
      console.error('Failed to load profile:', profileResult.error);
    }

    // Load tracks
    const tracksResult = await apiService.getTracks();
    if (tracksResult.data) {
      setAlphaTracks(tracksResult.data.alpha || []);
      setBetaTracks(tracksResult.data.beta || []);
    }

    // Load recent sessions
    const sessionsResult = await apiService.getSessions();
    if (sessionsResult.data) {
      const recent = (sessionsResult.data.sessions || [])
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 3);
      setRecentSessions(recent);
    }

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeBasedEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '🌙';
  };

  const handleStartSession = (track: Track) => {
    navigation.navigate('Player', {track});
  };

  const handleWaveTypePress = (waveType: 'alpha' | 'beta') => {
    const tracks = waveType === 'alpha' ? alphaTracks : betaTracks;
    if (tracks.length > 0) {
      // Navigate to track selection or start with first track
      handleStartSession(tracks[0]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()} {getTimeBasedEmoji()}
            </Text>
            <Text style={styles.userName}>{user?.name || 'There'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileButton}>
            <LinearGradient
              colors={[theme.colors.coffee.cappuccino, theme.colors.coffee.brown]}
              style={styles.profileGradient}>
              <Text style={styles.profileInitials}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        {user && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak 🔥</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        )}

        {/* Main CTA - Wave Type Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Focus</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tracks')}>
              <Text style={styles.seeAllText}>Browse All</Text>
            </TouchableOpacity>
          </View>

          {/* Alpha Wave Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleWaveTypePress('alpha')}
            style={styles.waveCardContainer}>
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.waveCard}>
              <View style={styles.waveCardHeader}>
                <View style={styles.waveIcon}>
                  <Text style={styles.waveEmoji}>🌊</Text>
                </View>
                <View style={styles.waveBadge}>
                  <Text style={styles.waveBadgeText}>8-12 Hz</Text>
                </View>
              </View>
              <Text style={styles.waveCardTitle}>Alpha Waves</Text>
              <Text style={styles.waveCardSubtitle}>Creativity & Relaxation</Text>
              <View style={styles.waveCardBenefits}>
                <Text style={styles.benefitTag}>✨ Creative Flow</Text>
                <Text style={styles.benefitTag}>🧘 Deep Calm</Text>
                <Text style={styles.benefitTag}>💡 Ideation</Text>
              </View>
              <View style={styles.waveCardFooter}>
                <Text style={styles.trackCount}>{alphaTracks.length} tracks</Text>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>Start →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Beta Wave Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleWaveTypePress('beta')}
            style={styles.waveCardContainer}>
            <LinearGradient
              colors={['#2563EB', '#60A5FA']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.waveCard}>
              <View style={styles.waveCardHeader}>
                <View style={styles.waveIcon}>
                  <Text style={styles.waveEmoji}>⚡</Text>
                </View>
                <View style={styles.waveBadge}>
                  <Text style={styles.waveBadgeText}>12-30 Hz</Text>
                </View>
              </View>
              <Text style={styles.waveCardTitle}>Beta Waves</Text>
              <Text style={styles.waveCardSubtitle}>Focus & Productivity</Text>
              <View style={styles.waveCardBenefits}>
                <Text style={styles.benefitTag}>🎯 Sharp Focus</Text>
                <Text style={styles.benefitTag}>⚡ High Energy</Text>
                <Text style={styles.benefitTag}>🧠 Active Mind</Text>
              </View>
              <View style={styles.waveCardFooter}>
                <Text style={styles.trackCount}>{betaTracks.length} tracks</Text>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>Start →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Listening</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentSessions.map((session) => (
              <View key={session.id} style={styles.recentSessionCard}>
                <View style={styles.sessionIconContainer}>
                  <Text style={styles.sessionIcon}>
                    {session.waveType === 'alpha' ? '🌊' : '⚡'}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionType}>
                    {session.waveType === 'alpha' ? 'Alpha' : 'Beta'} Session
                  </Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })} • {session.duration} min
                  </Text>
                </View>
                {session.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{height: theme.spacing.xl * 2}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.fontSize.h3,
    color: theme.colors.text.muted,
    fontWeight: theme.typography.fontWeight.medium,
  },
  userName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  profileButton: {
    borderRadius: 50,
    ...theme.shadows.md,
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
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
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.coffee.cappuccino,
    fontWeight: theme.typography.fontWeight.medium,
  },
  waveCardContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.xl,
  },
  waveCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  waveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  waveIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveEmoji: {
    fontSize: 32,
  },
  waveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  waveBadgeText: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  waveCardTitle: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  waveCardSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.md,
  },
  waveCardBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  benefitTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.primary,
  },
  waveCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  trackCount: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  playButtonText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  recentSessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  sessionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sessionIcon: {
    fontSize: 24,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sessionDate: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

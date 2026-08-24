import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';
import {apiService} from '../../services/api';
import {firebaseService} from '../../services/firebase';
import {Track, User, Session} from '../../types';

const {width} = Dimensions.get('window');

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

    try {
      // Load user profile
      const profileResult = await apiService.getUserProfile();
      if (profileResult.data) {
        setUser(profileResult.data);
      } else if (profileResult.error) {
        console.error('Failed to load profile:', profileResult.error);
        // Don't show alert for auth errors on initial load
        if (!profileResult.error.includes('Unauthorized')) {
          Alert.alert('Error', profileResult.error);
        }
      }

      // Load tracks
      const tracksResult = await apiService.getTracks();
      if (tracksResult.data) {
        setAlphaTracks(tracksResult.data.alpha || []);
        setBetaTracks(tracksResult.data.beta || []);
      } else if (tracksResult.error) {
        console.error('Failed to load tracks:', tracksResult.error);
      }

      // Load recent sessions
      const sessionsResult = await apiService.getSessions();
      if (sessionsResult.data) {
        const recent = (sessionsResult.data.sessions || [])
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, 3);
        setRecentSessions(recent);
      } else if (sessionsResult.error) {
        console.error('Failed to load sessions:', sessionsResult.error);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleStartSession = (track: Track) => {
    navigation.navigate('Player', {track});
  };

  const handleWaveTypePress = (waveType: 'alpha' | 'beta') => {
    const tracks = waveType === 'alpha' ? alphaTracks : betaTracks;
    if (tracks.length > 0) {
      handleStartSession(tracks[0]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Welcome'}</Text>
              <Text style={styles.tagline}>Find your focus, unlock your flow</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}>
              <LinearGradient
                colors={['#a78bfa', '#7c3aed']}
                style={styles.profileGradient}>
                <Text style={styles.profileInitials}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Cards with Glassmorphism */}
          {user && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.statGradient}>
                  <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                  <Text style={styles.statEmoji}>🔥</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.statGradient}>
                  <Text style={styles.statValue}>{user.stats.totalSessions}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                  <Text style={styles.statEmoji}>🎯</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.statGradient}>
                  <Text style={styles.statValue}>{user.stats.totalMinutes}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                  <Text style={styles.statEmoji}>⏱️</Text>
                </LinearGradient>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Featured Session */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Start Your Session</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tracks')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Alpha Wave - Featured */}
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => handleWaveTypePress('alpha')}
              style={styles.featuredCard}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.featuredGradient}>
                <View style={styles.featuredContent}>
                  <View style={styles.featuredHeader}>
                    <View style={styles.waveIconLarge}>
                      <Text style={styles.waveEmojiLarge}>🌊</Text>
                    </View>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>RECOMMENDED</Text>
                    </View>
                  </View>

                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredTitle}>Alpha Waves</Text>
                    <Text style={styles.featuredFrequency}>8-12 Hz</Text>
                    <Text style={styles.featuredSubtitle}>
                      Perfect for creative thinking, relaxation, and flow state
                    </Text>
                  </View>

                  <View style={styles.featuredFooter}>
                    <View style={styles.benefitsList}>
                      <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>✨</Text>
                        <Text style={styles.benefitText}>Creative Flow</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>🧘</Text>
                        <Text style={styles.benefitText}>Deep Calm</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>💡</Text>
                        <Text style={styles.benefitText}>Ideation</Text>
                      </View>
                    </View>

                    <View style={styles.startButtonContainer}>
                      <View style={styles.startButton}>
                        <Text style={styles.startButtonText}>Begin Session</Text>
                        <Text style={styles.startArrow}>→</Text>
                      </View>
                      <Text style={styles.trackCountSmall}>{alphaTracks.length} tracks available</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Beta Wave - Compact */}
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => handleWaveTypePress('beta')}
              style={styles.compactCard}>
              <LinearGradient
                colors={['#1e3c72', '#2a5298', '#3a7bd5']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.compactGradient}>
                <View style={styles.compactContent}>
                  <View style={styles.compactLeft}>
                    <View style={styles.waveIconMedium}>
                      <Text style={styles.waveEmojiMedium}>⚡</Text>
                    </View>
                    <View style={styles.compactInfo}>
                      <Text style={styles.compactTitle}>Beta Waves</Text>
                      <Text style={styles.compactSubtitle}>Focus & Productivity</Text>
                      <View style={styles.compactBenefits}>
                        <Text style={styles.compactBenefit}>🎯 Sharp Focus</Text>
                        <Text style={styles.compactBenefit}>⚡ High Energy</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.compactRight}>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>12-30 Hz</Text>
                    </View>
                    <View style={styles.compactButton}>
                      <Text style={styles.compactButtonText}>Start →</Text>
                    </View>
                    <Text style={styles.trackCountTiny}>{betaTracks.length} tracks</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Continue Listening */}
          {recentSessions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentList}>
                {recentSessions.map((session, index) => (
                  <View key={session.id} style={styles.recentCard}>
                    <View style={styles.recentIconContainer}>
                      <Text style={styles.recentIcon}>
                        {session.waveType === 'alpha' ? '🌊' : '⚡'}
                      </Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentType}>
                        {session.waveType === 'alpha' ? 'Alpha' : 'Beta'} Session
                      </Text>
                      <Text style={styles.recentDate}>
                        {new Date(session.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })} · {session.duration} min
                      </Text>
                    </View>
                    {session.completed && (
                      <View style={styles.recentCheckmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('StreakCalendar')}>
              <LinearGradient
                colors={['rgba(251, 146, 60, 0.1)', 'rgba(251, 146, 60, 0.05)']}
                style={styles.quickActionGradient}>
                <Text style={styles.quickActionIcon}>📅</Text>
                <Text style={styles.quickActionTitle}>Calendar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Settings')}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                style={styles.quickActionGradient}>
                <Text style={styles.quickActionIcon}>⚙️</Text>
                <Text style={styles.quickActionTitle}>Settings</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Help')}>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                style={styles.quickActionGradient}>
                <Text style={styles.quickActionIcon}>💬</Text>
                <Text style={styles.quickActionTitle}>Help</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{height: 40}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  profileButton: {
    borderRadius: 50,
    shadowColor: '#7c3aed',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    paddingTop: theme.spacing.xl,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 15,
    color: '#a78bfa',
    fontWeight: '600',
  },
  featuredCard: {
    marginBottom: theme.spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  featuredGradient: {
    borderRadius: 24,
  },
  featuredContent: {
    padding: theme.spacing.xl,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  waveIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveEmojiLarge: {
    fontSize: 40,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: 1,
  },
  featuredInfo: {
    marginBottom: theme.spacing.lg,
  },
  featuredTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
    letterSpacing: -1,
  },
  featuredFrequency: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 12,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  featuredFooter: {
    gap: theme.spacing.lg,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  benefitIcon: {
    fontSize: 16,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  startButtonContainer: {
    gap: 8,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  startArrow: {
    fontSize: 20,
    color: '#1a1a2e',
    fontWeight: '700',
  },
  trackCountSmall: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  compactCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2a5298',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  compactGradient: {
    borderRadius: 20,
  },
  compactContent: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  waveIconMedium: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveEmojiMedium: {
    fontSize: 28,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  compactSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  compactBenefits: {
    flexDirection: 'row',
    gap: 8,
  },
  compactBenefit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  frequencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  compactButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  compactButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e3c72',
  },
  trackCountTiny: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  recentList: {
    gap: theme.spacing.sm,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  recentIcon: {
    fontSize: 24,
  },
  recentInfo: {
    flex: 1,
  },
  recentType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  recentCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionTitle: {
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
});

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme} from '../../theme';
import {apiService} from '../../services/api';
import {User, Session, Track} from '../../types';
import {MODES, getModeByWaveType, type WaveType, type Mode} from '../../config/modes';
import {needsReassessment} from '../../config/moodAssessment';
import {BrainPulse} from '../../components/BrainPulse';
import {GlassCard} from '../../components/GlassCard';
import {mindControlTheme} from '../../theme/newDesignSystem';

const {width, height} = Dimensions.get('window');

export const HomeScreen = ({navigation}: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [recommendedModes, setRecommendedModes] = useState<WaveType[]>([]);
  const [completedModes, setCompletedModes] = useState<WaveType[]>([]);
  const [currentModeConfig, setCurrentModeConfig] = useState<Mode | null>(null);
  const [nextModeConfig, setNextModeConfig] = useState<Mode | null>(null);
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [tracks, setTracks] = useState<Track[]>([]);
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
      }

      // Load assessment data
      const recommendedModesStr = await AsyncStorage.getItem('recommended_modes');
      const completedModesStr = await AsyncStorage.getItem('completed_modes');
      const goal = await AsyncStorage.getItem('primary_goal');

      if (recommendedModesStr) {
        const modes = JSON.parse(recommendedModesStr) as WaveType[];
        setRecommendedModes(modes);

        const completed = completedModesStr ? JSON.parse(completedModesStr) : [];
        setCompletedModes(completed);

        // Find the next mode that hasn't been completed
        const nextMode = modes.find(mode => !completed.includes(mode));
        if (nextMode) {
          setCurrentModeConfig(getModeByWaveType(nextMode));

          // Find the mode after next
          const currentIndex = modes.indexOf(nextMode);
          if (currentIndex < modes.length - 1) {
            setNextModeConfig(getModeByWaveType(modes[currentIndex + 1]));
          }
        }

        setPrimaryGoal(goal || 'Wellness');

        // Check if reassessment is needed
        if (needsReassessment(completed, modes)) {
          showReassessmentPrompt();
        }
      }

      // Load tracks
      const tracksResult = await apiService.getTracks();
      if (tracksResult.data) {
        const allTracks = [
          ...(tracksResult.data.alpha || []),
          ...(tracksResult.data.beta || []),
        ];
        setTracks(allTracks);
      }

      // Load recent sessions
      const sessionsResult = await apiService.getSessions();
      if (sessionsResult.data) {
        const recent = (sessionsResult.data.sessions || [])
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, 3);
        setRecentSessions(recent);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showReassessmentPrompt = () => {
    Alert.alert(
      'Congratulations! 🎉',
      "You've completed all your personalized modes! Take a new assessment to discover more ways to enhance your mental state.",
      [
        {text: 'Later', style: 'cancel'},
        {
          text: 'Take Assessment',
          onPress: () => navigation.navigate('MoodAssessment'),
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getQueueProgress = () => {
    const total = recommendedModes.length;
    const completed = completedModes.length;
    return {completed, total, percentage: total > 0 ? (completed / total) * 100 : 0};
  };

  const handleStartCurrentMode = () => {
    if (!currentModeConfig) return;

    // Find a track matching this wave type
    const matchingTrack = tracks.find(
      track => track.waveType === currentModeConfig.waveType
    );

    if (matchingTrack) {
      navigation.navigate('Player', {
        track: matchingTrack,
        mode: currentModeConfig,
      });
    } else {
      Alert.alert('No Tracks Available', 'Please check your connection and try again.');
    }
  };

  const progress = getQueueProgress();

  if (loading || !currentModeConfig) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[
            mindControlTheme.colors.background.deep,
            mindControlTheme.colors.background.space,
          ] as readonly [string, string, ...string[]]}
          style={StyleSheet.absoluteFill}
        />
        <BrainPulse
          size={100}
          colors={['#06b6d4', '#3b82f6', '#6366f1']}
          pulseSpeed={1500}
          glowIntensity={0.9}
          active={true}
          showWaveform={true}
        />
        <Text style={styles.loadingText}>Initializing Mind Control Center...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          mindControlTheme.colors.background.deep,
          mindControlTheme.colors.background.space,
          mindControlTheme.colors.background.nebula,
        ] as readonly [string, string, ...string[]]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated stars background */}
      <View style={styles.starsContainer}>
        {[...Array(40)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Operator'}</Text>
              <Text style={styles.tagline}>OBJECTIVE: {primaryGoal.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}>
              <LinearGradient
                colors={['#06b6d4', '#3b82f6']}
                style={styles.profileGradient}>
                <Text style={styles.profileInitials}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Central Brain Control */}
          <View style={styles.brainControlSection}>
            <View style={styles.brainContainer}>
              <BrainPulse
                size={180}
                colors={currentModeConfig.gradient.colors as string[]}
                pulseSpeed={2000}
                glowIntensity={0.9}
                active={true}
                showWaveform={true}
              />

              {/* Orbiting Progress Rings */}
              <View style={styles.progressRings}>
                <View style={[styles.progressRing, {width: 220, height: 220}]}>
                  <View style={styles.progressRingInner} />
                </View>
              </View>
            </View>

            <View style={styles.statusPanel}>
              <Text style={styles.statusLabel}>ACTIVE MODE</Text>
              <Text style={styles.statusValue}>{currentModeConfig.name}</Text>
              <Text style={styles.statusSubtitle}>{currentModeConfig.subtitle}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          {user && (
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard} blur={8} opacity={0.08} borderGlow={true} glowColor="#06b6d4">
                <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
                <Text style={styles.statLabel}>DAY STREAK</Text>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🔥</Text>
                </View>
              </GlassCard>
              <GlassCard style={styles.statCard} blur={8} opacity={0.08} borderGlow={true} glowColor="#3b82f6">
                <Text style={styles.statValue}>{user.stats.totalSessions}</Text>
                <Text style={styles.statLabel}>SESSIONS</Text>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>⚡</Text>
                </View>
              </GlassCard>
              <GlassCard style={styles.statCard} blur={8} opacity={0.08} borderGlow={true} glowColor="#6366f1">
                <Text style={styles.statValue}>{user.stats.totalMinutes}</Text>
                <Text style={styles.statLabel}>MINUTES</Text>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>⏱️</Text>
                </View>
              </GlassCard>
              <GlassCard style={styles.statCard} blur={8} opacity={0.08} borderGlow={true} glowColor="#a855f7">
                <Text style={styles.statValue}>{progress.completed}/{progress.total}</Text>
                <Text style={styles.statLabel}>PROTOCOL</Text>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🎯</Text>
                </View>
              </GlassCard>
            </View>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Current Mode - Transmission Ready */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TRANSMISSION READY</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleStartCurrentMode}>
                <GlassCard
                  style={styles.currentModeCard}
                  blur={10}
                  opacity={0.1}
                  borderGlow={true}
                  glowColor={currentModeConfig.gradient.colors[0]}
                  useBlur={false}>
                  <View style={styles.currentModeHeader}>
                    <View
                      style={[
                        styles.modeIconLarge,
                        {backgroundColor: currentModeConfig.gradient.colors[0] + '30'},
                      ]}>
                      <Text style={styles.modeEmojiLarge}>{currentModeConfig.icon}</Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>{currentModeConfig.waveType.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.modeName}>{currentModeConfig.name}</Text>
                  <Text style={styles.modeSubtitle}>{currentModeConfig.subtitle}</Text>
                  <Text style={styles.modeDescription} numberOfLines={2}>
                    {currentModeConfig.description}
                  </Text>

                  <View style={styles.neuralBenefits}>
                    <Text style={styles.neuralBenefitsTitle}>NEURAL BENEFITS</Text>
                    {currentModeConfig.benefits.slice(0, 2).map((benefit, index) => (
                      <Text key={index} style={styles.benefitText}>
                        → {benefit}
                      </Text>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={handleStartCurrentMode}
                    activeOpacity={0.8}
                    style={styles.transmitButtonWrapper}>
                    <LinearGradient
                      colors={currentModeConfig.gradient.colors as readonly [string, string, ...string[]]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.transmitButton}>
                      <Text style={styles.transmitButtonText}>INITIATE TRANSMISSION</Text>
                      <Text style={styles.transmitArrow}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            </View>

            {/* Next Mode Preview */}
            {nextModeConfig && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>QUEUED FREQUENCY</Text>
                <GlassCard
                  style={styles.nextModeCard}
                  blur={8}
                  opacity={0.06}
                  borderGlow={false}
                  useBlur={false}>
                  <View style={styles.nextModeContent}>
                    <View
                      style={[
                        styles.nextModeIcon,
                        {backgroundColor: nextModeConfig.gradient.colors[0] + '20'},
                      ]}>
                      <Text style={styles.nextModeEmoji}>{nextModeConfig.icon}</Text>
                    </View>
                    <View style={styles.nextModeInfo}>
                      <Text style={styles.nextModeName}>{nextModeConfig.name}</Text>
                      <Text style={styles.nextModeSubtitle}>{nextModeConfig.subtitle}</Text>
                    </View>
                    <View style={styles.lockIcon}>
                      <Text style={styles.lockEmoji}>🔒</Text>
                    </View>
                  </View>
                </GlassCard>
              </View>
            )}

            {/* Recent Transmissions */}
            {recentSessions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>TRANSMISSION LOG</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.seeAllText}>VIEW ALL</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentList}>
                  {recentSessions.map((session) => {
                    const modeConfig = getModeByWaveType(session.waveType as WaveType);
                    return (
                      <GlassCard
                        key={session.id}
                        style={styles.recentCard}
                        blur={6}
                        opacity={0.05}
                        borderGlow={false}
                        useBlur={false}>
                        <View
                          style={[
                            styles.recentIconContainer,
                            {backgroundColor: modeConfig.gradient.colors[0] + '30'},
                          ]}>
                          <Text style={styles.recentIcon}>{modeConfig.icon}</Text>
                        </View>
                        <View style={styles.recentInfo}>
                          <Text style={styles.recentModeName}>{modeConfig.name}</Text>
                          <Text style={styles.recentDate}>
                            {new Date(session.startTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })} · {session.duration} min
                          </Text>
                        </View>
                        {session.completed && (
                          <View style={styles.completedBadge}>
                            <Text style={styles.checkmark}>✓</Text>
                          </View>
                        )}
                      </GlassCard>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Control Panel */}
            <View style={styles.controlPanel}>
              <Text style={styles.sectionTitle}>CONTROL PANEL</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity onPress={() => navigation.navigate('StreakCalendar')}>
                  <GlassCard
                    style={styles.quickActionCard}
                    blur={8}
                    opacity={0.08}
                    borderGlow={true}
                    glowColor="#fb923c">
                    <Text style={styles.quickActionIcon}>📅</Text>
                    <Text style={styles.quickActionTitle}>CALENDAR</Text>
                  </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <GlassCard
                    style={styles.quickActionCard}
                    blur={8}
                    opacity={0.08}
                    borderGlow={true}
                    glowColor="#8b5cf6">
                    <Text style={styles.quickActionIcon}>⚙️</Text>
                    <Text style={styles.quickActionTitle}>SETTINGS</Text>
                  </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('MoodAssessment')}>
                  <GlassCard
                    style={styles.quickActionCard}
                    blur={8}
                    opacity={0.08}
                    borderGlow={true}
                    glowColor="#3b82f6">
                    <Text style={styles.quickActionIcon}>🧠</Text>
                    <Text style={styles.quickActionTitle}>RECALIBRATE</Text>
                  </GlassCard>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{height: 40}} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mindControlTheme.colors.background.deep,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 24,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  profileButton: {
    borderRadius: 50,
    shadowColor: '#06b6d4',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  profileGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  brainControlSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  brainContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressRings: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderStyle: 'dashed',
  },
  progressRingInner: {
    flex: 1,
  },
  statusPanel: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  mainContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 2,
  },
  seeAllText: {
    fontSize: 11,
    color: '#06b6d4',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  currentModeCard: {
    marginBottom: 4,
  },
  currentModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modeIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeEmojiLarge: {
    fontSize: 32,
  },
  frequencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  frequencyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  modeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  modeSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginBottom: 12,
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 16,
  },
  neuralBenefits: {
    marginBottom: 20,
  },
  neuralBenefitsTitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 6,
  },
  transmitButtonWrapper: {
    marginTop: 4,
  },
  transmitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#06b6d4',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  transmitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginRight: 10,
  },
  transmitArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  nextModeCard: {
    marginBottom: 4,
  },
  nextModeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  nextModeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextModeEmoji: {
    fontSize: 26,
  },
  nextModeInfo: {
    flex: 1,
  },
  nextModeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  nextModeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  lockIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockEmoji: {
    fontSize: 18,
    opacity: 0.5,
  },
  recentList: {
    gap: 12,
  },
  recentCard: {
    marginBottom: 2,
  },
  recentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recentIcon: {
    fontSize: 24,
  },
  recentInfo: {
    flex: 1,
  },
  recentModeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  checkmark: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  controlPanel: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  quickActionIcon: {
    fontSize: 32,
  },
  quickActionTitle: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default HomeScreen;

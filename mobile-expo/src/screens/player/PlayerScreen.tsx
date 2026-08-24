import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Audio} from 'expo-av';
import {theme} from '../../theme';
import {apiService} from '../../services/api';
import {Track} from '../../types';
import {getModeByWaveType, type Mode} from '../../config/modes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

interface PlayerScreenProps {
  route: {
    params: {
      track: Track;
      mode?: Mode;
    };
  };
  navigation: any;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  route,
  navigation,
}) => {
  const {track, mode: providedMode} = route.params;

  // Get mode configuration
  const modeConfig = providedMode || getModeByWaveType(track.waveType as any);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.duration);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const sessionStartTime = useRef<number>(0);

  // Animation values
  const rotationValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  // Gradient colors from mode configuration
  const gradientColors = modeConfig.gradient.colors as readonly [string, string, ...string[]];

  useEffect(() => {
    loadAudio();
    startWaveAnimation();

    return () => {
      cleanup();
    };
  }, []);

  // Rotation animation for vinyl effect
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotationValue, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationValue.stopAnimation();
    }
  }, [isPlaying]);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const waveOpacity = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const loadAudio = async () => {
    try {
      setIsLoading(true);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const audioUrl = `https://digitalcoffee.cafe${track.file}`;
      console.log('Loading audio from:', audioUrl);

      const {sound, status} = await Audio.Sound.createAsync(
        {uri: audioUrl},
        {shouldPlay: false},
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;

      if (status.isLoaded) {
        setDuration(status.durationMillis ? status.durationMillis / 1000 : track.duration);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load audio:', error);
      console.error('Audio URL:', `https://digitalcoffee.cafe${track.file}`);

      // Show user-friendly error message
      Alert.alert(
        'Audio Unavailable',
        'The audio file is temporarily unavailable. Please try another track or check back later.',
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);

      if (status.didJustFinish && !status.isLooping) {
        handleEndSession(true);
        navigation.goBack();
      }
    }
  };

  const startSession = async () => {
    try {
      const result = await apiService.startSession(track.id, track.waveType);
      if (result.data?.sessionId) {
        setSessionId(result.data.sessionId);
        sessionStartTime.current = Date.now();
        return true;
      } else {
        Alert.alert('Error', result.error || 'Failed to start session');
        return false;
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start session');
      return false;
    }
  };

  const handleEndSession = async (completed: boolean = false) => {
    if (!sessionId) return;

    try {
      const durationMinutes = Math.floor((Date.now() - sessionStartTime.current) / 60000);
      await apiService.endSession(sessionId, durationMinutes, completed);

      // If session completed, mark this mode as completed in the user's queue
      if (completed && modeConfig) {
        await markModeAsCompleted(modeConfig.waveType);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }

    setSessionId(null);
  };

  const markModeAsCompleted = async (waveType: string) => {
    try {
      const completedModesStr = await AsyncStorage.getItem('completed_modes');
      const completedModes = completedModesStr ? JSON.parse(completedModesStr) : [];

      if (!completedModes.includes(waveType)) {
        completedModes.push(waveType);
        await AsyncStorage.setItem('completed_modes', JSON.stringify(completedModes));
      }
    } catch (error) {
      console.error('Failed to mark mode as completed:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!soundRef.current) {
      Alert.alert('Error', 'Audio not loaded');
      return;
    }

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);

        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      } else {
        if (!sessionId) {
          const started = await startSession();
          if (!started) return;
        }

        await soundRef.current.playAsync();
        setIsPlaying(true);

        Animated.spring(scaleValue, {
          toValue: 1.05,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Playback failed');
    }
  };

  const handleClose = async () => {
    if (sessionId && isPlaying) {
      Alert.alert(
        'End Session?',
        'Are you sure you want to stop your session?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'End Session',
            style: 'destructive',
            onPress: async () => {
              if (soundRef.current) {
                await soundRef.current.stopAsync();
              }
              await handleEndSession(false);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      if (sessionId) {
        await handleEndSession(false);
      }
      navigation.goBack();
    }
  };

  const cleanup = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    if (sessionId) {
      await handleEndSession(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <View style={styles.closeIcon}>
              <Text style={styles.closeText}>✕</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.waveBadge}>
            <Text style={styles.waveBadgeText}>
              {modeConfig.subtitle}
            </Text>
          </View>
        </View>

        {/* Vinyl Disc Visualization */}
        <View style={styles.visualContainer}>
          <Animated.View
            style={[
              styles.outerRing,
              {
                opacity: waveOpacity,
                transform: [{scale: scaleValue}],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.vinylDisc,
              {
                transform: [{rotate: rotation}, {scale: scaleValue}],
              },
            ]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.vinylGradient}>
              <View style={styles.vinylCenter}>
                <Text style={styles.vinylEmoji}>
                  {modeConfig.icon}
                </Text>
              </View>
              {/* Grooves effect */}
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.groove,
                    {
                      width: 100 + i * 30,
                      height: 100 + i * 30,
                      borderRadius: (100 + i * 30) / 2,
                    },
                  ]}
                />
              ))}
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackName}>{modeConfig.name}</Text>
          <Text style={styles.waveType}>
            {modeConfig.subtitle}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            disabled={isLoading}
            style={styles.playButton}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={styles.playButtonGradient}>
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Session Indicator */}
        {sessionId && (
          <View style={styles.sessionIndicator}>
            <View style={styles.sessionDot} />
            <Text style={styles.sessionText}>
              {isPlaying ? 'Session in progress' : 'Session paused'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
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
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  outerRing: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  vinylDisc: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    ...theme.shadows.xl,
  },
  vinylGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.7) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  vinylEmoji: {
    fontSize: 48,
  },
  groove: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  trackInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  trackName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  waveType: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressSection: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  timeText: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressBarContainer: {
    height: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 3,
  },
  controls: {
    marginTop: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...theme.shadows.xl,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: '#1A1816',
  },
  sessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.semantic.success,
    marginRight: theme.spacing.sm,
  },
  sessionText: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.typography.fontWeight.medium,
  },
});

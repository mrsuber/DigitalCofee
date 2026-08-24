import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrainPulse } from '../components/BrainPulse';
import { mindControlTheme } from '../theme/newDesignSystem';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Sequence animation
    Animated.sequence([
      // Brain appears and grows
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Text fades in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      // Hold for a moment
      Animated.delay(800),
      // Fade out everything
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Navigate to next screen
      setTimeout(onComplete, 100);
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={mindControlTheme.colors.background.deep, mindControlTheme.colors.background.space, mindControlTheme.colors.background.nebula]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated stars/particles */}
      <View style={styles.starsContainer}>
        {[...Array(20)].map((_, i) => (
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

      {/* Main content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <BrainPulse
          size={160}
          colors={['#6366f1', '#a855f7', '#ec4899']}
          pulseSpeed={2000}
          glowIntensity={0.9}
          active={true}
          showWaveform={true}
        />

        <Animated.View style={[styles.textContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.title}>
            Digital <Text style={styles.titleAccent}>Coffee</Text>
          </Text>
          <Text style={styles.subtitle}>Take control of your mind</Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom loading indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loadingFill}
          />
        </View>
        <Text style={styles.loadingText}>POWERING ON...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
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
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#06b6d4',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    width: '60%',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
    letterSpacing: 2,
  },
});

export default SplashScreen;

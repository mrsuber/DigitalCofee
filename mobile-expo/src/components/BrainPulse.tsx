import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface BrainPulseProps {
  size?: number;
  colors?: string[];
  pulseSpeed?: number;
  glowIntensity?: number;
  active?: boolean;
  showWaveform?: boolean;
}

export const BrainPulse: React.FC<BrainPulseProps> = ({
  size = 120,
  colors = ['#6366f1', '#a855f7', '#ec4899'],
  pulseSpeed = 2000,
  glowIntensity = 0.8,
  active = true,
  showWaveform = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (active) {
      // Pulse animation (breathing effect)
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: pulseSpeed / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: pulseSpeed / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Slow rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Glow pulsing
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: glowIntensity,
            duration: pulseSpeed / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: pulseSpeed / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [active, pulseSpeed, glowIntensity]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow rings */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.3,
            height: size * 1.3,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.ring,
            {
              borderColor: colors[0],
              borderRadius: size * 0.65,
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.15,
            height: size * 1.15,
            opacity: glowAnim.interpolate({
              inputRange: [0.4, glowIntensity],
              outputRange: [0.6, 1],
            }),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.ring,
            {
              borderColor: colors[1],
              borderRadius: size * 0.575,
            },
          ]}
        />
      </Animated.View>

      {/* Main brain circle */}
      <Animated.View
        style={[
          styles.brainContainer,
          {
            width: size,
            height: size,
            transform: [{ scale: pulseAnim }, { rotate: rotation }],
          },
        ]}
      >
        <View
          style={[
            styles.brainCircle,
            {
              shadowColor: colors[0],
              shadowOpacity: glowIntensity,
            },
          ]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* SVG Brain illustration */}
          <Svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            style={styles.svgOverlay}
          >
            {/* Simplified brain paths */}
            <G opacity={0.9}>
              {/* Left hemisphere */}
              <Path
                d="M 70 60 Q 50 65, 45 80 Q 42 95, 48 110 Q 52 125, 62 135 Q 72 145, 85 148 Q 85 140, 85 130 Q 83 115, 80 100 Q 77 85, 75 70 Q 73 62, 70 60 Z"
                fill="rgba(255,255,255,0.3)"
              />
              {/* Right hemisphere */}
              <Path
                d="M 130 60 Q 150 65, 155 80 Q 158 95, 152 110 Q 148 125, 138 135 Q 128 145, 115 148 Q 115 140, 115 130 Q 117 115, 120 100 Q 123 85, 125 70 Q 127 62, 130 60 Z"
                fill="rgba(255,255,255,0.3)"
              />

              {showWaveform && (
                <Path
                  d="M 30 100 L 45 100 L 55 85 L 65 115 L 75 90 L 85 110 L 100 100 L 115 90 L 125 110 L 135 85 L 145 115 L 155 100 L 170 100"
                  stroke="#06b6d4"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              )}

              {/* Center glow */}
              <Circle cx="100" cy="100" r="8" fill="white" opacity="0.9" />
            </G>
          </Svg>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderRadius: 1000,
  },
  brainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  svgOverlay: {
    position: 'absolute',
  },
});

export default BrainPulse;

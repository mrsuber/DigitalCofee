import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MODES, type Mode } from '../config/modes';
import type { AssessmentResult } from '../config/moodAssessment';
import { GlassCard } from '../components/GlassCard';
import { mindControlTheme } from '../theme/newDesignSystem';
import { BrainPulse } from '../components/BrainPulse';

interface AssessmentResultsScreenProps {
  navigation: any;
  route: {
    params: {
      result: AssessmentResult;
    };
  };
  onComplete?: () => void;
}

export const AssessmentResultsScreen: React.FC<AssessmentResultsScreenProps> = ({
  navigation,
  route,
  onComplete,
}) => {
  const { result } = route.params;
  const recommendedModeConfigs = result.recommendedModes.map(
    waveType => MODES[waveType]
  );

  const handleGetStarted = async () => {
    // Make sure assessment is marked complete in storage
    await AsyncStorage.setItem('mood_assessment_completed', 'true');

    // Call the completion callback from AppNavigator
    // This will update the state and trigger navigation to main app
    if (onComplete) {
      onComplete();
    }

    // Small delay to ensure state updates propagate
    setTimeout(() => {
      // Reset to home screen
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    }, 100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          mindControlTheme.colors.background.deep,
          mindControlTheme.colors.background.space,
          mindControlTheme.colors.background.nebula,
        ] as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated stars background */}
      <View style={styles.starsContainer}>
        {[...Array(30)].map((_, i) => (
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

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Header with Brain Pulse */}
          <View style={styles.header}>
            <View style={styles.brainContainer}>
              <BrainPulse
                size={120}
                colors={['#06b6d4', '#3b82f6', '#6366f1']}
                pulseSpeed={2000}
                glowIntensity={0.9}
                active={true}
                showWaveform={true}
              />
            </View>
            <Text style={styles.title}>Calibration Complete</Text>
            <Text style={styles.subtitle}>
              Your mind-control protocol is ready
            </Text>
          </View>

          {/* User State Summary */}
          <GlassCard
            style={styles.summaryCard}
            blur={10}
            opacity={0.1}
            borderGlow={true}
            glowColor="#06b6d4"
          >
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>CURRENT STATE</Text>
              <Text style={styles.summaryValue}>{result.userState}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>PRIMARY OBJECTIVE</Text>
              <Text style={styles.summaryValue}>{result.primaryGoal}</Text>
            </View>
          </GlassCard>

          {/* Recommended Modes */}
          <View style={styles.modesSection}>
            <Text style={styles.sectionTitle}>Mind-Control Modes</Text>
            <Text style={styles.sectionSubtitle}>
              {recommendedModeConfigs.length} frequencies calibrated to your neural patterns
            </Text>

            <View style={styles.modesContainer}>
              {recommendedModeConfigs.map((mode, index) => (
                <ModeCard key={mode.id} mode={mode} index={index} />
              ))}
            </View>
          </View>

          {/* How It Works */}
          <GlassCard
            style={styles.howItWorksCard}
            blur={8}
            opacity={0.08}
            borderGlow={false}
          >
            <Text style={styles.sectionTitle}>Activation Protocol</Text>
            <View style={styles.stepsList}>
              <StepItem
                number={1}
                title="Begin Transmission"
                description="Start with your first mode and progress through your personalized sequence"
              />
              <StepItem
                number={2}
                title="Monitor Progress"
                description="Track your neural training sessions and maintain consistency"
              />
              <StepItem
                number={3}
                title="Unlock Advanced Modes"
                description="Complete your protocol to access higher-level frequency patterns"
              />
            </View>
          </GlassCard>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.7}
            style={styles.startButtonWrapper}
          >
            <LinearGradient
              colors={['#06b6d4', '#3b82f6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>ACTIVATE MIND CONTROL</Text>
              <Text style={styles.startButtonIcon}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

interface ModeCardProps {
  mode: Mode;
  index: number;
}

const ModeCard: React.FC<ModeCardProps> = ({ mode, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Stagger entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 150,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0.6, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.modeCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <Animated.View
        style={{
          shadowColor: mode.gradient.colors[0],
          shadowOpacity: shadowOpacity,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
          borderRadius: 20,
        }}
      >
        <GlassCard
          style={styles.modeGlass}
          blur={10}
          opacity={0.12}
          borderGlow={true}
          glowColor={mode.gradient.colors[0]}
          useBlur={false}
        >
          <View style={styles.modeHeader}>
            <View
              style={[
                styles.modeIconContainer,
                { backgroundColor: mode.gradient.colors[0] + '30' },
              ]}
            >
              <Text style={styles.modeIcon}>{mode.icon}</Text>
            </View>
            <View
              style={[
                styles.modeNumber,
                { backgroundColor: mode.gradient.colors[1] + '40' },
              ]}
            >
              <Text style={styles.modeNumberText}>{index + 1}</Text>
            </View>
          </View>

          <Text style={styles.modeName}>{mode.name}</Text>
          <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
          <Text style={styles.modeDescription}>{mode.description}</Text>

          <View style={styles.modeBenefits}>
            <Text style={styles.benefitsTitle}>NEURAL BENEFITS</Text>
            {mode.benefits.slice(0, 2).map((benefit, i) => (
              <Text key={i} style={styles.benefitItem}>
                → {benefit}
              </Text>
            ))}
          </View>
        </GlassCard>
      </Animated.View>
    </Animated.View>
  );
};

interface StepItemProps {
  number: number;
  title: string;
  description: string;
}

const StepItem: React.FC<StepItemProps> = ({ number, title, description }) => {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumberContainer}>
        <LinearGradient
          colors={['#06b6d4', '#3b82f6']}
          style={styles.stepNumber}
        >
          <Text style={styles.stepNumberText}>{number}</Text>
        </LinearGradient>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  brainContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  summaryCard: {
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#06b6d4',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  modesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    lineHeight: 20,
  },
  modesContainer: {
    gap: 16,
  },
  modeCard: {
    marginBottom: 4,
  },
  modeGlass: {
    padding: 0,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
    paddingBottom: 0,
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeIcon: {
    fontSize: 30,
  },
  modeNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  modeName: {
    fontSize: 21,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  modeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  modeBenefits: {
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  benefitsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  benefitItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 4,
  },
  howItWorksCard: {
    marginBottom: 30,
  },
  stepsList: {
    gap: 20,
    marginTop: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    marginRight: 16,
  },
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  startButtonWrapper: {
    marginTop: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 12,
    letterSpacing: 1.5,
  },
  startButtonIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
});

export default AssessmentResultsScreen;

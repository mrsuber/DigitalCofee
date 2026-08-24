import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ASSESSMENT_QUESTIONS,
  calculateRecommendedModes,
  type AssessmentOption,
} from '../config/moodAssessment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from '../components/GlassCard';
import { mindControlTheme } from '../theme/newDesignSystem';
import { BrainPulse } from '../components/BrainPulse';

const { width, height } = Dimensions.get('window');

interface MoodAssessmentScreenProps {
  navigation: any;
  onComplete?: () => void;
}

export const MoodAssessmentScreen: React.FC<MoodAssessmentScreenProps> = ({
  navigation,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;

  const handleSelectOption = async (optionId: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: optionId,
    };
    setAnswers(newAnswers);

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));

    if (isLastQuestion) {
      // Complete assessment
      await handleCompleteAssessment(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleCompleteAssessment = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);

    try {
      // Calculate recommended modes
      const result = calculateRecommendedModes(finalAnswers);

      // Save assessment data
      await AsyncStorage.setItem('mood_assessment_completed', 'true');
      await AsyncStorage.setItem('assessment_answers', JSON.stringify(finalAnswers));
      await AsyncStorage.setItem('recommended_modes', JSON.stringify(result.recommendedModes));
      await AsyncStorage.setItem('primary_goal', result.primaryGoal);
      await AsyncStorage.setItem('user_state', result.userState);
      await AsyncStorage.setItem('assessment_date', new Date().toISOString());

      // Initialize completed modes tracker
      await AsyncStorage.setItem('completed_modes', JSON.stringify([]));

      // Navigate to results or call completion callback
      if (onComplete) {
        onComplete();
      } else {
        navigation.replace('AssessmentResults', { result });
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
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
        {/* Header with Brain Pulse */}
        <View style={styles.header}>
          <View style={styles.brainHeader}>
            <BrainPulse
              size={60}
              colors={['#6366f1', '#a855f7', '#ec4899']}
              pulseSpeed={2000}
              glowIntensity={0.7}
              active={true}
              showWaveform={false}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Mind Calibration</Text>
              <Text style={styles.headerSubtitle}>
                {currentQuestionIndex + 1}/{ASSESSMENT_QUESTIONS.length}
              </Text>
            </View>
          </View>

          {/* Glowing Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#06b6d4', '#3b82f6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          {currentQuestionIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← BACK</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Question Section */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard
            style={styles.questionCard}
            blur={8}
            opacity={0.08}
            borderGlow={true}
            glowColor="#667eea"
          >
            <Text style={styles.questionNumber}>
              STEP {currentQuestionIndex + 1}
            </Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.subtitle && (
              <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
            )}
          </GlassCard>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={answers[currentQuestion.id] === option.id}
                onSelect={() => handleSelectOption(option.id)}
                disabled={isSubmitting}
                index={index}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

interface OptionCardProps {
  option: AssessmentOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  index: number;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  isSelected,
  onSelect,
  disabled,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Stagger entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    // Glow animation when selected
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected]);

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.optionWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onSelect}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.optionCard,
            isSelected && {
              shadowColor: '#667eea',
              shadowOpacity: shadowOpacity,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            },
          ]}
        >
          <GlassCard
            style={styles.optionGlass}
            blur={isSelected ? 12 : 8}
            opacity={isSelected ? 0.15 : 0.05}
            borderGlow={isSelected}
            glowColor="#667eea"
            useBlur={false}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description && (
                  <Text style={styles.optionDescription}>{option.description}</Text>
                )}
              </View>
            </View>

            {isSelected && (
              <Animated.View
                style={[
                  styles.selectedIndicator,
                  {
                    opacity: glowAnim,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#06b6d4', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.selectedGradient}
                >
                  <Text style={styles.checkmark}>✓</Text>
                </LinearGradient>
              </Animated.View>
            )}
          </GlassCard>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  brainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 10,
  },
  backButtonText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  questionCard: {
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 2,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 34,
  },
  questionSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 14,
  },
  optionWrapper: {
    marginBottom: 2,
  },
  optionCard: {
    borderRadius: 18,
  },
  optionGlass: {
    padding: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionIcon: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MoodAssessmentScreen;

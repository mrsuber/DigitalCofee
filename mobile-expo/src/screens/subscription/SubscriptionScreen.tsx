import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';

interface SubscriptionScreenProps {
  navigation: any;
  route?: {
    params?: {
      source?: string; // 'paywall' | 'profile' | 'settings'
    };
  };
}

type PlanType = 'monthly' | 'yearly' | 'elite-monthly' | 'elite-yearly' | 'lifetime';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
  features: string[];
  tier: 'premium' | 'elite' | 'lifetime';
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: '$9.99',
    period: '/month',
    tier: 'premium',
    features: [
      'Unlimited sessions per day',
      'All wave types (Delta, Theta, Alpha, Beta, Gamma)',
      'All audio tracks',
      'Offline downloads',
      'Ad-free experience',
      'Advanced analytics',
      'Streak protection (1/month)',
      'Background playback',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: '$79.99',
    period: '/year',
    savings: 'Save 33%',
    popular: true,
    tier: 'premium',
    features: [
      'Everything in Premium Monthly',
      'Save $40 per year',
      'Best value for regular users',
    ],
  },
  {
    id: 'elite-monthly',
    name: 'Elite Monthly',
    price: '$19.99',
    period: '/month',
    tier: 'elite',
    features: [
      'Everything in Premium',
      'Custom track creation (1/month)',
      'AI-powered recommendations',
      'Guided programs & challenges',
      'Sound mixing features',
      'Private community access',
      'Expert content library',
      'Priority support',
      'Early access to new features',
    ],
  },
  {
    id: 'elite-yearly',
    name: 'Elite Yearly',
    price: '$159.99',
    period: '/year',
    savings: 'Save 33%',
    tier: 'elite',
    features: [
      'Everything in Elite Monthly',
      'Save $80 per year',
      'Best value for power users',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    price: '$299',
    period: 'one-time',
    tier: 'lifetime',
    features: [
      'All Elite features forever',
      'Never pay again',
      'Exclusive "Founder" badge',
      'Influence feature development',
      'First access to beta features',
      'Support development',
    ],
  },
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [loading, setLoading] = useState(false);

  const source = route?.params?.source || 'profile';

  const handleSubscribe = async (planId: PlanType) => {
    setLoading(true);

    // TODO: Integrate with RevenueCat or Stripe
    // For now, show alert
    Alert.alert(
      'Coming Soon',
      'In-app purchases will be available soon. This will integrate with Apple App Store and Google Play Store.',
      [
        {
          text: 'OK',
          onPress: () => {
            setLoading(false);
          },
        },
      ],
    );

    // Actual implementation would be:
    // 1. Call RevenueCat to initiate purchase
    // 2. Handle purchase flow
    // 3. Verify with backend
    // 4. Update user subscription status
    // 5. Navigate back or show success message
  };

  const handleClose = () => {
    if (source === 'paywall') {
      // Don't allow closing from paywall easily
      Alert.alert(
        'Upgrade Required',
        'You need to upgrade to continue using the app.',
        [
          {text: 'Maybe Later', style: 'cancel', onPress: () => navigation.goBack()},
          {text: 'View Plans', style: 'default'},
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const getPlanColor = (tier: string): [string, string] => {
    switch (tier) {
      case 'elite':
        return ['#F59E0B', '#FCD34D'];
      case 'lifetime':
        return ['#7C3AED', '#A78BFA'];
      default:
        return ['#2563EB', '#60A5FA'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {source === 'paywall' ? 'Upgrade to Continue' : 'Choose Your Plan'}
        </Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Intro Text */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.introSubtitle}>
            Choose the plan that fits your journey to enhanced focus, creativity,
            and relaxation.
          </Text>
        </View>

        {/* Plans */}
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const gradientColors = getPlanColor(plan.tier);

          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.9}
              style={styles.planContainer}>
              <LinearGradient
                colors={
                  isSelected
                    ? gradientColors
                    : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                }
                style={[styles.planCard, isSelected && styles.planCardSelected]}>
                {/* Popular Badge */}
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>⭐ MOST POPULAR</Text>
                  </View>
                )}

                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <View>
                    <Text
                      style={[
                        styles.planName,
                        isSelected && styles.planNameSelected,
                      ]}>
                      {plan.name}
                    </Text>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text
                      style={[
                        styles.price,
                        isSelected && styles.priceSelected,
                      ]}>
                      {plan.price}
                    </Text>
                    <Text
                      style={[
                        styles.period,
                        isSelected && styles.periodSelected,
                      ]}>
                      {plan.period}
                    </Text>
                  </View>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text
                        style={[
                          styles.featureText,
                          isSelected && styles.featureTextSelected,
                        ]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Select Button */}
                {isSelected && (
                  <TouchableOpacity
                    onPress={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    style={styles.selectButton}>
                    <View style={styles.selectButtonInner}>
                      <Text style={styles.selectButtonText}>
                        {loading ? 'Processing...' : 'Subscribe Now'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • Cancel anytime, no questions asked
          </Text>
          <Text style={styles.footerText}>
            • 14-day free trial for new subscribers
          </Text>
          <Text style={styles.footerText}>
            • Secure payment via App Store / Google Play
          </Text>
        </View>

        {/* Terms */}
        <View style={styles.terms}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscriptions automatically renew unless auto-renew is turned off at
            least 24 hours before the end of the current period.
          </Text>
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  intro: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  introTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  introSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  planContainer: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  planCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: theme.spacing.lg,
    backgroundColor: '#F59E0B',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  popularText: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  planName: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  planNameSelected: {
    color: theme.colors.text.primary,
  },
  savingsBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  savingsText: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: '#22C55E',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
  priceSelected: {
    color: theme.colors.text.primary,
  },
  period: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
  },
  periodSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresContainer: {
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  checkmark: {
    fontSize: 16,
    color: '#22C55E',
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  featureTextSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  selectButton: {
    marginTop: theme.spacing.md,
  },
  selectButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#1A1816',
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  terms: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  termsText: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

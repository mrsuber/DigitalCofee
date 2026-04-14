import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';

const {height} = Dimensions.get('window');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason: 'daily-limit' | 'premium-track' | 'premium-feature';
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  reason,
}) => {
  const getContent = () => {
    switch (reason) {
      case 'daily-limit':
        return {
          emoji: '🚀',
          title: "You've Reached Your Daily Limit",
          subtitle: "You've completed 3 sessions today. Upgrade to continue your journey!",
          features: [
            'Unlimited sessions every day',
            'Access all wave types',
            'Offline downloads',
            'Advanced analytics',
            'Ad-free experience',
          ],
        };
      case 'premium-track':
        return {
          emoji: '🎵',
          title: 'Premium Track',
          subtitle: 'This track is only available to Premium and Elite subscribers.',
          features: [
            'Access all premium tracks',
            'Exclusive binaural beats',
            'Professionally mastered audio',
            'New tracks added monthly',
          ],
        };
      case 'premium-feature':
        return {
          emoji: '✨',
          title: 'Premium Feature',
          subtitle: 'Unlock this feature with Premium or Elite subscription.',
          features: [
            'Offline downloads',
            'Custom timers',
            'Mixing features',
            'Priority support',
          ],
        };
      default:
        return {
          emoji: '💎',
          title: 'Upgrade to Premium',
          subtitle: 'Get unlimited access to all features.',
          features: [],
        };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#7C3AED', '#2563EB']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}>
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* Emoji */}
              <Text style={styles.emoji}>{content.emoji}</Text>

              {/* Title */}
              <Text style={styles.title}>{content.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{content.subtitle}</Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {content.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Pricing Preview */}
              <View style={styles.pricingPreview}>
                <View style={styles.priceRow}>
                  <Text style={styles.planName}>Premium Yearly</Text>
                  <View>
                    <Text style={styles.price}>$79.99/year</Text>
                    <Text style={styles.savings}>Save 33%</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                  <Text style={styles.planName}>Premium Monthly</Text>
                  <Text style={styles.price}>$9.99/month</Text>
                </View>
              </View>

              {/* CTA Buttons */}
              <TouchableOpacity
                onPress={onUpgrade}
                activeOpacity={0.9}
                style={styles.upgradeButton}>
                <View style={styles.upgradeButtonInner}>
                  <Text style={styles.upgradeButtonText}>
                    Start 14-Day Free Trial
                  </Text>
                  <Text style={styles.upgradeButtonSubtext}>
                    Then $79.99/year
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.maybeLaterButton}>
                <Text style={styles.maybeLaterText}>Maybe Later</Text>
              </TouchableOpacity>

              {/* Fine Print */}
              <Text style={styles.finePrint}>
                Free trial for new subscribers only. Cancel anytime before trial
                ends to avoid charges. Auto-renews unless cancelled.
              </Text>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.85,
    borderTopLeftRadius: theme.borderRadius.xl * 2,
    borderTopRightRadius: theme.borderRadius.xl * 2,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: theme.spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  checkmark: {
    fontSize: 18,
    color: '#22C55E',
    marginRight: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  featureText: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  pricingPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  price: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  savings: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: '#22C55E',
    fontWeight: theme.typography.fontWeight.semiBold,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: theme.spacing.md,
  },
  upgradeButton: {
    marginBottom: theme.spacing.md,
  },
  upgradeButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#1A1816',
    marginBottom: 4,
  },
  upgradeButtonSubtext: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: '#6B7280',
  },
  maybeLaterButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  maybeLaterText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  finePrint: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: 16,
  },
});

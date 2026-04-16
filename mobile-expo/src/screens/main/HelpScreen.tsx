import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../../theme';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What are binaural beats?',
    answer:
      'Binaural beats are an auditory illusion created when two slightly different frequencies are played in each ear. Your brain perceives a third tone - the binaural beat - which can help induce specific mental states like relaxation, focus, or creativity.',
  },
  {
    question: 'How do I use Digital Coffee effectively?',
    answer:
      'For best results: 1) Use headphones or earbuds for proper binaural effect, 2) Choose a quiet environment, 3) Start with 10-20 minute sessions, 4) Use Alpha waves for creativity/relaxation and Beta waves for focus/productivity, 5) Be consistent - daily sessions yield better results.',
  },
  {
    question: 'What is the difference between Alpha and Beta waves?',
    answer:
      'Alpha waves (8-12 Hz) promote relaxation, creativity, and light meditation - ideal for creative work and stress relief. Beta waves (12-30 Hz) enhance focus, alertness, and active thinking - perfect for studying, work, and problem-solving.',
  },
  {
    question: 'Do I need headphones?',
    answer:
      'Yes, headphones or earbuds are essential for binaural beats to work properly. Each ear needs to receive a slightly different frequency, which is only possible with stereo headphones.',
  },
  {
    question: 'How long should my sessions be?',
    answer:
      'Start with 10-20 minute sessions and gradually increase to 30-60 minutes as you get comfortable. Most users find 20-30 minutes optimal for daily practice. Listen to your body and adjust accordingly.',
  },
  {
    question: 'What are streaks and why do they matter?',
    answer:
      'Streaks track consecutive days of completed sessions. Consistency is key to experiencing the full benefits of binaural beats. Streaks motivate you to maintain a regular practice and build a healthy habit.',
  },
  {
    question: 'Can I download tracks for offline use?',
    answer:
      'Yes! Premium and Elite subscribers can download tracks for offline listening. Simply tap the download icon on any track. Downloaded tracks are available in your Library even without internet.',
  },
  {
    question: 'What happens if I miss a day for my streak?',
    answer:
      'Your streak will reset to 0 if you miss a day. However, we give you until the end of the following day to maintain your streak (grace period). Premium users also get 1 streak freeze per month.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can manage your subscription through the App Store (iOS) or Google Play Store (Android). Go to Settings > Subscription > Manage Subscription. Cancellation takes effect at the end of your current billing period.',
  },
  {
    question: 'What is the difference between Premium and Elite?',
    answer:
      'Premium includes unlimited sessions, all tracks, offline downloads, and advanced stats. Elite adds custom track creation, AI recommendations, guided programs, sound mixing, private community access, and priority support.',
  },
];

export const HelpScreen = ({navigation}: any) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@digitalcoffee.cafe?subject=Support Request');
  };

  const handleReportBug = () => {
    Linking.openURL(
      'mailto:support@digitalcoffee.cafe?subject=Bug Report&body=Please describe the issue:',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={handleContactSupport}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>💬</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Contact Support</Text>
                <Text style={styles.actionDescription}>Get help from our team</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow} onPress={handleReportBug}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🐛</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Report a Bug</Text>
                <Text style={styles.actionDescription}>Help us improve the app</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.7}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.faqIcon}>
                    {expandedIndex === index ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                {expandedIndex === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📚</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>User Guide</Text>
                <Text style={styles.actionDescription}>Learn how to use the app</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🧠</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Science Behind Binaural Beats</Text>
                <Text style={styles.actionDescription}>Research and studies</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>💡</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Tips & Best Practices</Text>
                <Text style={styles.actionDescription}>Get the most out of sessions</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>👥</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Join Our Community</Text>
                <Text style={styles.actionDescription}>Connect with other users</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>⭐</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Rate the App</Text>
                <Text style={styles.actionDescription}>Share your feedback</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Still Need Help?</Text>
            <Text style={styles.contactText}>
              Our support team is here for you Monday-Friday, 9AM-5PM EST
            </Text>
            <Text style={styles.contactEmail}>support@digitalcoffee.cafe</Text>
          </View>
        </View>

        <View style={{height: 40}} />
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    color: theme.colors.coffee.cappuccino,
    fontSize: theme.typography.fontSize.body,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
  },
  arrow: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: theme.spacing.sm,
  },
  faqContainer: {
    gap: theme.spacing.sm,
  },
  faqItem: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.md,
  },
  faqIcon: {
    fontSize: 24,
    color: theme.colors.coffee.cappuccino,
    fontWeight: theme.typography.fontWeight.bold,
  },
  faqAnswer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  contactEmail: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.coffee.cappuccino,
  },
});

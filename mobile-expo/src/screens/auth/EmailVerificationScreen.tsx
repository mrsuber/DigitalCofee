import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {theme} from '../../theme';
import {Button} from '../../components/common/Button';
import {firebaseService} from '../../services/firebase';

export const EmailVerificationScreen = ({navigation, route}: any) => {
  const {email} = route.params;
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [lastSent, setLastSent] = useState<Date>(new Date());

  const handleResendEmail = async () => {
    // Prevent spam - only allow resend every 60 seconds
    const timeSinceLastSent = Date.now() - lastSent.getTime();
    if (timeSinceLastSent < 60000) {
      const secondsLeft = Math.ceil((60000 - timeSinceLastSent) / 1000);
      Alert.alert(
        'Please Wait',
        `You can resend the verification email in ${secondsLeft} seconds.`,
      );
      return;
    }

    setResending(true);

    try {
      const user = firebaseService.getCurrentUser();
      if (user) {
        // User is still signed in, resend verification
        const {sendEmailVerification} = await import('firebase/auth');
        await sendEmailVerification(user);
        setLastSent(new Date());
        Alert.alert(
          'Email Sent',
          'Verification email has been sent. Please check your inbox and spam folder.',
        );
      } else {
        Alert.alert(
          'Session Expired',
          'Please sign in again to resend verification email.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
      console.error('Resend verification error:', error);
    }

    setResending(false);
  };

  const handleCheckVerification = async () => {
    setLoading(true);

    try {
      const user = firebaseService.getCurrentUser();
      if (user) {
        // Reload user to get latest emailVerified status
        await user.reload();
        const updatedUser = firebaseService.getCurrentUser();

        if (updatedUser?.emailVerified) {
          Alert.alert(
            'Email Verified!',
            'Your email has been verified successfully. You can now sign in.',
            [
              {
                text: 'Continue to Login',
                onPress: () => {
                  firebaseService.signOut();
                  navigation.navigate('Login');
                },
              },
            ],
          );
        } else {
          Alert.alert(
            'Not Verified Yet',
            'Your email has not been verified yet. Please check your inbox and click the verification link.',
          );
        }
      } else {
        // User session expired, go to login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Check verification error:', error);
      Alert.alert('Error', 'Failed to check verification status.');
    }

    setLoading(false);
  };

  const handleBackToLogin = () => {
    firebaseService.signOut();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📧</Text>
        </View>

        <Text style={styles.title}>Verify Your Email</Text>

        <Text style={styles.description}>
          We've sent a verification link to:
        </Text>

        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instructions}>
          Please check your email and click the verification link to activate
          your account. Don't forget to check your spam folder!
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="I've Verified - Continue"
            onPress={handleCheckVerification}
            loading={loading}
            style={styles.primaryButton}
          />

          <Button
            title={resending ? 'Sending...' : 'Resend Verification Email'}
            onPress={handleResendEmail}
            loading={resending}
            style={styles.secondaryButton}
          />

          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            • Make sure to check your spam/junk folder
          </Text>
          <Text style={styles.helpText}>
            • Add noreply@digitalcoffee.cafe to your contacts
          </Text>
          <Text style={styles.helpText}>
            • Wait a few minutes for the email to arrive
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing['2xl'],
  },
  iconText: {
    fontSize: 80,
  },
  title: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  email: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.coffee.cappuccino,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  instructions: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.body,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.md,
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.coffee.cappuccino,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
  },
  helpContainer: {
    marginTop: theme.spacing['2xl'],
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
  },
  helpTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.lineHeight.bodySmall,
  },
});

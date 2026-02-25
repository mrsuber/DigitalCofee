import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {theme} from '../../theme';
import {Button} from '../../components/common/Button';
import {Input} from '../../components/common/Input';
import {firebaseService} from '../../services/firebase';
import {apiService} from '../../services/api';
import {useGoogleAuth} from '../../hooks/useGoogleAuth';

export const RegisterScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const {signInWithGoogle, loading: googleLoading} = useGoogleAuth();

  const validate = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    console.log('Starting registration for:', email);

    // First create Firebase auth user
    const authResult = await firebaseService.signUp(email, password);

    if (authResult.error) {
      console.error('Firebase signup error:', authResult.error);
      Alert.alert('Registration Failed', authResult.error);
      setLoading(false);
      return;
    }

    console.log('Firebase user created, creating backend profile...');

    // Then create user profile in backend (Firebase token is now available)
    const apiResult = await apiService.register(email, '', name);

    if (apiResult.error) {
      console.error('Backend profile creation error:', apiResult.error);
      // If backend profile creation fails, sign out to prevent partial registration
      await firebaseService.signOut();
      Alert.alert(
        'Registration Failed',
        `Could not create your profile: ${apiResult.error}. Please try again.`,
      );
      setLoading(false);
      return;
    }

    console.log('Registration successful, navigating to verification screen');

    // Navigate to email verification screen
    setLoading(false);
    navigation.navigate('EmailVerification', {email});
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();

    if (result.error) {
      Alert.alert('Google Sign-In Failed', result.error);
    }
    // Navigation will be handled by auth state listener
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Digital Coffee and start enhancing your creativity and focus
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                googleLoading && styles.googleButtonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || loading}>
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Signing in...' : '🔐 Continue with Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: theme.spacing['2xl'],
  },
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.body,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.coffee.dark,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.small,
  },
  googleButton: {
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.coffee.dark,
  },
  googleButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  linkContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.body,
  },
  linkTextBold: {
    color: theme.colors.coffee.cappuccino,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

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
} from 'react-native';
import {theme} from '../../theme';
import {Button} from '../../components/common/Button';
import {Input} from '../../components/common/Input';
import {firebaseService} from '../../services/firebase';
import {apiService} from '../../services/api';
import {useGoogleAuth} from '../../hooks/useGoogleAuth';

export const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>(
    {},
  );
  const {signInWithGoogle, loading: googleLoading} = useGoogleAuth();

  const validate = () => {
    const newErrors: {email?: string; password?: string} = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    const result = await firebaseService.signIn(email, password);

    if (result.error) {
      Alert.alert('Login Failed', result.error);
      setLoading(false);
    } else if (result.user && !result.user.emailVerified) {
      // Email not verified - navigate to verification screen
      setLoading(false);
      navigation.navigate('EmailVerification', {email});
    } else {
      // Navigation will be handled by auth state listener
      setLoading(false);
    }
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
        <View style={styles.header}>
          <Text style={styles.logo}>ÐC</Text>
          <Text style={styles.title}>Digital Coffee</Text>
          <Text style={styles.subtitle}>Brew Your Best Thoughts</Text>
        </View>

        <View style={styles.form}>
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

          <Button
            title="Sign In"
            onPress={handleLogin}
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
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logo: {
    fontSize: 64,
    color: theme.colors.coffee.brown,
    marginBottom: theme.spacing.md,
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

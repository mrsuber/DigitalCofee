import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {theme} from '../../theme';
import {Button} from '../../components/common/Button';
import {Input} from '../../components/common/Input';
import {firebaseService} from '../../services/firebase';
import {apiService} from '../../services/api';
import {User} from '../../types';

export const ProfileScreen = ({navigation}: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);

  // For linking password
  const [showLinkPassword, setShowLinkPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({});

  useEffect(() => {
    loadProfile();
    checkAuthMethods();
  }, []);

  const loadProfile = async () => {
    const profileResult = await apiService.getUserProfile();
    if (profileResult.data) {
      setUser(profileResult.data);
    } else if (profileResult.error) {
      Alert.alert('Profile Error', profileResult.error);
    }
  };

  const checkAuthMethods = () => {
    setHasPassword(firebaseService.hasPasswordAuth());
    setHasGoogle(firebaseService.hasGoogleAuth());
  };

  const validate = () => {
    const newErrors: {password?: string; confirmPassword?: string} = {};

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

  const handleLinkPassword = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    const currentUser = firebaseService.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      Alert.alert('Error', 'Unable to get user email');
      setLoading(false);
      return;
    }

    const result = await firebaseService.linkEmailPassword(
      currentUser.email,
      password,
    );

    if (result.error) {
      Alert.alert('Link Password Failed', result.error);
      setLoading(false);
    } else {
      Alert.alert(
        'Password Added',
        'Password authentication has been added to your account. A verification email has been sent.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowLinkPassword(false);
              setPassword('');
              setConfirmPassword('');
              checkAuthMethods();
            },
          },
        ],
      );
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await firebaseService.signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile & Settings</Text>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Authentication Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sign-In Methods</Text>
          <View style={styles.infoCard}>
            <View style={styles.methodRow}>
              <View>
                <Text style={styles.methodTitle}>Email & Password</Text>
                <Text style={styles.methodSubtitle}>
                  {hasPassword
                    ? 'Linked - You can sign in with email and password'
                    : 'Not linked - Add password for additional security'}
                </Text>
              </View>
              <Text style={hasPassword ? styles.linkedBadge : styles.notLinkedBadge}>
                {hasPassword ? '✓ Linked' : 'Not Linked'}
              </Text>
            </View>

            {!hasPassword && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  onPress={() => setShowLinkPassword(!showLinkPassword)}
                  style={styles.linkButton}>
                  <Text style={styles.linkButtonText}>
                    {showLinkPassword ? 'Cancel' : '+ Add Password'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {showLinkPassword && (
              <View style={styles.linkPasswordForm}>
                <Input
                  placeholder="New Password"
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
                  title="Add Password"
                  onPress={handleLinkPassword}
                  loading={loading}
                />
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.methodRow}>
              <View>
                <Text style={styles.methodTitle}>Google</Text>
                <Text style={styles.methodSubtitle}>
                  {hasGoogle
                    ? 'Linked - You can sign in with Google'
                    : 'Not linked'}
                </Text>
              </View>
              <Text style={hasGoogle ? styles.linkedBadge : styles.notLinkedBadge}>
                {hasGoogle ? '✓ Linked' : 'Not Linked'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Statistics</Text>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.stats.totalSessions}</Text>
                  <Text style={styles.statLabel}>Total Sessions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.stats.totalMinutes}</Text>
                  <Text style={styles.statLabel}>Total Minutes</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.stats.alphaSessions}</Text>
                  <Text style={styles.statLabel}>Alpha Sessions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.stats.betaSessions}</Text>
                  <Text style={styles.statLabel}>Beta Sessions</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.stats.longestStreak}</Text>
                  <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sign Out Button */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />
        </View>
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
  infoCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: theme.spacing.sm,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  methodTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  methodSubtitle: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    maxWidth: '80%',
  },
  linkedBadge: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.alpha.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  notLinkedBadge: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  linkButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  linkButtonText: {
    color: theme.colors.coffee.cappuccino,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
  },
  linkPasswordForm: {
    paddingTop: theme.spacing.md,
  },
  statsCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.coffee.cappuccino,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  signOutButton: {
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
});

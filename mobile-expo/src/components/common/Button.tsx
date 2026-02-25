import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'alpha' | 'beta';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'alpha':
        return [theme.colors.alpha.primary, theme.colors.alpha.light];
      case 'beta':
        return [theme.colors.beta.primary, theme.colors.beta.light];
      default:
        return [theme.colors.coffee.brown, theme.colors.coffee.cappuccino];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.gradient, disabled && styles.disabled]}>
        {loading ? (
          <ActivityIndicator color={theme.colors.text.primary} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

import React from 'react';
import {TextInput, StyleSheet, View, Text} from 'react-native';
import {theme} from '../../theme';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.body,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  inputError: {
    borderColor: theme.colors.semantic.error,
  },
  errorText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.bodySmall,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

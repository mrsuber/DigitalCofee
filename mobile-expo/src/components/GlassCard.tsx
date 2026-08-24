import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blur?: number;
  opacity?: number;
  borderGlow?: boolean;
  glowColor?: string;
  useBlur?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blur = 10,
  opacity = 0.1,
  borderGlow = true,
  glowColor = '#667eea',
  useBlur = true,
}) => {
  const containerStyle = [
    styles.container,
    {
      backgroundColor: useBlur ? 'transparent' : `rgba(255, 255, 255, ${opacity})`,
      borderColor: `rgba(255, 255, 255, ${opacity + 0.08})`,
      borderWidth: 1,
      ...(borderGlow && {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
      }),
    },
    style,
  ];

  if (useBlur) {
    return (
      <BlurView intensity={blur * 10} tint="dark" style={containerStyle}>
        <View style={styles.innerContainer}>{children}</View>
      </BlurView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

export const GlassGradientCard: React.FC<
  GlassCardProps & { colors: string[] }
> = ({ children, style, colors, borderGlow = true, glowColor }) => {
  return (
    <View
      style={[
        styles.container,
        {
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.18)',
          overflow: 'hidden',
          ...(borderGlow && {
            shadowColor: glowColor || colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }),
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors.map(c => c + '40')} // Add transparency
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.innerContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  innerContainer: {
    padding: 20,
  },
});

export default GlassCard;

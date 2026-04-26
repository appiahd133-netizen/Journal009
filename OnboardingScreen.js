import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@forex_journal_onboarded';

const SLIDES = [
  {
    icon: '📊',
    title: 'Track Every Trade',
    body: 'Log your forex trades in seconds — entry, exit, lot size, stop loss, and more. All stored securely on your device.',
    accent: Colors.accent,
  },
  {
    icon: '📈',
    title: 'Analyse Performance',
    body: 'See your equity curve, win rate, risk/reward ratio and pair-by-pair breakdown. Know exactly where you make and lose money.',
    accent: '#3B5BDB',
  },
  {
    icon: '🧠',
    title: 'Master Your Psychology',
    body: 'Tag emotions on every trade, write daily journal entries, and spot the patterns that are costing you pips.',
    accent: '#9B59B6',
  },
  {
    icon: '📅',
    title: 'Daily Calendar View',
    body: 'See your profit and loss by day at a glance. Identify your best and worst trading days instantly.',
    accent: '#E67E22',
  },
];

export default function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0);

  const next = async () => {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onDone();
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  };

  const s = SLIDES[slide];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[Colors.bg0, Colors.bg1]}
        style={styles.container}
      >
        {/* Skip */}
        {slide < SLIDES.length - 1 && (
          <TouchableOpacity style={styles.skipBtn} onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slide content */}
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: s.accent + '22', borderColor: s.accent + '44' }]}>
            <Text style={styles.iconText}>{s.icon}</Text>
          </View>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === slide && [styles.dotActive, { backgroundColor: s.accent }],
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity onPress={next} activeOpacity={0.85} style={styles.btnWrap}>
          <LinearGradient
            colors={[s.accent, s.accent + 'CC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {slide === SLIDES.length - 1 ? "Let's Start Trading 🚀" : 'Continue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>Your data stays on your device. Always.</Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

export async function hasOnboarded() {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === 'true';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  container: { flex: 1, paddingHorizontal: Spacing.xxxl },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  skipText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconText: { fontSize: 54 },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  body: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bg4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  btnWrap: {
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  btn: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  btnText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: '#FFF',
    letterSpacing: 0.2,
  },
  footer: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
});

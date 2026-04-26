import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { useTrades } from '../context/TradeContext';

const VERSION = '1.0.0';

function SettingRow({ icon, label, value, onPress, danger, toggle, toggleValue, onToggle, chevron = true }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !onToggle}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.loss : Colors.accent} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && { color: Colors.loss }]}>{label}</Text>
        {value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.bg4, true: Colors.accentDim }}
          thumbColor={toggleValue ? Colors.accent : Colors.textMuted}
        />
      ) : chevron && onPress ? (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { trades } = useTrades();
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const handleExport = async () => {
    if (trades.length === 0) {
      Alert.alert('No Trades', 'Log some trades before exporting.');
      return;
    }
    const headers = ['Date','Pair','Direction','Status','Entry','Exit','Lots','P&L','Emotion','Notes'];
    const rows = trades.map(t => [
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
      t.pair, t.direction, t.status, t.entryPrice,
      t.exitPrice || '', t.lotSize, t.pnl || '',
      t.emotion || '', (t.notes || '').replace(/,/g,';'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    Alert.alert('Export Ready', `${trades.length} trades ready to export.\n\n(Connect expo-sharing for full export in production)`, [{ text: 'OK' }]);
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ Reset All Data',
      'This will permanently delete ALL your trades and journal entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Data Cleared', 'All data has been deleted. Restart the app.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account */}
        <Section title="ACCOUNT">
          <SettingRow
            icon="person-circle-outline"
            label="Trader Name"
            value="Tap to set"
            onPress={() => Alert.alert('Coming Soon', 'Custom name coming in v1.1')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="wallet-outline"
            label="Starting Balance"
            value="$5,000"
            onPress={() => Alert.alert('Coming Soon', 'Custom balance in v1.1')}
          />
        </Section>

        {/* Data */}
        <Section title="DATA">
          <SettingRow
            icon="download-outline"
            label="Export Trades (CSV)"
            value={`${trades.length} trades`}
            onPress={handleExport}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="cloud-upload-outline"
            label="Backup to Cloud"
            value="Connect Firebase"
            onPress={() => Alert.alert('Coming Soon', 'Firebase sync coming in v1.1')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="stats-chart-outline"
            label="Total Trades Logged"
            value={trades.length.toString()}
            chevron={false}
          />
        </Section>

        {/* Preferences */}
        <Section title="PREFERENCES">
          <SettingRow
            icon="phone-portrait-outline"
            label="Haptic Feedback"
            toggle
            toggleValue={haptics}
            onToggle={setHaptics}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="notifications-outline"
            label="Daily Reminders"
            toggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="cash-outline"
            label="Default Currency"
            value="USD"
            onPress={() => Alert.alert('Coming Soon', 'Multi-currency in v1.1')}
          />
        </Section>

        {/* Danger */}
        <Section title="DANGER ZONE">
          <SettingRow
            icon="trash-outline"
            label="Delete All Data"
            danger
            onPress={handleReset}
          />
        </Section>

        {/* About */}
        <Section title="ABOUT">
          <SettingRow icon="information-circle-outline" label="Version" value={VERSION} chevron={false} />
          <View style={styles.divider} />
          <SettingRow
            icon="star-outline"
            label="Rate the App"
            onPress={() => Alert.alert('Thank you!', 'Rating opens in Play Store in production.')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'All your trade data is stored locally on your device only. Nothing is ever sent to any server.')}
          />
        </Section>

        <Text style={styles.footer}>Forex Journal v{VERSION} · Made for traders 📈</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { paddingBottom: 50 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: Colors.lossDim,
  },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  rowValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 58,
  },
  footer: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    paddingBottom: Spacing.xl,
  },
});

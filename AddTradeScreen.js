import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrades } from '../context/TradeContext';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { Button, Input } from '../components/UIComponents';
import { CURRENCY_PAIRS, EMOTIONS, TRADE_TAGS } from '../utils/formatters';

function SegmentControl({ options, value, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.segmentOpt, value === opt.value && {
            backgroundColor: opt.color || Colors.accent,
          }]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, value === opt.value && styles.segmentTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PairSelector({ value, onChange }) {
  return (
    <View style={styles.pairGrid}>
      {CURRENCY_PAIRS.map((pair) => (
        <TouchableOpacity
          key={pair}
          style={[styles.pairChip, value === pair && styles.pairChipActive]}
          onPress={() => onChange(pair)}
          activeOpacity={0.8}
        >
          <Text style={[styles.pairChipText, value === pair && styles.pairChipTextActive]}>
            {pair}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function EmotionSelector({ value, onChange }) {
  return (
    <View style={styles.emotionGrid}>
      {EMOTIONS.map((e) => (
        <TouchableOpacity
          key={e.id}
          style={[styles.emotionChip, value === e.id && styles.emotionChipActive]}
          onPress={() => onChange(value === e.id ? null : e.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.emotionEmoji}>{e.emoji}</Text>
          <Text style={[styles.emotionLabel, value === e.id && styles.emotionLabelActive]}>{e.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TagSelector({ value = [], onChange }) {
  const toggle = (tag) => {
    if (value.includes(tag)) onChange(value.filter((t) => t !== tag));
    else onChange([...value, tag]);
  };
  return (
    <View style={styles.tagGrid}>
      {TRADE_TAGS.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={[styles.tagChip, value.includes(tag) && styles.tagChipActive]}
          onPress={() => toggle(tag)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tagChipText, value.includes(tag) && styles.tagChipTextActive]}>
            #{tag}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const FormSection = ({ title, children }) => (
  <View style={styles.formSection}>
    <Text style={styles.formSectionTitle}>{title}</Text>
    {children}
  </View>
);

export default function AddTradeScreen({ navigation }) {
  const { addTrade } = useTrades();

  const [pair, setPair] = useState('EURUSD');
  const [direction, setDirection] = useState('BUY');
  const [status, setStatus] = useState('closed');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [pnl, setPnl] = useState('');
  const [emotion, setEmotion] = useState(null);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!entryPrice) e.entryPrice = 'Entry price required';
    if (!lotSize) e.lotSize = 'Lot size required';
    if (status === 'closed' && !exitPrice) e.exitPrice = 'Exit price required for closed trades';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const trade = {
      pair, direction, status, entryPrice, exitPrice, lotSize,
      stopLoss, takeProfit, pnl: status === 'closed' ? pnl : null,
      emotion, tags, notes,
    };
    addTrade(trade);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Trade</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Trade Details */}
          <FormSection title="📍 Trade Details">
            <Text style={styles.fieldLabel}>Currency Pair</Text>
            <PairSelector value={pair} onChange={setPair} />

            <View style={{ height: Spacing.lg }} />
            <Text style={styles.fieldLabel}>Direction</Text>
            <SegmentControl
              value={direction}
              onChange={setDirection}
              options={[
                { label: '▲ BUY', value: 'BUY', color: Colors.profit },
                { label: '▼ SELL', value: 'SELL', color: Colors.loss },
              ]}
            />

            <View style={{ height: Spacing.lg }} />
            <Text style={styles.fieldLabel}>Status</Text>
            <SegmentControl
              value={status}
              onChange={setStatus}
              options={[
                { label: 'Closed', value: 'closed' },
                { label: 'Open', value: 'open' },
              ]}
            />
          </FormSection>

          {/* Prices */}
          <FormSection title="💰 Prices">
            <View style={styles.row}>
              <Input
                label="Entry Price"
                value={entryPrice}
                onChangeText={setEntryPrice}
                placeholder="1.08500"
                keyboardType="decimal-pad"
                style={styles.halfInput}
                error={errors.entryPrice}
              />
              <View style={{ width: Spacing.md }} />
              <Input
                label="Exit Price"
                value={exitPrice}
                onChangeText={setExitPrice}
                placeholder="1.09200"
                keyboardType="decimal-pad"
                style={styles.halfInput}
                error={errors.exitPrice}
              />
            </View>
            <View style={styles.row}>
              <Input
                label="Stop Loss"
                value={stopLoss}
                onChangeText={setStopLoss}
                placeholder="1.08200"
                keyboardType="decimal-pad"
                style={styles.halfInput}
              />
              <View style={{ width: Spacing.md }} />
              <Input
                label="Take Profit"
                value={takeProfit}
                onChangeText={setTakeProfit}
                placeholder="1.09500"
                keyboardType="decimal-pad"
                style={styles.halfInput}
              />
            </View>
            <View style={styles.row}>
              <Input
                label="Lot Size"
                value={lotSize}
                onChangeText={setLotSize}
                placeholder="0.10"
                keyboardType="decimal-pad"
                style={styles.halfInput}
                error={errors.lotSize}
              />
              {status === 'closed' && (
                <>
                  <View style={{ width: Spacing.md }} />
                  <Input
                    label="P&L ($)"
                    value={pnl}
                    onChangeText={setPnl}
                    placeholder="+120.00"
                    keyboardType="numbers-and-punctuation"
                    style={styles.halfInput}
                  />
                </>
              )}
            </View>
          </FormSection>

          {/* Psychology */}
          <FormSection title="🧠 Psychology">
            <Text style={styles.fieldLabel}>Emotion</Text>
            <EmotionSelector value={emotion} onChange={setEmotion} />
            <View style={{ height: Spacing.lg }} />
            <Text style={styles.fieldLabel}>Tags</Text>
            <TagSelector value={tags} onChange={setTags} />
          </FormSection>

          {/* Notes */}
          <FormSection title="📝 Notes">
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="What was your reasoning? What did you do well or wrong?"
              multiline
            />
          </FormSection>

          {/* Submit */}
          <View style={styles.submitRow}>
            <Button
              label="Log Trade"
              onPress={handleSubmit}
              style={{ flex: 1 }}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg3,
    borderRadius: Radius.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  scroll: { paddingBottom: 40 },
  formSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  formSectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    letterSpacing: 0.2,
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.bg3,
    borderRadius: Radius.md,
    padding: 3,
  },
  segmentOpt: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segmentText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  segmentTextActive: {
    color: Colors.bg0,
    fontWeight: Typography.weights.bold,
  },
  pairGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pairChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pairChipActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.borderActive,
  },
  pairChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
  },
  pairChipTextActive: {
    color: Colors.accent,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emotionChipActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.borderActive,
  },
  emotionEmoji: { fontSize: 16 },
  emotionLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  emotionLabelActive: { color: Colors.accent },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.borderActive,
  },
  tagChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  tagChipTextActive: { color: Colors.accent },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  halfInput: { flex: 1 },
  submitRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
});

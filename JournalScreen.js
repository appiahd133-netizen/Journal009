import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { Card, Button } from '../components/UIComponents';
import { useTrades } from '../context/TradeContext';
import { formatCurrency, formatDate, EMOTIONS } from '../utils/formatters';

const JOURNAL_KEY = '@forex_journal_entries';

const REFLECTION_PROMPTS = [
  'What went well in my trading today?',
  'What mistakes did I make and why?',
  'Did I follow my trading plan?',
  'What emotions affected my decisions?',
  'What will I do differently tomorrow?',
];

export default function JournalScreen() {
  const { trades } = useTrades();
  const [entries, setEntries] = useState([]);
  const [writing, setWriting] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentMood, setCurrentMood] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(JOURNAL_KEY);
      if (data) setEntries(JSON.parse(data));
    } catch (e) {}
  };

  const saveEntry = async () => {
    if (!currentText.trim()) return;
    const entry = {
      id: Date.now().toString(),
      text: currentText,
      mood: currentMood,
      prompt: selectedPrompt,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    setCurrentText('');
    setCurrentMood(null);
    setSelectedPrompt(null);
    setWriting(false);
  };

  const deleteEntry = async (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
  };

  // Today's trade summary
  const today = new Date().toDateString();
  const todayTrades = trades.filter((t) => new Date(t.createdAt).toDateString() === today);
  const todayPnl = todayTrades
    .filter((t) => t.status === 'closed')
    .reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Journal</Text>
            {!writing && (
              <TouchableOpacity
                style={styles.writeBtn}
                onPress={() => setWriting(true)}
              >
                <Ionicons name="create-outline" size={18} color={Colors.accent} />
                <Text style={styles.writeBtnText}>New Entry</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Today Summary */}
          <View style={styles.section}>
            <Card style={styles.todayCard}>
              <View style={styles.todayRow}>
                <View>
                  <Text style={styles.todayLabel}>Today's Session</Text>
                  <Text style={styles.todayDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                </View>
                <View style={styles.todayStats}>
                  <Text style={[styles.todayPnl, { color: todayPnl >= 0 ? Colors.profit : Colors.loss }]}>
                    {todayPnl >= 0 ? '+' : ''}{formatCurrency(todayPnl)}
                  </Text>
                  <Text style={styles.todayTrades}>{todayTrades.length} trades</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Write Entry */}
          {writing && (
            <View style={styles.section}>
              <Card style={styles.writeCard}>
                <Text style={styles.writeTitle}>New Journal Entry</Text>

                {/* Prompts */}
                <Text style={styles.promptLabel}>Reflection prompt (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
                  {REFLECTION_PROMPTS.map((p, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.promptChip, selectedPrompt === p && styles.promptChipActive]}
                      onPress={() => {
                        setSelectedPrompt(p === selectedPrompt ? null : p);
                        if (p !== selectedPrompt) setCurrentText(p + '\n\n');
                      }}
                    >
                      <Text style={[styles.promptText, selectedPrompt === p && styles.promptTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Mood */}
                <Text style={styles.moodLabel}>Current Mood</Text>
                <View style={styles.moodRow}>
                  {EMOTIONS.slice(0, 5).map((e) => (
                    <TouchableOpacity
                      key={e.id}
                      style={[styles.moodBtn, currentMood === e.id && styles.moodBtnActive]}
                      onPress={() => setCurrentMood(currentMood === e.id ? null : e.id)}
                    >
                      <Text style={styles.moodEmoji}>{e.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Text */}
                <TextInput
                  value={currentText}
                  onChangeText={setCurrentText}
                  multiline
                  style={styles.writeInput}
                  placeholder="Write your thoughts, observations, and lessons learned..."
                  placeholderTextColor={Colors.textMuted}
                  autoFocus={!selectedPrompt}
                />

                <View style={styles.writeBtns}>
                  <Button label="Cancel" variant="ghost" onPress={() => { setWriting(false); setCurrentText(''); }} style={{ flex: 1 }} />
                  <Button label="Save Entry" onPress={saveEntry} style={{ flex: 1 }} />
                </View>
              </Card>
            </View>
          )}

          {/* Entries */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Entries</Text>
            {entries.length === 0 && !writing && (
              <Card>
                <Text style={styles.emptyText}>📔 Start writing to build your trading journal. Reflection is the key to improvement.</Text>
              </Card>
            )}
            {entries.map((entry) => {
              const emotion = EMOTIONS.find((e) => e.id === entry.mood);
              return (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                      {emotion && (
                        <Text style={styles.entryMood}>{emotion.emoji} {emotion.label}</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  {entry.prompt && (
                    <Text style={styles.entryPrompt}>💭 {entry.prompt}</Text>
                  )}
                  <Text style={styles.entryText} numberOfLines={4}>{entry.text}</Text>
                </Card>
              );
            })}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderActive,
  },
  writeBtnText: {
    color: Colors.accent,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  todayCard: { borderColor: Colors.borderActive },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  todayDate: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginTop: 3,
  },
  todayStats: { alignItems: 'flex-end' },
  todayPnl: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    letterSpacing: -0.5,
  },
  todayTrades: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  writeCard: { borderColor: Colors.borderActive },
  writeTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  promptLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  promptScroll: { marginBottom: Spacing.lg, marginHorizontal: -Spacing.lg },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.bg3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 200,
    marginHorizontal: 4,
  },
  promptChipActive: { backgroundColor: Colors.accentGlow, borderColor: Colors.borderActive },
  promptText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  promptTextActive: { color: Colors.accent },
  moodLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  moodBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodBtnActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.borderActive,
  },
  moodEmoji: { fontSize: 20 },
  writeInput: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
    marginBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  writeBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  entryCard: { marginBottom: Spacing.md },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  entryMood: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  entryPrompt: {
    fontSize: Typography.sizes.xs,
    color: Colors.accentDim,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  entryText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
});

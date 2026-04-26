import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTrades } from '../context/TradeContext';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { Card, Badge, Button, Divider } from '../components/UIComponents';
import { formatCurrency, formatDate, formatPercent, EMOTIONS } from '../utils/formatters';

const EMOTION_EMOJI = Object.fromEntries(EMOTIONS.map((e) => [e.id, e.emoji]));

function DetailRow({ label, value, valueColor }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value || '—'}</Text>
    </View>
  );
}

export default function TradeDetailScreen({ route, navigation }) {
  const { tradeId } = route.params;
  const { getTradeById, updateTrade, deleteTrade } = useTrades();
  const trade = getTradeById(tradeId);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(trade?.notes || '');

  if (!trade) {
    navigation.goBack();
    return null;
  }

  const pnl = parseFloat(trade.pnl) || 0;
  const isProfit = pnl >= 0;
  const isOpen = trade.status === 'open';

  const handleDelete = () => {
    Alert.alert('Delete Trade', 'Are you sure you want to delete this trade?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTrade(tradeId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSaveNotes = () => {
    updateTrade(tradeId, { notes });
    setEditingNotes(false);
  };

  const handleClose = () => {
    Alert.alert('Mark as Closed', 'Mark this trade as closed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close Trade',
        onPress: () => updateTrade(tradeId, { status: 'closed' }),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trade Detail</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={Colors.loss} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero ── */}
        <LinearGradient
          colors={
            isOpen ? [Colors.bg2, Colors.bg3] :
            isProfit ? ['rgba(0,217,126,0.08)', Colors.bg2] :
            ['rgba(255,75,110,0.08)', Colors.bg2]
          }
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.pair}>{trade.pair}</Text>
              <Text style={styles.date}>{formatDate(trade.createdAt)}</Text>
            </View>
            <Badge
              label={trade.direction}
              color={trade.direction === 'BUY' ? Colors.buy : Colors.sell}
              bgColor={trade.direction === 'BUY' ? Colors.profitDim : Colors.lossDim}
            />
          </View>

          {isOpen ? (
            <Badge label="⏳ OPEN" color={Colors.warning} bgColor={Colors.warningDim} />
          ) : (
            <View style={styles.pnlWrap}>
              <Text style={[styles.pnlValue, { color: isProfit ? Colors.profit : Colors.loss }]}>
                {isProfit ? '+' : ''}{formatCurrency(pnl)}
              </Text>
              <Text style={[styles.pnlLabel, { color: isProfit ? Colors.profit : Colors.loss }]}>
                {isProfit ? '▲ Profit' : '▼ Loss'}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Price Details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Price Details</Text>
          <Card>
            <DetailRow label="Entry Price" value={trade.entryPrice} />
            <Divider />
            <DetailRow label="Exit Price" value={trade.exitPrice} />
            <Divider />
            <DetailRow label="Lot Size" value={trade.lotSize} />
            <Divider />
            <DetailRow label="Stop Loss" value={trade.stopLoss} valueColor={Colors.loss} />
            <Divider />
            <DetailRow label="Take Profit" value={trade.takeProfit} valueColor={Colors.profit} />
          </Card>
        </View>

        {/* ── Psychology ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Psychology</Text>
          <Card>
            <DetailRow
              label="Emotion"
              value={trade.emotion ? `${EMOTION_EMOJI[trade.emotion] || ''} ${trade.emotion}` : '—'}
            />
            {trade.tags && trade.tags.length > 0 && (
              <>
                <Divider />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tags</Text>
                  <View style={styles.tagRow}>
                    {trade.tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* ── Notes ── */}
        <View style={styles.section}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>📝 Notes</Text>
            <TouchableOpacity
              onPress={editingNotes ? handleSaveNotes : () => setEditingNotes(true)}
              style={styles.editBtn}
            >
              <Ionicons
                name={editingNotes ? 'checkmark' : 'pencil'}
                size={16}
                color={Colors.accent}
              />
              <Text style={styles.editBtnText}>{editingNotes ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
          <Card>
            {editingNotes ? (
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                style={styles.notesInput}
                placeholderTextColor={Colors.textMuted}
                placeholder="Add your trading notes..."
                autoFocus
              />
            ) : (
              <Text style={[styles.notesText, !notes && { color: Colors.textMuted }]}>
                {notes || 'No notes added. Tap Edit to add notes.'}
              </Text>
            )}
          </Card>
        </View>

        {/* ── Actions ── */}
        {isOpen && (
          <View style={styles.section}>
            <Button label="Mark as Closed" onPress={handleClose} />
          </View>
        )}

      </ScrollView>
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
  backBtn: {
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
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: 40 },
  hero: {
    margin: Spacing.xl,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pair: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  date: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  pnlWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  pnlValue: {
    fontSize: 38,
    fontWeight: Typography.weights.black,
    letterSpacing: -1,
  },
  pnlLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  tagChip: {
    backgroundColor: Colors.bg3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: 11,
    color: Colors.accentDim,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  notesText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  notesInput: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

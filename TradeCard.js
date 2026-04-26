import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { Badge } from './UIComponents';
import { formatCurrency, formatDate } from '../utils/formatters';

const EMOTION_EMOJI = {
  confident: '💪',
  fear: '😨',
  greedy: '🤑',
  calm: '😌',
  fomo: '😤',
  revenge: '😡',
  neutral: '😐',
};

export default function TradeCard({ trade, onPress }) {
  const pnl = parseFloat(trade.pnl) || 0;
  const isProfit = pnl >= 0;
  const isOpen = trade.status === 'open';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, {
        backgroundColor: isOpen ? Colors.warning : isProfit ? Colors.profit : Colors.loss
      }]} />

      <View style={styles.content}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.pairGroup}>
            <Text style={styles.pair}>{trade.pair}</Text>
            <Badge
              label={trade.direction}
              color={trade.direction === 'BUY' ? Colors.buy : Colors.sell}
              bgColor={trade.direction === 'BUY' ? Colors.profitDim : Colors.lossDim}
            />
          </View>
          <View style={styles.pnlGroup}>
            {isOpen ? (
              <Badge label="OPEN" color={Colors.warning} bgColor={Colors.warningDim} />
            ) : (
              <Text style={[styles.pnl, { color: isProfit ? Colors.profit : Colors.loss }]}>
                {isProfit ? '+' : ''}{formatCurrency(pnl)}
              </Text>
            )}
          </View>
        </View>

        {/* Middle row */}
        <View style={styles.midRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.priceLabel}>Entry</Text>
            <Text style={styles.priceValue}>{trade.entryPrice}</Text>
          </View>
          {trade.exitPrice && (
            <>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
              <View style={styles.priceGroup}>
                <Text style={styles.priceLabel}>Exit</Text>
                <Text style={styles.priceValue}>{trade.exitPrice}</Text>
              </View>
            </>
          )}
          <View style={[styles.priceGroup, { marginLeft: 'auto' }]}>
            <Text style={styles.priceLabel}>Lots</Text>
            <Text style={styles.priceValue}>{trade.lotSize}</Text>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formatDate(trade.createdAt)}</Text>
          <View style={styles.tags}>
            {trade.emotion && (
              <Text style={styles.emotion}>{EMOTION_EMOJI[trade.emotion] || '😐'} {trade.emotion}</Text>
            )}
            {trade.tags?.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pairGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pair: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  pnlGroup: {
    alignItems: 'flex-end',
  },
  pnl: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    letterSpacing: -0.3,
  },
  midRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceGroup: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  arrow: { paddingTop: 14 },
  arrowText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emotion: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  tag: {
    backgroundColor: Colors.bg3,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: Colors.accentDim,
  },
});

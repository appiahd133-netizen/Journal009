import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTrades } from '../context/TradeContext';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { StatCard, SectionHeader, EmptyState, Card } from '../components/UIComponents';
import TradeCard from '../components/TradeCard';
import { formatCurrency, formatPercent } from '../utils/formatters';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { trades, analytics } = useTrades();
  const stats = useMemo(() => analytics(), [trades]);
  const recentTrades = trades.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, Trader 👋</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddTrade')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentDim]}
                style={styles.addBtnGrad}
              >
                <Ionicons name="add" size={22} color={Colors.bg0} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── P/L Hero Card ── */}
        {stats ? (
          <View style={styles.heroWrap}>
            <LinearGradient
              colors={[Colors.bg2, Colors.bg3]}
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>Total P&L</Text>
                <View style={[styles.heroBadge, {
                  backgroundColor: stats.totalPL >= 0 ? Colors.profitDim : Colors.lossDim
                }]}>
                  <Text style={[styles.heroBadgeText, {
                    color: stats.totalPL >= 0 ? Colors.profit : Colors.loss
                  }]}>
                    {stats.totalPL >= 0 ? '▲' : '▼'} {stats.closedTrades} trades
                  </Text>
                </View>
              </View>
              <Text style={[styles.heroValue, {
                color: stats.totalPL >= 0 ? Colors.profit : Colors.loss
              }]}>
                {stats.totalPL >= 0 ? '+' : ''}{formatCurrency(stats.totalPL)}
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Win Rate</Text>
                  <Text style={styles.heroStatValue}>{formatPercent(stats.winRate)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Avg Win</Text>
                  <Text style={[styles.heroStatValue, { color: Colors.profit }]}>{formatCurrency(stats.avgWin)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Avg Loss</Text>
                  <Text style={[styles.heroStatValue, { color: Colors.loss }]}>-{formatCurrency(stats.avgLoss)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>R:R</Text>
                  <Text style={styles.heroStatValue}>{stats.rr.toFixed(2)}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.heroWrap}>
            <LinearGradient colors={[Colors.bg2, Colors.bg3]} style={styles.heroCardEmpty}>
              <Text style={{ fontSize: 32 }}>📈</Text>
              <Text style={styles.heroEmptyTitle}>Start Tracking</Text>
              <Text style={styles.heroEmptyText}>Log your first trade to see your performance stats here.</Text>
            </LinearGradient>
          </View>
        )}

        {/* ── Stat Grid ── */}
        {stats && (
          <View style={styles.statGrid}>
            <StatCard label="Open Trades" value={stats.openTrades} icon="🔓" style={styles.statCell} />
            <View style={{ width: Spacing.md }} />
            <StatCard
              label="Win / Loss"
              value={`${stats.winners}W / ${stats.losers}L`}
              color={Colors.textPrimary}
              icon="🎯"
              style={styles.statCell}
            />
          </View>
        )}

        {/* ── Recent Trades ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Trades"
            action="See All"
            onAction={() => navigation.navigate('History')}
          />
          {recentTrades.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No trades yet"
              subtitle="Tap the + button to log your first trade"
            />
          ) : (
            recentTrades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onPress={() => navigation.navigate('TradeDetail', { tradeId: trade.id })}
              />
            ))
          )}
        </View>

        {/* ── Quick Tips ── */}
        <Card style={styles.tipCard}>
          <View style={styles.tipRow}>
            <Text style={{ fontSize: 20 }}>💡</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.tipTitle}>Trading Tip</Text>
              <Text style={styles.tipText}>Review your losing trades weekly to identify patterns and improve your edge.</Text>
            </View>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  addBtnGrad: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  heroWrap: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCardEmpty: {
    borderRadius: Radius.xl,
    padding: Spacing.xxxl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  heroEmptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  heroEmptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  heroBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  heroValue: {
    fontSize: 42,
    fontWeight: Typography.weights.black,
    letterSpacing: -1.5,
    marginBottom: Spacing.xl,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  heroStatValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  statGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  statCell: { flex: 1 },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  tipCard: {
    marginHorizontal: Spacing.xl,
    borderColor: Colors.accentGlow,
    borderWidth: 1,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tipTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    marginBottom: 4,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

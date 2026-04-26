import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { useTrades } from '../context/TradeContext';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { Card, StatCard, EmptyState } from '../components/UIComponents';
import { formatCurrency, formatPercent } from '../utils/formatters';
import EquityCurveChart from '../components/EquityCurveChart';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.xl * 2;

const barChartConfig = {
  backgroundGradientFrom: Colors.bg2,
  backgroundGradientTo: Colors.bg2,
  color: (opacity = 1) => `rgba(0, 229, 204, ${opacity})`,
  labelColor: () => Colors.textMuted,
  strokeWidth: 2,
  propsForBackgroundLines: { stroke: Colors.border, strokeDasharray: '' },
  decimalPlaces: 0,
  style: { borderRadius: Radius.lg },
};

function MetricRow({ label, value, color, bar, maxBar }) {
  const fillPct = maxBar > 0 ? Math.min((bar / maxBar) * 100, 100) : 0;
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricRight}>
        {bar !== undefined && (
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${fillPct}%`, backgroundColor: color || Colors.accent }]} />
          </View>
        )}
        <Text style={[styles.metricValue, color && { color }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { trades, analytics } = useTrades();
  const stats = useMemo(() => analytics(), [trades]);

  if (!stats || stats.closedTrades === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <EmptyState
          icon="📊"
          title="No data yet"
          subtitle="Close some trades to see your performance analytics"
        />
      </SafeAreaView>
    );
  }

  // Build equity curve data
  const equityData = stats.equityCurve.slice(-30);

  // Pair performance for bar chart
  const pairEntries = Object.entries(stats.pairStats)
    .sort((a, b) => Math.abs(b[1].pnl) - Math.abs(a[1].pnl))
    .slice(0, 6);
  const barData = {
    labels: pairEntries.map(([p]) => p.replace('USD', '').replace('EUR', 'EU')),
    datasets: [{
      data: pairEntries.map(([, v]) => Math.abs(v.pnl)),
    }],
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>{stats.closedTrades} closed trades</Text>
        </View>

        {/* ── Key Stats ── */}
        <View style={styles.section}>
          <View style={styles.statGrid}>
            <StatCard
              label="Total P&L"
              value={formatCurrency(stats.totalPL)}
              color={stats.totalPL >= 0 ? Colors.profit : Colors.loss}
              style={styles.statCell}
            />
            <View style={{ width: Spacing.md }} />
            <StatCard
              label="Win Rate"
              value={formatPercent(stats.winRate)}
              color={stats.winRate >= 50 ? Colors.profit : Colors.loss}
              style={styles.statCell}
            />
          </View>
          <View style={[styles.statGrid, { marginTop: Spacing.md }]}>
            <StatCard
              label="Avg Win"
              value={formatCurrency(stats.avgWin)}
              color={Colors.profit}
              style={styles.statCell}
            />
            <View style={{ width: Spacing.md }} />
            <StatCard
              label="Risk:Reward"
              value={`1 : ${stats.rr.toFixed(2)}`}
              color={stats.rr >= 1 ? Colors.profit : Colors.loss}
              style={styles.statCell}
            />
          </View>
        </View>

        {/* ── Equity Curve ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Equity Curve</Text>
          <EquityCurveChart
            equityCurve={equityData}
            startingBalance={5000}
          />
        </View>

        {/* ── Win/Loss Breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Win/Loss Breakdown</Text>
          <Card>
            <View style={styles.winLossRow}>
              <View style={styles.winBlock}>
                <Text style={styles.winLossNum}>{stats.winners}</Text>
                <Text style={[styles.winLossLabel, { color: Colors.profit }]}>Wins</Text>
              </View>
              <View style={styles.winLossBar}>
                <View style={[styles.winFill, { flex: stats.winners || 0 }]} />
                <View style={[styles.lossFill, { flex: stats.losers || 0 }]} />
              </View>
              <View style={styles.lossBlock}>
                <Text style={styles.winLossNum}>{stats.losers}</Text>
                <Text style={[styles.winLossLabel, { color: Colors.loss }]}>Losses</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <MetricRow label="Avg Win" value={formatCurrency(stats.avgWin)} color={Colors.profit} />
            <MetricRow label="Avg Loss" value={`-${formatCurrency(stats.avgLoss)}`} color={Colors.loss} />
            <MetricRow label="Expectancy" value={formatCurrency((stats.winRate / 100 * stats.avgWin) - ((1 - stats.winRate / 100) * stats.avgLoss))} />
          </Card>
        </View>

        {/* ── Pair Performance ── */}
        {pairEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💱 Pair Performance</Text>
            <Card style={styles.chartCard}>
              <BarChart
                data={barData}
                width={CHART_WIDTH - Spacing.xl * 2}
                height={160}
                chartConfig={barChartConfig}
                withInnerLines={false}
                showBarTops={false}
                style={styles.chart}
                fromZero
              />
            </Card>
            {pairEntries.map(([pair, data]) => (
              <View key={pair} style={styles.pairRow}>
                <Text style={styles.pairName}>{pair}</Text>
                <Text style={styles.pairCount}>{data.count} trades</Text>
                <Text style={[styles.pairPnl, { color: data.pnl >= 0 ? Colors.profit : Colors.loss }]}>
                  {data.pnl >= 0 ? '+' : ''}{formatCurrency(data.pnl)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Summary ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Summary</Text>
          <Card>
            <MetricRow label="Total Trades" value={stats.totalTrades.toString()} />
            <MetricRow label="Closed Trades" value={stats.closedTrades.toString()} />
            <MetricRow label="Open Trades" value={stats.openTrades.toString()} />
            <View style={styles.divider} />
            <MetricRow
              label="Win Rate"
              value={formatPercent(stats.winRate)}
              color={stats.winRate >= 50 ? Colors.profit : Colors.loss}
              bar={stats.winRate}
              maxBar={100}
            />
            <MetricRow
              label="Profit Factor"
              value={(stats.avgWin * stats.winners / (stats.avgLoss * stats.losers || 1)).toFixed(2)}
            />
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { paddingBottom: 40 },
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
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
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
  statGrid: { flexDirection: 'row' },
  statCell: { flex: 1 },
  chartCard: { padding: 0, overflow: 'hidden' },
  chart: { marginVertical: 0, borderRadius: Radius.lg },
  winLossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  winBlock: { alignItems: 'center', width: 44 },
  lossBlock: { alignItems: 'center', width: 44 },
  winLossNum: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
  },
  winLossLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  winLossBar: {
    flex: 1,
    height: 10,
    borderRadius: Radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.bg3,
  },
  winFill: { backgroundColor: Colors.profit },
  lossFill: { backgroundColor: Colors.loss },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  metricLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  metricRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barBg: {
    width: 80,
    height: 4,
    backgroundColor: Colors.bg3,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  metricValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    minWidth: 60,
    textAlign: 'right',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pairName: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  pairCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginRight: 12,
  },
  pairPnl: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    minWidth: 70,
    textAlign: 'right',
  },
});

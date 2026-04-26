import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrades } from '../context/TradeContext';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { formatCurrency } from '../utils/formatters';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, parseISO, addMonths, subMonths,
} from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// 7 columns, small gaps
const CELL_GAP = 5;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - Spacing.xl * 2 - CELL_GAP * 6) / 7);

export default function CalendarScreen({ navigation }) {
  const { trades } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  // Build day-level stats from trades
  const dayStats = useMemo(() => {
    const map = {};
    trades.forEach((trade) => {
      if (trade.status !== 'closed') return;
      const day = format(parseISO(trade.createdAt), 'yyyy-MM-dd');
      if (!map[day]) map[day] = { pnl: 0, count: 0 };
      map[day].pnl += parseFloat(trade.pnl) || 0;
      map[day].count += 1;
    });
    return map;
  }, [trades]);

  // Monthly P&L
  const monthPnl = useMemo(() => {
    const prefix = format(currentMonth, 'yyyy-MM');
    return Object.entries(dayStats)
      .filter(([day]) => day.startsWith(prefix))
      .reduce((sum, [, s]) => sum + s.pnl, 0);
  }, [dayStats, currentMonth]);

  // Build calendar grid
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    const startWeekday = getDay(start); // 0=Sun
    const blanks = Array(startWeekday).fill(null);
    return [...blanks, ...allDays];
  }, [currentMonth]);

  // Rows
  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < days.length; i += 7) r.push(days.slice(i, i + 7));
    return r;
  }, [days]);

  const getCellStyle = (stats) => {
    if (!stats) return {};
    if (stats.pnl < 0) return { bg: '#FFE8E8', border: '#FFCACA', numColor: '#CC2A2A' };
    if (stats.pnl > 0) return { bg: '#E8F8EE', border: '#B8EAC8', numColor: '#1A7A3A' };
    return {};
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Summary</Text>
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={16} color="#333" />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* ── Month Nav + P&L ── */}
        <View style={styles.navRow}>
          <View style={styles.navLeft}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={18} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{format(currentMonth, 'MMM yyyy')}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={18} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn}>
              <Ionicons name="calendar-outline" size={16} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.pnlBadge}>
            <Text style={styles.pnlBadgeLabel}>PnL: </Text>
            <Text style={[
              styles.pnlBadgeValue,
              { color: monthPnl >= 0 ? '#1A7A3A' : '#CC2A2A' }
            ]}>
              {monthPnl >= 0 ? '+' : ''}{formatCurrency(monthPnl)}
            </Text>
          </View>
        </View>

        {/* ── Calendar ── */}
        <View style={styles.calendarWrap}>
          {/* Day of week headers */}
          <View style={styles.weekRow}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} style={styles.dayLabel}>
                <Text style={styles.dayLabelText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar rows */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.weekRow}>
              {Array(7).fill(null).map((_, ci) => {
                const day = row[ci];
                if (!day) {
                  return <View key={ci} style={styles.cellEmpty} />;
                }
                const key = format(day, 'yyyy-MM-dd');
                const stats = dayStats[key];
                const cellStyle = getCellStyle(stats);
                const isToday = isSameDay(day, new Date());

                return (
                  <TouchableOpacity
                    key={ci}
                    style={[
                      styles.cell,
                      stats && {
                        backgroundColor: cellStyle.bg,
                        borderColor: cellStyle.border,
                      },
                      isToday && styles.cellToday,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (stats) {
                        // Could navigate to day detail
                      }
                    }}
                  >
                    <Text style={[
                      styles.cellDate,
                      stats && { color: cellStyle.numColor, fontWeight: '700' },
                      isToday && styles.cellDateToday,
                      !stats && { color: '#AAAAAA' },
                    ]}>
                      {format(day, 'd')}
                    </Text>

                    {stats && (
                      <View style={styles.cellStats}>
                        <View style={styles.tradeCountRow}>
                          <Text style={styles.tradeCountNum}>{stats.count}</Text>
                          <Ionicons name="swap-horizontal" size={10} color="#888" />
                        </View>
                        <Text style={[
                          styles.cellPnl,
                          { color: stats.pnl >= 0 ? '#1A7A3A' : '#CC2A2A' }
                        ]}>
                          {stats.pnl >= 0 ? '' : '-'}${Math.abs(stats.pnl).toFixed(0)}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Monthly Summary Stats ── */}
        {Object.keys(dayStats).some((d) => d.startsWith(format(currentMonth, 'yyyy-MM'))) && (
          <View style={styles.summaryWrap}>
            <Text style={styles.summaryTitle}>Month Summary</Text>
            <View style={styles.summaryGrid}>
              {(() => {
                const prefix = format(currentMonth, 'yyyy-MM');
                const monthDays = Object.entries(dayStats).filter(([d]) => d.startsWith(prefix));
                const totalTrades = monthDays.reduce((s, [, v]) => s + v.count, 0);
                const winDays = monthDays.filter(([, v]) => v.pnl > 0).length;
                const lossDays = monthDays.filter(([, v]) => v.pnl < 0).length;
                const tradingDays = monthDays.length;
                const winDayRate = tradingDays > 0 ? (winDays / tradingDays) * 100 : 0;
                const bestDay = Math.max(...monthDays.map(([, v]) => v.pnl));
                const worstDay = Math.min(...monthDays.map(([, v]) => v.pnl));
                return (
                  <>
                    <SummaryCard label="Total P&L" value={`${monthPnl >= 0 ? '+' : ''}${formatCurrency(monthPnl)}`} color={monthPnl >= 0 ? '#1A7A3A' : '#CC2A2A'} />
                    <SummaryCard label="Trades" value={totalTrades.toString()} />
                    <SummaryCard label="Win Days" value={`${winDays}d`} color="#1A7A3A" />
                    <SummaryCard label="Loss Days" value={`${lossDays}d`} color="#CC2A2A" />
                    <SummaryCard label="Day Win%" value={`${winDayRate.toFixed(0)}%`} color={winDayRate >= 50 ? '#1A7A3A' : '#CC2A2A'} />
                    <SummaryCard label="Best Day" value={`+${formatCurrency(bestDay)}`} color="#1A7A3A" />
                    <SummaryCard label="Worst Day" value={formatCurrency(worstDay)} color="#CC2A2A" />
                    <SummaryCard label="Active Days" value={`${tradingDays}d`} />
                  </>
                );
              })()}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardLabel}>{label}</Text>
      <Text style={[styles.summaryCardValue, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F6F8' },
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
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  shareText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginHorizontal: 6,
    minWidth: 90,
    textAlign: 'center',
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  pnlBadgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  pnlBadgeValue: {
    fontSize: 13,
    fontWeight: '800',
  },

  calendarWrap: {
    paddingHorizontal: Spacing.xl,
    gap: CELL_GAP,
  },
  weekRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  dayLabel: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingBottom: 4,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAAAAA',
  },
  cellEmpty: {
    width: CELL_SIZE,
    height: CELL_SIZE + 14,
  },
  cell: {
    width: CELL_SIZE,
    minHeight: CELL_SIZE + 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 6,
    justifyContent: 'flex-start',
  },
  cellToday: {
    borderColor: '#3B5BDB',
    borderWidth: 2,
  },
  cellDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  cellDateToday: {
    color: '#3B5BDB',
    fontWeight: '900',
  },
  cellStats: {
    marginTop: 4,
    gap: 2,
  },
  tradeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tradeCountNum: {
    fontSize: 11,
    fontWeight: '600',
    color: '#777',
  },
  cellPnl: {
    fontSize: 12,
    fontWeight: '800',
  },

  summaryWrap: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 10 * 3) / 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 4,
  },
  summaryCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AAAAAA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.3,
  },
});

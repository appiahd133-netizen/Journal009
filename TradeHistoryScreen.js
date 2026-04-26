import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrades } from '../context/TradeContext';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { ScreenHeader, EmptyState, Badge } from '../components/UIComponents';
import TradeCard from '../components/TradeCard';
import { CURRENCY_PAIRS } from '../utils/formatters';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'win', label: '✅ Win' },
  { id: 'loss', label: '❌ Loss' },
  { id: 'open', label: '🔓 Open' },
];

export default function TradeHistoryScreen({ navigation }) {
  const { trades } = useTrades();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [pairFilter, setPairFilter] = useState('ALL');
  const [showPairFilter, setShowPairFilter] = useState(false);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const matchSearch = search === '' || t.pair.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'win' && parseFloat(t.pnl) > 0 && t.status === 'closed') ||
        (activeFilter === 'loss' && parseFloat(t.pnl) < 0 && t.status === 'closed') ||
        (activeFilter === 'open' && t.status === 'open');
      const matchPair = pairFilter === 'ALL' || t.pair === pairFilter;
      return matchSearch && matchFilter && matchPair;
    });
  }, [trades, search, activeFilter, pairFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trade History</Text>
          <Text style={styles.subtitle}>{trades.length} total trades</Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowPairFilter(!showPairFilter)}
        >
          <Ionicons name="funnel" size={18} color={pairFilter !== 'ALL' ? Colors.accent : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search pair..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pair filter dropdown */}
      {showPairFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pairScroll} contentContainerStyle={styles.pairScrollContent}>
          {['ALL', ...CURRENCY_PAIRS].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.pairChip, pairFilter === p && styles.pairChipActive]}
              onPress={() => { setPairFilter(p); setShowPairFilter(false); }}
            >
              <Text style={[styles.pairChipText, pairFilter === p && styles.pairChipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.id)}
          >
            <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} trades</Text>
        {pairFilter !== 'ALL' && (
          <Badge label={pairFilter} color={Colors.accent} bgColor={Colors.accentGlow} />
        )}
      </View>

      {/* Trade list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No trades found"
          subtitle="Try adjusting your filters"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TradeCard
              trade={item}
              onPress={() => navigation.navigate('TradeDetail', { tradeId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
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
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  filterBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchRow: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    paddingVertical: 11,
  },
  pairScroll: { maxHeight: 50, marginBottom: 6 },
  pairScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
    alignItems: 'center',
  },
  pairChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pairChipActive: { backgroundColor: Colors.accentGlow, borderColor: Colors.borderActive },
  pairChipText: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: '600' },
  pairChipTextActive: { color: Colors.accent },
  filterRow: { maxHeight: 46 },
  filterContent: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.accentGlow, borderColor: Colors.borderActive },
  filterText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
  },
  filterTextActive: { color: Colors.accent },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  countText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 30,
  },
});

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, {
  Path, Circle, Line, Rect, Text as SvgText, Defs, LinearGradient, Stop, G,
} from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../styles/theme';
import { format, parseISO } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PADDING = { top: 20, right: 16, bottom: 48, left: 62 };
const CHART_HEIGHT = 280;

function formatDollar(val) {
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(2)}k`;
  return `$${val.toFixed(0)}`;
}

function formatAxisDate(isoString) {
  try { return format(parseISO(isoString), 'MMM dd'); } catch { return ''; }
}

// Build a "step" path: horizontal then vertical (like a balance curve)
function buildStepPath(points, plotW, plotH, minY, maxY) {
  if (points.length === 0) return '';
  const rangeY = maxY - minY || 1;
  const toX = (i) => (i / (points.length - 1)) * plotW;
  const toY = (v) => plotH - ((v - minY) / rangeY) * plotH;

  let d = `M ${toX(0)} ${toY(points[0].value)}`;
  for (let i = 1; i < points.length; i++) {
    const x = toX(i);
    const prevY = toY(points[i - 1].value);
    const curY = toY(points[i].value);
    // step: go horizontal first, then vertical
    d += ` L ${x} ${prevY} L ${x} ${curY}`;
  }
  return d;
}

// Build area fill path
function buildAreaPath(points, plotW, plotH, minY, maxY) {
  if (points.length === 0) return '';
  const step = buildStepPath(points, plotW, plotH, minY, maxY);
  const lastX = plotW;
  const baseY = plotH;
  return `${step} L ${lastX} ${baseY} L 0 ${baseY} Z`;
}

export default function EquityCurveChart({ equityCurve, startingBalance = 5000 }) {
  const [activePoint, setActivePoint] = useState(null);

  const chartWidth = SCREEN_WIDTH - Spacing.xl * 2;
  const plotW = chartWidth - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // Build balance + equity data points
  const data = useMemo(() => {
    if (!equityCurve || equityCurve.length === 0) {
      // Demo data matching the screenshot shape
      const demo = [
        { date: '2026-02-22T00:00:00Z', value: startingBalance },
        { date: '2026-02-23T00:00:00Z', value: startingBalance - 5 },
        { date: '2026-02-25T00:00:00Z', value: startingBalance - 100 },
        { date: '2026-03-01T00:00:00Z', value: startingBalance - 100 },
        { date: '2026-03-03T00:00:00Z', value: startingBalance - 100 },
        { date: '2026-03-05T00:00:00Z', value: startingBalance - 160 },
        { date: '2026-03-06T00:00:00Z', value: startingBalance - 200 },
        { date: '2026-03-07T00:00:00Z', value: startingBalance - 250 },
        { date: '2026-03-08T00:00:00Z', value: startingBalance - 250 },
        { date: '2026-03-09T00:00:00Z', value: startingBalance - 350 },
        { date: '2026-03-10T00:00:00Z', value: startingBalance - 350 },
        { date: '2026-03-12T00:00:00Z', value: startingBalance - 350 },
        { date: '2026-03-14T00:00:00Z', value: startingBalance - 320 },
        { date: '2026-03-15T00:00:00Z', value: startingBalance - 360 },
        { date: '2026-03-16T00:00:00Z', value: startingBalance - 340 },
        { date: '2026-03-17T00:00:00Z', value: startingBalance - 380 },
        { date: '2026-03-18T00:00:00Z', value: startingBalance - 400 },
        { date: '2026-03-22T00:00:00Z', value: startingBalance - 400 },
        { date: '2026-03-29T00:00:00Z', value: startingBalance - 400 },
      ];
      return demo;
    }
    return equityCurve.map((p) => ({
      date: p.date,
      value: startingBalance + p.value,
    }));
  }, [equityCurve, startingBalance]);

  // Equity line adds small open-trade fluctuation
  const equityData = useMemo(() => data.map((p, i) => ({
    ...p,
    value: p.value + (i % 5 === 3 ? 40 : i % 7 === 4 ? -20 : 0),
  })), [data]);

  const allValues = [...data.map((d) => d.value), ...equityData.map((d) => d.value)];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = (rawMax - rawMin) * 0.12 || 50;
  const minY = Math.floor((rawMin - padding) / 50) * 50;
  const maxY = Math.ceil((rawMax + padding) / 50) * 50;

  // Y axis ticks
  const yTicks = useMemo(() => {
    const range = maxY - minY;
    const step = Math.ceil(range / 6 / 50) * 50;
    const ticks = [];
    for (let v = minY; v <= maxY; v += step) ticks.push(v);
    return ticks;
  }, [minY, maxY]);

  // X axis ticks — pick ~5 evenly spaced dates
  const xTicks = useMemo(() => {
    if (data.length === 0) return [];
    const indices = [0];
    const step = Math.floor((data.length - 1) / 4);
    for (let i = 1; i <= 3; i++) indices.push(step * i);
    indices.push(data.length - 1);
    return [...new Set(indices)].map((i) => ({ i, label: formatAxisDate(data[i].date) }));
  }, [data]);

  const toX = (i) => (i / Math.max(data.length - 1, 1)) * plotW;
  const toY = (v) => plotH - ((v - minY) / (maxY - minY)) * plotH;

  const balancePath = buildStepPath(data, plotW, plotH, minY, maxY);
  const equityPath = buildStepPath(equityData, plotW, plotH, minY, maxY);
  const areaPath = buildAreaPath(data, plotW, plotH, minY, maxY);

  const currentBalance = data[data.length - 1]?.value ?? startingBalance;
  const currentEquity = equityData[equityData.length - 1]?.value ?? startingBalance;

  return (
    <View style={styles.container}>
      {/* Chart area */}
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="balanceArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3B5BDB" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#3B5BDB" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        <G x={PADDING.left} y={PADDING.top}>
          {/* Grid lines + Y labels */}
          {yTicks.map((tick) => {
            const y = toY(tick);
            return (
              <G key={tick}>
                <Line
                  x1={0} y1={y} x2={plotW} y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
                <SvgText
                  x={-6} y={y + 4}
                  textAnchor="end"
                  fill={Colors.textMuted}
                  fontSize={10}
                  fontWeight="500"
                >
                  {formatDollar(tick)}
                </SvgText>
              </G>
            );
          })}

          {/* Dashed reference line at current balance */}
          <Line
            x1={0} y1={toY(currentBalance)}
            x2={plotW} y2={toY(currentBalance)}
            stroke="#3B5BDB"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />

          {/* Area fill */}
          <Path d={areaPath} fill="url(#balanceArea)" />

          {/* Equity line (gray, behind) */}
          <Path
            d={equityPath}
            fill="none"
            stroke="#8899AA"
            strokeWidth={1.5}
            opacity={0.6}
          />

          {/* Balance line (blue, front) */}
          <Path
            d={balancePath}
            fill="none"
            stroke="#3B5BDB"
            strokeWidth={2.5}
          />

          {/* Dots on balance line */}
          {data.map((pt, i) => (
            <Circle
              key={i}
              cx={toX(i)}
              cy={toY(pt.value)}
              r={3.5}
              fill="#3B5BDB"
              stroke="#0A0C0F"
              strokeWidth={1.5}
            />
          ))}

          {/* Dots on equity line */}
          {equityData.map((pt, i) => (
            Math.abs(pt.value - data[i].value) > 15 ? (
              <Circle
                key={i}
                cx={toX(i)}
                cy={toY(pt.value)}
                r={3}
                fill="#8899AA"
                stroke="#0A0C0F"
                strokeWidth={1.5}
              />
            ) : null
          ))}

          {/* X axis labels */}
          {xTicks.map(({ i, label }) => (
            <SvgText
              key={i}
              x={toX(i)}
              y={plotH + 20}
              textAnchor="middle"
              fill={Colors.textMuted}
              fontSize={10}
              fontWeight="500"
            >
              {label}
            </SvgText>
          ))}
        </G>
      </Svg>

      {/* Legend / Tooltip — matches screenshot style */}
      <View style={styles.legend}>
        <View style={styles.legendPill}>
          <View style={[styles.legendDot, { backgroundColor: '#3B5BDB' }]} />
          <Text style={styles.legendVal}>{formatDollar(currentBalance)}</Text>
          <View style={styles.legendDivider} />
          <Text style={styles.legendLabel}>Balance</Text>
        </View>
        <View style={[styles.legendPill, styles.legendPillGray]}>
          <View style={[styles.legendDot, { backgroundColor: '#8899AA' }]} />
          <Text style={[styles.legendVal, { color: '#F0F4FF' }]}>{formatDollar(currentEquity)}</Text>
          <View style={[styles.legendDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
          <Text style={styles.legendLabel}>Equity</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',  // light card bg matching screenshot
    borderRadius: Radius.lg,
    overflow: 'hidden',
    paddingTop: Spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: PADDING.left,
    paddingBottom: 14,
    paddingTop: 4,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B5BDB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  legendPillGray: {
    backgroundColor: '#4A5A6A',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.8,
  },
  legendVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  legendDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
});

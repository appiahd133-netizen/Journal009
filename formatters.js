import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatCurrency(value, decimals = 2) {
  const n = parseFloat(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1000) {
    return `$${(n / 1000).toFixed(1)}k`;
  }
  return `$${n.toFixed(decimals)}`;
}

export function formatPips(value) {
  const n = parseFloat(value) || 0;
  return `${n > 0 ? '+' : ''}${n.toFixed(1)} pips`;
}

export function formatDate(isoString) {
  try {
    const date = parseISO(isoString);
    if (isToday(date)) return `Today ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
    return format(date, 'MMM dd, yyyy');
  } catch {
    return isoString;
  }
}

export function formatPercent(value, decimals = 1) {
  return `${parseFloat(value).toFixed(decimals)}%`;
}

export function getPairFlag(pair) {
  const flags = {
    EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', JPY: '🇯🇵',
    AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿',
    XAU: '🥇', BTC: '₿',
  };
  const base = pair.slice(0, 3).toUpperCase();
  const quote = pair.slice(3, 6).toUpperCase();
  return `${flags[base] || '🌐'}${flags[quote] || ''}`;
}

export const CURRENCY_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
  'USDCHF', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP',
  'AUDJPY', 'EURAUD', 'EURCAD', 'GBPAUD', 'XAUUSD',
];

export const EMOTIONS = [
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'fear', label: 'Fear', emoji: '😨' },
  { id: 'greedy', label: 'Greedy', emoji: '🤑' },
  { id: 'fomo', label: 'FOMO', emoji: '😤' },
  { id: 'revenge', label: 'Revenge', emoji: '😡' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
];

export const TRADE_TAGS = [
  'trend', 'breakout', 'reversal', 'scalp', 'swing',
  'news', 'technical', 'support', 'resistance', 'fib',
];

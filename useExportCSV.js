import { useCallback } from 'react';
import { Share, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export function useExportCSV(trades) {
  const exportCSV = useCallback(async () => {
    if (trades.length === 0) {
      Alert.alert('No Trades', 'Log some trades first before exporting.');
      return;
    }

    const headers = [
      'Date', 'Pair', 'Direction', 'Status',
      'Entry Price', 'Exit Price', 'Lot Size',
      'Stop Loss', 'Take Profit', 'P&L',
      'Emotion', 'Tags', 'Notes',
    ];

    const rows = trades.map((t) => [
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
      t.pair || '',
      t.direction || '',
      t.status || '',
      t.entryPrice || '',
      t.exitPrice || '',
      t.lotSize || '',
      t.stopLoss || '',
      t.takeProfit || '',
      t.pnl || '',
      t.emotion || '',
      (t.tags || []).join(';'),
      (t.notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    try {
      if (Platform.OS === 'web') {
        // Web fallback
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'forex_trades.csv';
        a.click();
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'forex_trades.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Share.share({
        url: fileUri,
        title: 'Forex Journal — Trade Export',
        message: `Exporting ${trades.length} trades from Forex Journal`,
      });
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export trades. Please try again.');
      console.error(e);
    }
  }, [trades]);

  return { exportCSV };
}

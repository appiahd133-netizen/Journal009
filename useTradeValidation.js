import { useState, useCallback } from 'react';

export function useTradeValidation() {
  const [errors, setErrors] = useState({});

  const validate = useCallback((trade) => {
    const e = {};

    if (!trade.pair) e.pair = 'Please select a currency pair';

    if (!trade.entryPrice || isNaN(parseFloat(trade.entryPrice))) {
      e.entryPrice = 'Enter a valid entry price';
    }

    if (!trade.lotSize || isNaN(parseFloat(trade.lotSize)) || parseFloat(trade.lotSize) <= 0) {
      e.lotSize = 'Enter a valid lot size (e.g. 0.10)';
    }

    if (trade.status === 'closed') {
      if (!trade.exitPrice || isNaN(parseFloat(trade.exitPrice))) {
        e.exitPrice = 'Enter a valid exit price';
      }
    }

    if (trade.stopLoss && isNaN(parseFloat(trade.stopLoss))) {
      e.stopLoss = 'Invalid stop loss value';
    }

    if (trade.takeProfit && isNaN(parseFloat(trade.takeProfit))) {
      e.takeProfit = 'Invalid take profit value';
    }

    // Logical SL/TP check
    const entry = parseFloat(trade.entryPrice);
    const sl = parseFloat(trade.stopLoss);
    const tp = parseFloat(trade.takeProfit);
    if (trade.direction === 'BUY') {
      if (sl && sl >= entry) e.stopLoss = 'Stop loss must be below entry for BUY';
      if (tp && tp <= entry) e.takeProfit = 'Take profit must be above entry for BUY';
    } else {
      if (sl && sl <= entry) e.stopLoss = 'Stop loss must be above entry for SELL';
      if (tp && tp >= entry) e.takeProfit = 'Take profit must be below entry for SELL';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, []);

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  return { errors, validate, clearError, clearAll };
}

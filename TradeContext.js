import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@forex_journal_trades';
const TradeContext = createContext(null);

export function TradeProvider({ children }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load trades from storage on mount
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setTrades(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load trades:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveTrades = async (updatedTrades) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));
    } catch (e) {
      console.error('Failed to save trades:', e);
    }
  };

  const addTrade = useCallback((trade) => {
    const newTrade = {
      ...trade,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTrades((prev) => {
      const updated = [newTrade, ...prev];
      saveTrades(updated);
      return updated;
    });
    return newTrade;
  }, []);

  const updateTrade = useCallback((id, updates) => {
    setTrades((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
      saveTrades(updated);
      return updated;
    });
  }, []);

  const deleteTrade = useCallback((id) => {
    setTrades((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTrades(updated);
      return updated;
    });
  }, []);

  const getTradeById = useCallback((id) => trades.find((t) => t.id === id), [trades]);

  // Analytics calculations
  const analytics = useCallback(() => {
    if (trades.length === 0) return null;

    const closedTrades = trades.filter((t) => t.status === 'closed');
    const totalPL = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
    const winners = closedTrades.filter((t) => (parseFloat(t.pnl) || 0) > 0);
    const losers = closedTrades.filter((t) => (parseFloat(t.pnl) || 0) < 0);
    const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0;
    const avgWin = winners.length > 0 ? winners.reduce((s, t) => s + parseFloat(t.pnl), 0) / winners.length : 0;
    const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((s, t) => s + parseFloat(t.pnl), 0) / losers.length) : 0;
    const rr = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Equity curve - cumulative PnL over time
    let cumulative = 0;
    const equityCurve = closedTrades
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((t) => {
        cumulative += parseFloat(t.pnl) || 0;
        return { date: t.createdAt, value: cumulative };
      });

    // Best/Worst pair
    const pairStats = {};
    closedTrades.forEach((t) => {
      if (!pairStats[t.pair]) pairStats[t.pair] = { pnl: 0, count: 0 };
      pairStats[t.pair].pnl += parseFloat(t.pnl) || 0;
      pairStats[t.pair].count++;
    });

    return {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: trades.filter((t) => t.status === 'open').length,
      totalPL,
      winRate,
      winners: winners.length,
      losers: losers.length,
      avgWin,
      avgLoss,
      rr,
      equityCurve,
      pairStats,
      bestDay: totalPL > 0 ? totalPL : 0,
    };
  }, [trades]);

  return (
    <TradeContext.Provider value={{ trades, loading, addTrade, updateTrade, deleteTrade, getTradeById, analytics }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used inside TradeProvider');
  return ctx;
}

import { useState, useCallback } from 'react';
import { HISTORY_CONSTANTS } from '../constants/ui';

export interface HistoryState<T> {
  data: T;
  timestamp: number;
}

export const useUndoRedo = <T>(initialData: T) => {
  const [history, setHistory] = useState<HistoryState<T>[]>([
    { data: initialData, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushHistory = useCallback((newData: T) => {
    setHistory(prevHistory => {
      // 現在の位置より後の履歴を削除（新しい変更をした場合）
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // 新しい状態を追加
      const updatedHistory = [
        ...newHistory,
        { data: newData, timestamp: Date.now() }
      ];

      // 履歴サイズ制限
      if (updatedHistory.length > HISTORY_CONSTANTS.MAX_HISTORY_SIZE) {
        return updatedHistory.slice(-HISTORY_CONSTANTS.MAX_HISTORY_SIZE);
      }

      return updatedHistory;
    });

    setCurrentIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, HISTORY_CONSTANTS.MAX_HISTORY_SIZE - 1);
      return newIndex;
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1].data;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1].data;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentData = history[currentIndex]?.data;

  return {
    currentData,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
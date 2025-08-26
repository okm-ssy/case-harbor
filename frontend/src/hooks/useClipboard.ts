import { useCallback } from 'react';
import { TestCase } from '../types';
import { CLIPBOARD_CONSTANTS } from '../constants/ui';

export const useClipboard = () => {
  const copyRowToTSV = useCallback(async (testCase: TestCase) => {
    const tsvData = CLIPBOARD_CONSTANTS.FIELDS
      .map(field => `"${testCase[field] || ''}"`)
      .join(CLIPBOARD_CONSTANTS.TSV_SEPARATOR);
    
    try {
      await navigator.clipboard.writeText(tsvData);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  const pasteFromTSV = useCallback(async (): Promise<string[] | null> => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return null;
      
      // TSV形式（タブ区切り）をパース
      const values = text.split(CLIPBOARD_CONSTANTS.TSV_SEPARATOR);
      
      // 4つのフィールド（specification, preconditions, steps, verification）に合わせる
      const result = new Array(4).fill('');
      for (let i = 0; i < Math.min(values.length, 4); i++) {
        // ダブルクォートを除去
        const value = values[i] || '';
        result[i] = value.startsWith('"') && value.endsWith('"') 
          ? value.slice(1, -1) 
          : value;
      }
      
      return result;
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      return null;
    }
  }, []);

  return {
    copyRowToTSV,
    pasteFromTSV,
  };
};
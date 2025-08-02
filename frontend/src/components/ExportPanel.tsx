import { useState } from 'react';
import { TestCase } from '../types';
import { API_CONSTANTS } from '../constants/ui';

interface ExportPanelProps {
  testCases: TestCase[];
}

export function ExportPanel({ testCases }: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [format, setFormat] = useState<string>('json');

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: API_CONSTANTS.METHODS.POST,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: selectedIds.length > 0 ? selectedIds : undefined 
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `testcases.${format === 'markdown' ? 'md' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setIsOpen(false);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(testCases.map(tc => tc.id));
  };

  const selectNone = () => {
    setSelectedIds([]);
  };

  return (
    <>
      <button 
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        エクスポート
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">テストケースをエクスポート</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">形式</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  テストケースを選択
                </label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    全て
                  </button>
                  <button 
                    type="button" 
                    onClick={selectNone}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    なし
                  </button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                {testCases.map(tc => (
                  <label key={tc.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tc.id)}
                      onChange={() => toggleSelection(tc.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900 truncate">{tc.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleExport}
                disabled={selectedIds.length === 0 && testCases.length > 0}
              >
                エクスポート {selectedIds.length > 0 ? `(${selectedIds.length}件)` : '(全て)'}
              </button>
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
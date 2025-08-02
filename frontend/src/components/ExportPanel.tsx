import { useState } from 'react';
import { TestCase } from '../types';

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
        method: 'POST',
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
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        エクスポート
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
            <h2>テストケースをエクスポート</h2>
            
            <div className="form-group">
              <label>形式</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                テストケースを選択 
                <span className="selection-actions">
                  <button type="button" onClick={selectAll}>全て</button>
                  <button type="button" onClick={selectNone}>なし</button>
                </span>
              </label>
              <div className="test-case-selection">
                {testCases.map(tc => (
                  <label key={tc.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tc.id)}
                      onChange={() => toggleSelection(tc.id)}
                    />
                    {tc.title}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleExport}
                disabled={selectedIds.length === 0 && testCases.length > 0}
              >
                エクスポート {selectedIds.length > 0 ? `(${selectedIds.length}件)` : '(全て)'}
              </button>
              <button className="btn" onClick={() => setIsOpen(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
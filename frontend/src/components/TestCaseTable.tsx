import { useState } from 'react';
import { TestCase } from '../types';

interface TestCaseTableProps {
  testCases: TestCase[];
  onSave: (testCase: Partial<TestCase>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  selectedProjectId: string;
}

interface EditingCell {
  testCaseId: string;
  field: string;
}

export function TestCaseTable({ testCases, onSave, onDelete, onAdd, selectedProjectId }: TestCaseTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isTabNavigating, setIsTabNavigating] = useState(false);

  const startEdit = (testCaseId: string, field: string, currentValue: string) => {
    setEditingCell({ testCaseId, field });
    setEditValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const testCase = testCases.find(tc => tc.id === editingCell.testCaseId);
    if (!testCase) return;

    const updateData: Partial<TestCase> = { id: testCase.id };

    if (editingCell.field === 'title') {
      updateData.title = editValue;
    } else if (editingCell.field === 'specification') {
      updateData.specification = editValue;
    } else if (editingCell.field === 'preconditions') {
      updateData.preconditions = editValue;
    } else if (editingCell.field === 'steps') {
      updateData.steps = editValue;
    } else if (editingCell.field === 'verification') {
      updateData.verification = editValue;
    } else if (editingCell.field === 'tags') {
      updateData.tags = editValue.split(',').map(t => t.trim()).filter(t => t);
    }

    await onSave(updateData);
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getNextField = (currentField: string, direction: 'next' | 'prev'): string | null => {
    const fields = ['specification', 'preconditions', 'steps', 'verification'];
    const currentIndex = fields.indexOf(currentField);
    
    if (direction === 'next') {
      return currentIndex < fields.length - 1 ? fields[currentIndex + 1] : null;
    } else {
      return currentIndex > 0 ? fields[currentIndex - 1] : null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentTestCase: TestCase, field: string) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter で次項目に移動
      e.preventDefault();
      navigateToNextField(currentTestCase, field, 'next');
    } else if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      navigateToNextField(currentTestCase, field, e.shiftKey ? 'prev' : 'next');
    }
  };

  const navigateToNextField = (currentTestCase: TestCase, field: string, direction: 'next' | 'prev') => {
    setIsTabNavigating(true);
    
    const nextField = getNextField(field, direction);
    if (nextField) {
      // 同じテストケース内での移動
      saveCurrentEdit(currentTestCase);
      startEdit(currentTestCase.id, nextField, getFieldValue(currentTestCase, nextField));
      setIsTabNavigating(false);
    } else {
      // テストケース間の移動
      const currentIndex = testCases.findIndex(tc => tc.id === currentTestCase.id);
      
      if (direction === 'next' && field === 'verification') {
        // 確認事項からTabで次のケースの仕様へ
        const nextTestCase = testCases[currentIndex + 1];
        if (nextTestCase) {
          saveCurrentEdit(currentTestCase);
          startEdit(nextTestCase.id, 'specification', getFieldValue(nextTestCase, 'specification'));
          setIsTabNavigating(false);
          return;
        }
      } else if (direction === 'prev' && field === 'specification') {
        // 仕様からShift+Tabで前のケースの確認事項へ
        const prevTestCase = testCases[currentIndex - 1];
        if (prevTestCase) {
          saveCurrentEdit(currentTestCase);
          startEdit(prevTestCase.id, 'verification', getFieldValue(prevTestCase, 'verification'));
          setIsTabNavigating(false);
          return;
        }
      }
      
      // 境界に達した場合は編集を終了
      saveEdit();
      setIsTabNavigating(false);
    }
  };

  const saveCurrentEdit = (currentTestCase: TestCase) => {
    if (editingCell) {
      const updateData: Partial<TestCase> = { id: currentTestCase.id };
      if (editingCell.field === 'specification') {
        updateData.specification = editValue;
      } else if (editingCell.field === 'preconditions') {
        updateData.preconditions = editValue;
      } else if (editingCell.field === 'steps') {
        updateData.steps = editValue;
      } else if (editingCell.field === 'verification') {
        updateData.verification = editValue;
      }
      onSave(updateData);
    }
  };

  const getFieldValue = (testCase: TestCase, field: string): string => {
    switch (field) {
      case 'specification': return testCase.specification;
      case 'preconditions': return testCase.preconditions;
      case 'steps': return testCase.steps;
      case 'verification': return testCase.verification;
      default: return '';
    }
  };

  const getDisplayValue = (value: string): string => {
    if (!value) return '';
    
    const lines = value.split('\n');
    if (lines.length <= 3) {
      return value;
    }
    
    // 3行以上の場合は最初の3行 + "..."
    const firstThreeLines = lines.slice(0, 3).join('\n');
    return firstThreeLines + '\n...';
  };

  const renderEditableCell = (currentTestCase: TestCase, field: string, value: string, isMultiline = false) => {
    const isEditing = editingCell?.testCaseId === currentTestCase.id && editingCell?.field === field;

    if (isEditing) {
      return isMultiline ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => !isTabNavigating && saveEdit()}
          onKeyDown={(e) => handleKeyDown(e, currentTestCase, field)}
          className="inline-edit-textarea"
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => !isTabNavigating && saveEdit()}
          onKeyDown={(e) => handleKeyDown(e, currentTestCase, field)}
          className="inline-edit-input"
          autoFocus
        />
      );
    }

    // 非選択状態での表示: 3行制限
    const displayValue = getDisplayValue(value);

    return (
      <div
        className="editable-cell"
        onClick={() => startEdit(currentTestCase.id, field, value)}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {displayValue || <span className="placeholder">Click to edit</span>}
      </div>
    );
  };

  if (!selectedProjectId) {
    return (
      <div className="test-case-table">
        <div className="empty-state">
          <p>プロジェクトを選択してテストケースを表示してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-case-table">
      <div className="table-header">
        <h2>テストケース</h2>
        <button className="btn btn-primary" onClick={onAdd}>
          追加
        </button>
      </div>

      {testCases.length === 0 ? (
        <div className="empty-state">
          <p>テストケースがありません。最初のテストケースを追加しましょう！</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>仕様</th>
              <th>事前条件</th>
              <th>手順</th>
              <th>確認事項</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase, index) => (
              <tr key={testCase.id}>
                <td className="id-cell">
                  {index + 1}
                </td>
                <td className="spec-cell">
                  {renderEditableCell(testCase, 'specification', testCase.specification, true)}
                </td>
                <td className="precond-cell">
                  {renderEditableCell(testCase, 'preconditions', testCase.preconditions, true)}
                </td>
                <td className="steps-cell">
                  {renderEditableCell(testCase, 'steps', testCase.steps, true)}
                </td>
                <td className="verify-cell">
                  {renderEditableCell(testCase, 'verification', testCase.verification, true)}
                </td>
                <td className="actions-cell">
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(testCase.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
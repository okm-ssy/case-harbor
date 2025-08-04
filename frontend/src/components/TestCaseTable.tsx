import { useState, useEffect, useRef } from 'react';
import { TestCase } from '../types';
import { UI_CONSTANTS, TEXT_CONSTANTS, DISPLAY_CONSTANTS } from '../constants/ui';

interface TestCaseTableProps {
  testCases: TestCase[];
  onSave: (testCase: Partial<TestCase>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  selectedProjectId: string;
  projectName: string;
}

interface EditingCell {
  testCaseId: string;
  field: string;
}

export function TestCaseTable({ testCases, onSave, onDelete, onAdd, selectedProjectId, projectName }: TestCaseTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isTabNavigating, setIsTabNavigating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const startEdit = (testCaseId: string, field: string, currentValue: string) => {
    setEditingCell({ testCaseId, field });
    setEditValue(currentValue);
  };

  // フォーカス時にカーソルを文字列の末尾に移動
  useEffect(() => {
    if (inputRef.current && editingCell) {
      const element = inputRef.current;
      // 少し遅延させてDOMの更新を待つ
      setTimeout(() => {
        element.focus();
        if (element instanceof HTMLTextAreaElement) {
          element.setSelectionRange(element.value.length, element.value.length);
        } else if (element instanceof HTMLInputElement) {
          element.setSelectionRange(element.value.length, element.value.length);
        }
      }, UI_CONSTANTS.FOCUS_DELAY_MS);
    }
  }, [editingCell, editValue]);

  const saveEdit = async () => {
    if (!editingCell) return;

    const testCase = testCases.find(tc => tc.id === editingCell.testCaseId);
    if (!testCase) return;

    const updateData: Partial<TestCase> = { id: testCase.id };

    if (editingCell.field === 'specification') {
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

    // 編集状態を解除
    setEditingCell(null);

    // 楽観的更新により親コンポーネントで即座に state が更新される
    await onSave(updateData);
    
    // 最後のテストケースに入力があった場合、新しいテストケースを自動追加
    checkAndAddNewTestCase(testCase);
  };

  const checkAndAddNewTestCase = (updatedTestCase: TestCase) => {
    // 現在のテストケースが最後かどうかをチェック
    const currentIndex = testCases.findIndex(tc => tc.id === updatedTestCase.id);
    const isLastTestCase = currentIndex === testCases.length - 1;
    
    if (isLastTestCase) {
      // 最後のテストケースの任意のフィールドに内容があるかチェック
      const hasAnyContent = editValue.trim() !== '' ||
        updatedTestCase.specification.trim() !== '' ||
        updatedTestCase.preconditions.trim() !== '' ||
        updatedTestCase.steps.trim() !== '' ||
        updatedTestCase.verification.trim() !== '';
      
      // 現在空のテストケースで、初めて何かを入力した場合のみ追加
      const wasEmpty = updatedTestCase.specification.trim() === '' &&
        updatedTestCase.preconditions.trim() === '' &&
        updatedTestCase.steps.trim() === '' &&
        updatedTestCase.verification.trim() === '';
      
      if (hasAnyContent && wasEmpty) {
        // 新しい空のテストケースを最後に追加
        onAdd();
      }
    }
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
    
    // 表示用に末尾の空行を除去してから行数をカウント
    const trimmedValue = value.replace(/\n+$/, '');
    const lines = trimmedValue.split('\n');
    
    if (lines.length <= DISPLAY_CONSTANTS.MAX_DISPLAY_LINES) {
      return value;
    }
    
    // 制限行数以上の場合は最初の制限行数 + "..."
    const firstLines = lines.slice(0, DISPLAY_CONSTANTS.MAX_DISPLAY_LINES).join('\n');
    return firstLines + '\n' + DISPLAY_CONSTANTS.ELLIPSIS;
  };

  const renderEditableCell = (currentTestCase: TestCase, field: string, value: string, isMultiline = false) => {
    const isEditing = editingCell?.testCaseId === currentTestCase.id && editingCell?.field === field;

    if (isEditing) {
      return isMultiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => !isTabNavigating && saveEdit()}
          onKeyDown={(e) => handleKeyDown(e, currentTestCase, field)}
          className="w-full p-2 border-2 border-blue-400 rounded-md font-inherit bg-gray-800 text-gray-100 resize-y min-h-[7.5rem] max-h-[200px] outline-none custom-scrollbar"
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => !isTabNavigating && saveEdit()}
          onKeyDown={(e) => handleKeyDown(e, currentTestCase, field)}
          className="w-full p-2 border-2 border-blue-400 rounded-md font-inherit bg-gray-800 text-gray-100 outline-none"
        />
      );
    }

    // 非選択状態での表示: 楽観的更新により即座に反映される
    const displayValue = getDisplayValue(value);

    return (
      <div
        className="min-h-[7.5rem] max-h-[7.5rem] p-2 rounded-md cursor-text transition-colors duration-200 bg-transparent text-gray-200 flex items-start overflow-y-auto leading-6 break-words hover:bg-gray-700 custom-scrollbar"
        onClick={() => startEdit(currentTestCase.id, field, value)}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {displayValue || <span className="text-gray-500 italic">{TEXT_CONSTANTS.PLACEHOLDERS.CLICK_TO_EDIT}</span>}
      </div>
    );
  };

  if (!selectedProjectId) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
        <div className="flex items-center justify-center p-16 text-gray-400 text-center">
          <p>{TEXT_CONSTANTS.PLACEHOLDERS.SELECT_PROJECT}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
      <div className="flex justify-between items-end p-6 bg-gray-800 border-b border-gray-600">
        <div className="flex items-end gap-4">
          <h2 className="text-xl text-gray-100 font-semibold">{TEXT_CONSTANTS.HEADERS.TEST_CASES}</h2>
          <div className="flex items-end gap-3 text-sm text-gray-400">
            <span>{projectName}</span>
            <span>•</span>
            <span>{testCases.length}件</span>
          </div>
        </div>
        <button 
          className="px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-500 transition-colors duration-200 text-sm font-medium"
          onClick={onAdd}
        >
          {TEXT_CONSTANTS.BUTTONS.ADD}
        </button>
      </div>

      {testCases.length === 0 ? (
        <div className="flex items-center justify-center p-16 text-gray-400 text-center">
          <p>{TEXT_CONSTANTS.PLACEHOLDERS.NO_TEST_CASES}</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
          <table className="w-full min-w-[800px] border-collapse bg-gray-900">
          <thead className="sticky top-0 z-20 bg-gray-800">
            <tr>
              <th className="w-[5%] min-w-[50px] p-4 text-left bg-gray-800 font-semibold text-gray-400 text-sm uppercase tracking-wide border-b border-gray-600 text-center">
                {TEXT_CONSTANTS.HEADERS.ID}
              </th>
              <th className="w-[20%] min-w-[150px] p-4 text-left bg-gray-800 font-semibold text-gray-400 text-sm uppercase tracking-wide border-b border-gray-600">
                {TEXT_CONSTANTS.HEADERS.SPECIFICATION}
              </th>
              <th className="w-[20%] min-w-[150px] p-4 text-left bg-gray-800 font-semibold text-gray-400 text-sm uppercase tracking-wide border-b border-gray-600">
                {TEXT_CONSTANTS.HEADERS.PRECONDITIONS}
              </th>
              <th className="w-[30%] min-w-[200px] p-4 text-left bg-gray-800 font-semibold text-gray-400 text-sm uppercase tracking-wide border-b border-gray-600">
                {TEXT_CONSTANTS.HEADERS.STEPS}
              </th>
              <th className="w-[30%] min-w-[200px] p-4 text-left bg-gray-800 font-semibold text-gray-400 text-sm uppercase tracking-wide border-b border-gray-600">
                {TEXT_CONSTANTS.HEADERS.VERIFICATION}
              </th>
              <th className="w-[8%] min-w-[80px] p-4 text-left bg-gray-800 font-semibold text-gray-400 text-sm uppercase tracking-wide border-b border-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase, index) => (
              <tr key={testCase.id} className="hover:bg-gray-800 transition-colors duration-150">
                <td className="p-4 text-center border-b border-gray-600 align-top pt-6 text-gray-200">
                  {index + 1}
                </td>
                <td className="p-4 border-b border-gray-600 align-top">
                  {renderEditableCell(testCase, 'specification', testCase.specification, true)}
                </td>
                <td className="p-4 border-b border-gray-600 align-top">
                  {renderEditableCell(testCase, 'preconditions', testCase.preconditions, true)}
                </td>
                <td className="p-4 border-b border-gray-600 align-top">
                  {renderEditableCell(testCase, 'steps', testCase.steps, true)}
                </td>
                <td className="p-4 border-b border-gray-600 align-top">
                  {renderEditableCell(testCase, 'verification', testCase.verification, true)}
                </td>
                <td className="p-4 text-center border-b border-gray-600 align-top pt-6">
                  <button 
                    className="px-3 py-1.5 bg-red-600 text-gray-100 rounded text-xs font-medium hover:bg-red-500 transition-colors duration-200"
                    onClick={() => onDelete(testCase.id)}
                  >
                    {TEXT_CONSTANTS.BUTTONS.DELETE}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
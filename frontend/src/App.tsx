import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TestCaseTable } from './components/TestCaseTable';
import { TestCase } from './types';
import './App.css';

function App() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTestCases();
    } else {
      setTestCases([]);
      setLoading(false);
    }
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTestCases = async () => {
    if (!selectedProjectId) {
      setTestCases([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/testcases?projectId=${selectedProjectId}`);
      const data = await response.json();
      // 作成日時でソートして、新しいテストケースが最後に来るようにする
      const sortedData = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setTestCases(sortedData);
    } catch (error) {
      console.error('Failed to fetch test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (testCase: Partial<TestCase>) => {
    try {
      const isUpdate = !!testCase.id;
      
      if (isUpdate) {
        // 楽観的更新: 即座にローカル state を更新
        setTestCases(prevTestCases => 
          prevTestCases.map(tc => 
            tc.id === testCase.id 
              ? { ...tc, ...testCase, updatedAt: new Date().toISOString() }
              : tc
          )
        );
      }
      
      const url = isUpdate ? `/api/testcases/${testCase.id}` : '/api/testcases';
      const method = isUpdate ? 'PUT' : 'POST';

      const payload = isUpdate ? testCase : { ...testCase, projectId: selectedProjectId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // API完了後に正式なデータで再同期
        await fetchTestCases();
      } else {
        // API失敗時は元に戻す必要があるが、fetchTestCases()で最新データを取得
        await fetchTestCases();
      }
    } catch (error) {
      console.error('Failed to save test case:', error);
      // エラー時も最新データで復元
      await fetchTestCases();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test case?')) return;

    try {
      const response = await fetch(`/api/testcases/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTestCases();
      }
    } catch (error) {
      console.error('Failed to delete test case:', error);
    }
  };

  const handleAddTestCase = async () => {
    if (!selectedProjectId) return;

    const newTestCase = {
      projectId: selectedProjectId,
      title: '新しいテストケース',
      specification: '',
      preconditions: '',
      steps: '',
      verification: '',
      tags: []
    };

    await handleSave(newTestCase);
  };

  return (
    <div className="app">
      <Sidebar 
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        testCases={testCases}
      />
      
      <main className="main-content">
        {loading ? (
          <div className="loading">Loading test cases...</div>
        ) : (
          <TestCaseTable
            testCases={testCases}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAddTestCase}
            selectedProjectId={selectedProjectId}
          />
        )}
      </main>
    </div>
  );
}

export default App;
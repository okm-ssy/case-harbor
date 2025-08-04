import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TestCaseTable } from './components/TestCaseTable';
import { TestCase, Project } from './types';
import { API_CONSTANTS, TEXT_CONSTANTS, STORAGE_CONSTANTS } from './constants/ui';

function App() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const savedProjectId = localStorage.getItem(STORAGE_CONSTANTS.KEYS.SELECTED_PROJECT_ID);
    if (savedProjectId) {
      setSelectedProjectId(savedProjectId);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTestCases();
    } else {
      setTestCases([]);
      setLoading(false);
    }
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      const response = await fetch(API_CONSTANTS.ENDPOINTS.PROJECTS);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };

  const fetchTestCases = async () => {
    if (!selectedProjectId) {
      setTestCases([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.TEST_CASES}?projectId=${selectedProjectId}`);
      const data = await response.json();
      // 作成日時でソートして、新しいテストケースが最後に来るようにする
      const sortedData = data.sort((a: TestCase, b: TestCase) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setTestCases(sortedData);
    } catch (error) {
      console.error(TEXT_CONSTANTS.MESSAGES.FETCH_ERROR, error);
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
      
      const url = isUpdate ? `${API_CONSTANTS.ENDPOINTS.TEST_CASES}/${testCase.id}` : API_CONSTANTS.ENDPOINTS.TEST_CASES;
      const method = isUpdate ? API_CONSTANTS.METHODS.PUT : API_CONSTANTS.METHODS.POST;

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
      console.error(TEXT_CONSTANTS.MESSAGES.SAVE_ERROR, error);
      // エラー時も最新データで復元
      await fetchTestCases();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(TEXT_CONSTANTS.MESSAGES.DELETE_CONFIRM)) return;

    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.TEST_CASES}/${id}`, { method: API_CONSTANTS.METHODS.DELETE });
      if (response.ok) {
        await fetchTestCases();
      }
    } catch (error) {
      console.error(TEXT_CONSTANTS.MESSAGES.DELETE_ERROR, error);
    }
  };

  const handleAddTestCase = async () => {
    if (!selectedProjectId) return;

    const newTestCase = {
      projectId: selectedProjectId,
      specification: '',
      preconditions: '',
      steps: '',
      verification: '',
      tags: []
    };

    await handleSave(newTestCase);
  };

  return (
    <div className="flex min-h-screen bg-gray-800">
      <Sidebar 
        selectedProjectId={selectedProjectId}
        onProjectChange={(projectId) => {
          setSelectedProjectId(projectId);
          localStorage.setItem(STORAGE_CONSTANTS.KEYS.SELECTED_PROJECT_ID, projectId);
        }}
        testCases={testCases}
      />
      
      <main className="flex-1 p-8 overflow-auto bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-gray-400 text-lg">
            {TEXT_CONSTANTS.PLACEHOLDERS.LOADING}
          </div>
        ) : (
          <TestCaseTable
            testCases={testCases}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAddTestCase}
            selectedProjectId={selectedProjectId}
            projectName={getProjectName(selectedProjectId)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
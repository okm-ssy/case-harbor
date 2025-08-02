import { useState, useRef } from 'react';
import { ProjectSelector } from './ProjectSelector';
import { ExportPanel } from './ExportPanel';
import { TestCase } from '../types';

interface SidebarProps {
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  testCases: TestCase[];
}

export function Sidebar({ selectedProjectId, onProjectChange, testCases }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);


  return (
    <div 
      ref={sidebarRef}
      className={`bg-gray-900 border-r border-gray-600 flex flex-col relative transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-80'
      }`}
    >
      <div 
        className="absolute top-4 left-2 z-10 bg-gray-600 border border-gray-500 rounded w-6 h-6 flex items-center justify-center cursor-pointer text-gray-200 text-xs transition-colors duration-200 hover:bg-gray-500"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '▶' : '◀'}
      </div>

      <div className={`p-6 pl-12 overflow-y-auto flex-1 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="mb-8">
          <h1 className="text-2xl text-gray-100 mb-1">🚢 CaseHarbor</h1>
          <p className="text-sm text-gray-400">Test Case Management</p>
        </div>

        <div className="mb-8">
          <h3 className="text-base text-gray-200 mb-4 font-semibold">プロジェクト</h3>
          <ProjectSelector
            selectedProjectId={selectedProjectId}
            onProjectChange={onProjectChange}
          />
        </div>

        <div className="mb-8">
          <h3 className="text-base text-gray-200 mb-4 font-semibold">エクスポート</h3>
          <ExportPanel testCases={testCases} />
        </div>

        <div className="mb-8">
          <div className="bg-gray-800 p-4 rounded-md border border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">テストケース数</span>
              <span className="text-xl font-semibold text-gray-200">{testCases.length}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
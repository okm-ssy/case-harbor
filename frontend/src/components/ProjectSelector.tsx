import { useState, useEffect } from 'react';
import { Project } from '../types';

interface ProjectSelectorProps {
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

export function ProjectSelector({ selectedProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
      
      // Auto-select first project if none selected
      if (!selectedProjectId && data.length > 0) {
        onProjectChange(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() })
      });

      if (response.ok) {
        const newProject = await response.json();
        await fetchProjects();
        onProjectChange(newProject.id);
        setNewProjectName('');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure? This will delete all test cases in this project.')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchProjects();
        if (selectedProjectId === projectId) {
          onProjectChange(projects.length > 1 ? projects.find(p => p.id !== projectId)?.id || '' : '');
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <select 
        value={selectedProjectId} 
        onChange={(e) => onProjectChange(e.target.value)}
        className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-sm text-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
      >
        <option value="">プロジェクトを選択</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      {isCreating ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="プロジェクト名"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createProject();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            className="p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 text-sm focus:outline-none focus:border-blue-400"
            autoFocus
          />
          <div className="flex gap-2">
            <button 
              className="px-3 py-1.5 bg-blue-600 text-gray-100 rounded text-xs font-medium hover:bg-blue-500 transition-colors duration-200"
              onClick={createProject}
            >
              ✅
            </button>
            <button 
              className="px-3 py-1.5 bg-gray-600 text-gray-200 rounded text-xs font-medium hover:bg-gray-500 transition-colors duration-200"
              onClick={() => setIsCreating(false)}
            >
              ❌
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-gray-100 rounded text-sm font-medium hover:bg-blue-500 transition-colors duration-200"
            onClick={() => setIsCreating(true)}
          >
            新規作成
          </button>
          {selectedProjectId && (
            <button 
              className="px-3 py-1.5 bg-red-600 text-gray-100 rounded text-xs font-medium hover:bg-red-500 transition-colors duration-200"
              onClick={() => deleteProject(selectedProjectId)}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}
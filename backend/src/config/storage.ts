// Storage configuration
export const STORAGE_CONFIG = {
  // Set to 'new' to use the new project-based file structure
  // Set to 'old' to use the legacy individual file structure  
  mode: process.env.STORAGE_MODE || 'new'
};

export function isNewStorageMode(): boolean {
  return STORAGE_CONFIG.mode === 'new';
}
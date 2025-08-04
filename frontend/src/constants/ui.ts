// UI関連の定数
export const UI_CONSTANTS = {
  // 高さとマージン
  CELL_MIN_HEIGHT: '7.5rem',
  CELL_MAX_HEIGHT: '7.5rem',
  CELL_PADDING_TOP: '1.5rem',
  TEXTAREA_MIN_HEIGHT: '7.5rem',
  TEXTAREA_MAX_HEIGHT: '200px',
  
  // タイムアウトとフォーカス
  FOCUS_DELAY_MS: 10,
  
  // テーブル幅
  ID_CELL_WIDTH: '5%',
  ID_CELL_MIN_WIDTH: '50px',
  SPEC_CELL_WIDTH: '20%',
  SPEC_CELL_MIN_WIDTH: '150px',
  PRECOND_CELL_WIDTH: '20%',
  PRECOND_CELL_MIN_WIDTH: '150px',
  STEPS_CELL_WIDTH: '30%',
  STEPS_CELL_MIN_WIDTH: '200px',
  VERIFY_CELL_WIDTH: '30%',
  VERIFY_CELL_MIN_WIDTH: '200px',
  ACTIONS_CELL_WIDTH: '8%',
  ACTIONS_CELL_MIN_WIDTH: '80px',
  
  // サイドバー
  SIDEBAR_WIDTH: '320px',
  SIDEBAR_COLLAPSED_WIDTH: '40px',
  TOGGLE_BUTTON_SIZE: '24px',
} as const;

// API関連の定数
export const API_CONSTANTS = {
  ENDPOINTS: {
    TEST_CASES: '/api/testcases',
    PROJECTS: '/api/projects',
  },
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
  },
} as const;

// LocalStorage関連の定数
export const STORAGE_CONSTANTS = {
  KEYS: {
    SELECTED_PROJECT_ID: 'caseharb_selected_project_id',
  },
} as const;

// 文字列定数
export const TEXT_CONSTANTS = {
  PLACEHOLDERS: {
    CLICK_TO_EDIT: 'Click to edit',
    SELECT_PROJECT: 'プロジェクトを選択してテストケースを表示してください',
    NO_TEST_CASES: 'テストケースがありません。最初のテストケースを追加しましょう！',
    LOADING: 'Loading test cases...',
  },
  HEADERS: {
    TEST_CASES: 'テストケース',
    ID: 'ID',
    SPECIFICATION: '仕様',
    PRECONDITIONS: '事前条件',
    STEPS: '手順',
    VERIFICATION: '確認事項',
  },
  BUTTONS: {
    ADD: '追加',
    DELETE: '🗑️',
    SAVE: '保存',
    CANCEL: 'キャンセル',
  },
  DEFAULTS: {
    NEW_TEST_CASE: '新しいテストケース',
  },
  MESSAGES: {
    DELETE_CONFIRM: 'Are you sure you want to delete this test case?',
    SAVE_ERROR: 'Failed to save test case:',
    DELETE_ERROR: 'Failed to delete test case:',
    FETCH_ERROR: 'Failed to fetch test cases:',
  },
} as const;

// 表示制限定数
export const DISPLAY_CONSTANTS = {
  MAX_DISPLAY_LINES: 4,
  ELLIPSIS: '...',
} as const;
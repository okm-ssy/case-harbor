# Case Harbor リファクタリング実装ガイド

## 概要
現在のCase Harborはテストケースごとに個別のJSONファイルを作成していますが、これをプロジェクトごとに1つのJSONファイルにまとめる実装に変更します。これによりファイルI/Oを削減し、パフォーマンスを向上させます。

## 現在の実装の問題点
- **問題**: テストケース1件につき1つのJSONファイル
- **影響**: プロジェクトとテストケースが増えるとファイル数が爆発的に増加
- **結果**: ファイルI/Oのオーバーヘッドによる速度低下

## 新しいファイル構造

### 変更前
```
storage/
├── projects.json
└── test-cases/
    ├── tc-1756211603182-mb1idtllq.json
    ├── tc-1756211611333-6j4u8xp48.json
    ├── tc-1756211618806-s3uycv11l.json
    └── ... (各テストケースごとに1ファイル)
```

### 変更後
```
storage/
├── projects.json           # プロジェクトメタデータ
└── test-cases/
    ├── crm-griffin.json    # プロジェクトごとに1ファイル
    ├── crm-fairly.json
    └── crm-2x0.json
```

## データ構造定義

### 1. projects.json
プロジェクトの一覧とメタデータを管理します。

```json
{
  "projects": {
    "crm-griffin": {
      "id": "crm-griffin",
      "name": "CRM Griffin",
      "testCaseCount": 28,
      "lastModified": "2025-08-26T12:34:28.959Z",
      "createdAt": "2025-08-26T10:00:00.000Z",
      "description": "CRMのグラフ機能テスト",
      "tags": ["グラフ", "マイレージ", "キャンペーン"],
      "status": "active"  // active, archived, deleted
    }
  },
  "metadata": {
    "version": "1.0.0",
    "totalProjects": 3,
    "lastUpdated": "2025-08-26T12:34:28.959Z"
  }
}
```

### 2. test-cases/[project-id].json
各プロジェクトのテストケースを格納します。

```json
{
  "projectId": "crm-griffin",
  "projectName": "CRM Griffin",
  "testCases": {
    "tc-1756211603182-mb1idtllq": {
      "id": "tc-1756211603182-mb1idtllq",
      "specification": "グラフ設定一覧を開く",
      "preconditions": "取り込んだキャンペーンが複数ある\n取り込んだマイレージがある",
      "steps": "",
      "verification": "デザインがあっていること\nhttps://docs.google.com/...",
      "tags": ["グラフ設定", "マイレージ", "キャンペーン"],
      "createdAt": "2025-08-26T12:33:23.182Z",
      "updatedAt": "2025-08-26T12:33:23.182Z"
    },
    "tc-1756211611333-6j4u8xp48": {
      // 次のテストケース
    }
  },
  "metadata": {
    "count": 28,
    "lastUpdated": "2025-08-26T12:34:28.959Z",
    "version": "1.0.0"
  }
}
```

## 実装変更点

### 1. ファイル操作の変更

#### 現在の実装
```javascript
// テストケース作成時
const testCaseFile = path.join(TEST_CASES_DIR, `${testCaseId}.json`);
await fs.writeFile(testCaseFile, JSON.stringify(testCase));
```

#### 新しい実装
```javascript
// テストケース作成時
const projectFile = path.join(TEST_CASES_DIR, `${projectId}.json`);
const projectData = await readProjectFile(projectId);
projectData.testCases[testCaseId] = testCase;
projectData.metadata.count++;
projectData.metadata.lastUpdated = new Date().toISOString();
await fs.writeFile(projectFile, JSON.stringify(projectData));

// projects.jsonも更新
await updateProjectsMetadata(projectId, {
  testCaseCount: projectData.metadata.count,
  lastModified: projectData.metadata.lastUpdated
});
```

### 2. 主要な関数の変更

#### createTestCase関数
```javascript
async function createTestCase(params) {
  const testCaseId = generateTestCaseId();

  // プロジェクトファイルを読み込み
  const projectData = await readOrCreateProjectFile(params.projectId);

  // テストケースを追加
  projectData.testCases[testCaseId] = {
    id: testCaseId,
    specification: params.specification,
    preconditions: params.preconditions || '',
    steps: params.steps || '',
    verification: params.verification || '',
    tags: params.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // メタデータ更新
  projectData.metadata.count++;
  projectData.metadata.lastUpdated = new Date().toISOString();

  // プロジェクトファイルに保存
  await saveProjectFile(params.projectId, projectData);

  // projects.json更新
  await updateProjectsIndex(params.projectId);

  return testCaseId;
}
```

#### listTestCases関数
```javascript
async function listTestCases(params) {
  if (params.projectId) {
    // 特定プロジェクトのテストケース
    const projectData = await readProjectFile(params.projectId);
    return Object.values(projectData.testCases);
  } else {
    // 全プロジェクトのテストケース
    const projects = await readProjectsIndex();
    const allTestCases = [];

    for (const projectId of Object.keys(projects.projects)) {
      const projectData = await readProjectFile(projectId);
      allTestCases.push(...Object.values(projectData.testCases));
    }

    return allTestCases;
  }
}
```

### 3. ヘルパー関数の追加

```javascript
// プロジェクトファイルの読み込み（存在しない場合は作成）
async function readOrCreateProjectFile(projectId) {
  const filePath = path.join(TEST_CASES_DIR, `${projectId}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // ファイルが存在しない場合は新規作成
    return {
      projectId: projectId,
      projectName: projectId,
      testCases: {},
      metadata: {
        count: 0,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };
  }
}

// projects.jsonの更新
async function updateProjectsIndex(projectId) {
  const projectsPath = path.join(STORAGE_DIR, 'projects.json');
  const projects = await readProjectsIndex();
  const projectData = await readProjectFile(projectId);

  projects.projects[projectId] = {
    id: projectId,
    name: projectData.projectName,
    testCaseCount: projectData.metadata.count,
    lastModified: projectData.metadata.lastUpdated,
    createdAt: projects.projects[projectId]?.createdAt || new Date().toISOString(),
    description: projects.projects[projectId]?.description || '',
    tags: extractAllTags(projectData.testCases),
    status: 'active'
  };

  projects.metadata.lastUpdated = new Date().toISOString();

  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2));
}
```

## マイグレーション戦略

### 1. 既存データの移行
```javascript
async function migrateToNewStructure() {
  // 1. 既存のテストケースファイルを読み込み
  const testCaseFiles = await fs.readdir(TEST_CASES_DIR);
  const projectMap = new Map();

  // 2. プロジェクトごとにグループ化
  for (const file of testCaseFiles) {
    if (!file.endsWith('.json')) continue;

    const testCase = JSON.parse(await fs.readFile(path.join(TEST_CASES_DIR, file)));
    const projectId = testCase.projectId;

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, []);
    }
    projectMap.get(projectId).push(testCase);
  }

  // 3. 新しい形式で保存
  for (const [projectId, testCases] of projectMap) {
    const projectData = {
      projectId: projectId,
      projectName: projectId,
      testCases: {},
      metadata: {
        count: testCases.length,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };

    for (const testCase of testCases) {
      projectData.testCases[testCase.id] = testCase;
    }

    await fs.writeFile(
      path.join(TEST_CASES_DIR, `${projectId}.json`),
      JSON.stringify(projectData, null, 2)
    );
  }

  // 4. 古いファイルを削除（バックアップ後）
  await backupOldFiles();
  await deleteOldFiles();
}
```

## パフォーマンス改善の期待値

### 改善前
- プロジェクト一覧取得: O(n) ファイルアクセス（nはテストケース数）
- テストケース一覧取得: O(n) ファイルアクセス

### 改善後
- プロジェクト一覧取得: O(1) ファイルアクセス（projects.jsonのみ）
- テストケース一覧取得: O(p) ファイルアクセス（pはプロジェクト数）

## エラーハンドリング

```javascript
// ファイル破損対策
async function safeReadProjectFile(projectId) {
  const filePath = path.join(TEST_CASES_DIR, `${projectId}.json`);
  const backupPath = path.join(BACKUP_DIR, `${projectId}.backup.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // バリデーション
    if (!data.projectId || !data.testCases) {
      throw new Error('Invalid project file structure');
    }

    return data;
  } catch (error) {
    // バックアップから復元
    console.error(`Error reading ${projectId}.json, attempting backup restore`);
    return await restoreFromBackup(projectId);
  }
}
```

## 実装チェックリスト

- [ ] 新しいファイル構造の実装
- [ ] CRUD操作の更新
- [ ] マイグレーションスクリプトの作成
- [ ] バックアップ機能の実装
- [ ] エラーハンドリングの強化
- [ ] パフォーマンステストの実施
- [ ] ドキュメントの更新

## 注意事項

1. **後方互換性**: マイグレーション期間中は両方の形式を読めるようにする
2. **アトミック性**: ファイル書き込み時は一時ファイルを使用してアトミックに更新
3. **バックアップ**: 変更前に必ずバックアップを作成
4. **並行アクセス**: ファイルロックまたは楽観的ロックを実装

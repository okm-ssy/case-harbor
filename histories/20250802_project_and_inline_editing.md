# CaseHarbor プロジェクト機能とインライン編集実装

## 実装方針

1. **プロジェクト機能追加**: ドロップダウンでプロジェクト選択、追加・削除機能
2. **UIを刷新**: ダイアログ→インライン編集（テーブル形式）
3. **データ構造変更**: テストケースの項目を「仕様・事前条件・手順・確認事項」に変更

## 実装内容

### 1. データ構造の変更

#### 新しいTestCase型
```typescript
interface TestCase {
  id: string;
  projectId: string;      // プロジェクトID追加
  title: string;
  specification: string;  // 仕様（複数行）
  preconditions: string;  // 事前条件（複数行）
  steps: string;          // 手順（複数行）
  verification: string;   // 確認事項（複数行）
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Project型追加
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Backend API拡張

#### 新規エンドポイント
- `GET/POST /api/projects` - プロジェクト一覧・作成
- `GET/PUT/DELETE /api/projects/:id` - プロジェクト個別操作
- `GET /api/testcases?projectId=xxx` - プロジェクト別テストケース取得

#### データストレージ
- `data/projects/` - プロジェクトJSONファイル
- `data/testcases/` - テストケースJSONファイル（projectId付き）

### 3. Frontend UI刷新

#### ProjectSelector コンポーネント
- ドロップダウンによるプロジェクト選択
- 新規プロジェクト作成（インライン入力）
- プロジェクト削除（確認ダイアログ付き）

#### TestCaseTable コンポーネント（新規）
- テーブル形式での一覧表示
- インライン編集機能（クリックで編集モード）
- Enter保存、Escape キャンセル
- 複数行対応（textarea）

#### カラム構成
| タイトル | 仕様 | 事前条件 | 手順 | 確認事項 | タグ | 操作 |
|---------|------|----------|------|----------|------|------|
| 15%     | 20%  | 15%      | 20%  | 20%      | 8%   | 2%   |

### 4. エクスポート機能更新

#### 対応形式
- **CSV**: 新しい項目に対応
- **Markdown**: 日本語項目名でセクション分け
- **JSON**: 新しいデータ構造

### 5. 品質管理

#### Lint/TypeScript
- 全コンポーネントでlint通過
- TypeScript strict mode対応
- useEffect依存関係の適切な管理

#### UX改善
- レスポンシブ対応（モバイル・タブレット）
- インライン編集のビジュアルフィードバック
- 空状態のメッセージ表示

## 使用方法

1. **プロジェクト作成**: 「+ New Project」でプロジェクト作成
2. **プロジェクト選択**: ドロップダウンでプロジェクト切り替え
3. **テストケース追加**: 「+ Add Test Case」で新しい行を追加
4. **インライン編集**: セルをクリックして直接編集
5. **保存**: Enterで保存、Escapeでキャンセル

## 次のステップ

1. MCPサーバーのプロジェクト対応
2. ステップ編集の詳細UI（現在は簡易テキスト）
3. テストケースの実行状態管理
4. 検索・フィルター機能
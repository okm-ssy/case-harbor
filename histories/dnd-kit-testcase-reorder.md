# テストケースのドラッグ&ドロップ並び替え機能

## 実装方針

@dnd-kit/core と @dnd-kit/sortable を使用してテストケースの直感的な並び替え機能を実装。既存のテーブル構造を保持しつつ、各行にドラッグハンドルを追加してユーザビリティを向上させた。

## 実装内容

### 1. 依存関係の追加
- `@dnd-kit/core`: ドラッグ&ドロップの基本機能
- `@dnd-kit/sortable`: ソート可能なリスト機能  
- `@dnd-kit/utilities`: CSS変換ユーティリティ

### 2. 定数の追加 (ui.ts)
- `DRAG_HANDLE_WIDTH`: ドラッグハンドルの幅
- `DRAG_HANDLE_OPACITY`: ドラッグハンドルの透明度
- `DRAG_OVERLAY_OPACITY`: ドラッグ中のオーバーレイ透明度
- `BUTTONS.DRAG_HANDLE`: ドラッグハンドルアイコン（⋮⋮）

### 3. TestCaseTable.tsx の主要変更

#### コンポーネント分離
- `SortableTestCaseRow`: ドラッグ可能なテーブル行コンポーネントとして分離
- useSortable フックでドラッグ&ドロップ機能を実装

#### ドラッグ&ドロップ機能
- `DndContext`: 全体のドラッグ&ドロップ文脈を提供
- `SortableContext`: ソート可能なアイテムのコンテナ
- `DragOverlay`: ドラッグ中の視覚フィードバック

#### ドラッグハンドル
- IDカラムにドラッグハンドル（⋮⋮）を追加
- ハンドル部分のみでドラッグ操作を可能にし、テキスト編集を阻害しない設計

### 4. App.tsx の変更

#### 並び替えハンドラーの追加
- `handleReorderTestCases`: ドラッグ&ドロップによる並び替え処理
- 楽観的更新でUI即座更新
- `/api/testcases/reorder` エンドポイントへのAPI呼び出し

#### TestCaseTable への Props 追加
- `onReorder` プロパティを追加してコンポーネント間の通信を実現

## 技術的特徴

### 楽観的更新
- ドラッグ&ドロップ時に即座にUI更新
- API失敗時は自動的に元の状態に復旧

### アクセシビリティ
- キーボードセンサーによるキーボード操作対応
- ドラッグハンドルにtitle属性でツールチップ表示

### 既存機能との共存
- テキスト編集機能は維持
- Tab ナビゲーション機能は維持
- 自動テストケース追加機能は維持

## 操作方法

1. IDカラムの⋮⋮アイコンをクリック・ドラッグ
2. 目的の位置でドロップ
3. キーボード操作も対応（アクセシビリティ）

## バックエンド実装

### 1. データモデルの拡張 (types/index.ts)
- `TestCase` インターフェースに `order?: number` フィールドを追加
- 既存データとの互換性を保つためオプショナル

### 2. デフォルト値の追加 (constants/defaults.ts)
- `TEST_CASE_DEFAULTS.ORDER = 0` を追加

### 3. ストレージ機能の拡張 (utils/fileStorage.ts)
- `updateTestCasesOrder()` 関数を追加
- 複数テストケースの順序を一括更新

### 4. API エンドポイントの実装 (routes/testcases.ts)

#### GET /api/testcases の修正
- order フィールドでソート（降順対応）
- order が未設定の場合は createdAt でフォールバック

#### POST /api/testcases の修正
- 新規テストケースに自動的に適切な order 値を設定
- 同一プロジェクト内の最大 order + 1

#### PUT /api/testcases/reorder の追加
- リクエスト形式: `{ updates: [{id, order}], projectId }`
- バリデーション: updates配列とprojectIdの必須チェック
- エラーハンドリングと適切なレスポンス

### 5. 下位互換性
- 既存データの order フィールドが未設定でも正常動作
- 自動的に createdAt ベースでフォールバック

完全に実装済み。フロントエンドとバックエンド間でのドラッグ&ドロップ並び替え機能が動作可能。
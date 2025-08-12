# コピー・ペースト・Undo/Redo機能実装

## 実装方針

TestCaseTableに行のコピー・ペースト機能とUndo/Redo機能を追加。コピーはTSV形式でクリップボードに保存し、ペースト時は貼り付け位置から右方向に展開。範囲外データは無効化。Ctrl+Z/Ctrl+Yでの操作履歴管理も実装。

## 実装内容

### 1. 定数の追加 (ui.ts)

#### ボタン定数
- `COPY`, `PASTE`, `UNDO`, `REDO`: 各機能のボタンテキスト

#### クリップボード関連定数
- `TSV_SEPARATOR`: タブ文字（'\t'）
- `ROW_SEPARATOR`: 改行文字（'\n'）
- `FIELDS`: フィールド順序配列（specification, preconditions, steps, verification）

#### 履歴関連定数
- `MAX_HISTORY_SIZE`: 履歴保存上限数（50）

### 2. カスタムフックの作成

#### useClipboard.ts
- `copyRowToTSV()`: テストケース行をTSV形式でクリップボードにコピー
- `pasteFromTSV()`: クリップボードからTSVデータを取得・パース
- 4フィールド（specification, preconditions, steps, verification）に対応

#### useUndoRedo.ts
- `HistoryState<T>`: タイムスタンプ付き履歴状態
- `pushHistory()`: 新しい状態を履歴に追加
- `undo()`, `redo()`: 前後の状態に移動
- `canUndo`, `canRedo`: 操作可能性の判定
- 履歴サイズ制限とインデックス管理

### 3. TestCaseTableコンポーネントの機能拡張

#### 新機能の統合
- クリップボード・履歴管理フックの導入
- 履歴自動更新：testCases変更時に自動でpushHistory

#### コピー機能
- 各行に📋ボタンを追加
- `handleCopyRow()`: テストケース行をTSV形式でクリップボードにコピー
- SortableTestCaseRowにonCopyRowプロパティ追加

#### ペースト機能
- `handlePaste()`: 指定セルからTSVデータを右方向に展開
- 範囲外フィールドは自動的に無効化
- 貼り付け後、自動的に保存処理を実行

#### Undo/Redo機能
- ヘッダーに↶↷ボタンを追加
- `handleUndoRedo()`: undo/redo実行とonReorder呼び出し
- ボタンの有効/無効状態をcanUndo/canRedoで制御

#### キーボードショートカット
- `Ctrl+Z`: Undo実行
- `Ctrl+Y` / `Ctrl+Shift+Z`: Redo実行
- `Ctrl+V`: 現在編集中セルから貼り付け
- 既存のCtrl+Enter, Tab, Escapeは維持

### 4. UI改善

#### アクションボタンの拡張
- 削除ボタンに加えコピーボタンを追加
- flexレイアウトで2つのボタンを横並び配置

#### Undo/Redoボタン
- ヘッダー右側に追加ボタンとして配置
- 無効時はグレーアウト・カーソル無効化
- ツールチップでショートカットキー表示

## 技術的特徴

### クリップボード統合
- Navigator Clipboard API使用
- TSV形式での標準的なデータ交換
- 非同期処理でのエラーハンドリング

### 履歴管理
- Generic型対応でTestCase[]以外も拡張可能
- タイムスタンプ付きで時系列管理
- メモリ効率を考慮した履歴サイズ制限

### 既存機能との互換性
- ドラッグ&ドロップ、Tab navigation、自動テストケース追加は全て維持
- 編集モードでのキーボード操作にUndoRedoを統合

## 操作方法

### コピー・ペースト
1. 📋ボタンクリックで行をTSV形式でコピー
2. 編集モードでCtrl+V または セル外で右クリック→ペースト
3. 貼り付け位置から右方向にフィールド展開（範囲外は無効）

### Undo/Redo
1. ↶↷ボタンクリック または Ctrl+Z/Ctrl+Y
2. 最大50履歴まで保存・遡行可能
3. 変更があるたび自動的に履歴に追加

実装完了。TSV形式でのコピー・ペーストとUndo/Redo機能が利用可能。
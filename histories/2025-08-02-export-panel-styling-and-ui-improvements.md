# エクスポートパネルのTailwind CSS移行とUI改善

## 実装方針

エクスポートパネルのスタイルをTailwind CSSで書き直し、UIの一貫性を向上させる。
また、ユーザーリクエストに応じてテストケースヘッダーにプロジェクトIDとテストケース数を表示する。

## 実装内容

### 1. ExportPanel Tailwind CSS移行
- 既存のCSSクラス（`btn`、`modal-overlay`、`modal-content`など）をTailwind CSSクラスに置換
- レスポンシブデザイン対応（`max-w-md`、`max-h-[80vh]`）
- ホバー効果とトランジション追加
- アクセシビリティ改善（`focus:ring-2`、`disabled:opacity-50`）

### 2. バックエンド定数ファイル修正
- TypeScript構文（`as const`）をJavaScriptファイルから削除
- ESモジュール形式を維持しながらNode.js互換性確保

### 3. TestCaseTableヘッダー改善
- "テストケース"タイトルの横にプロジェクトIDとテストケース数を表示
- レイアウト調整（`flex`、`gap-4`）
- 一貫性のあるスタイリング

### 4. TypeScript型エラー修正
- 日付ソート処理での型安全性向上（`.getTime()`使用）
- 未使用インポート整理

## 技術的詳細

- Tailwind CSS v3使用（v4での互換性問題回避）
- 定数ファイルからのインポート活用
- 楽観的更新パターン維持
- アクセシビリティ配慮

## 結果

- エクスポートパネルの見た目がアプリケーション全体と統一
- ユーザビリティ向上（プロジェクト情報の可視化）
- 全lintチェック通過
- TypeScript型安全性確保
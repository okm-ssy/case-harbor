# Tailwind CSS v4移行とバックエンド自動テスト実装

## 実装方針

1. **Tailwind CSS v4導入**: 既存CSSからTailwindクラスベースのスタイリングに移行
2. **バックエンド自動テスト追加**: JestとSupertestを使用して20件のテストを実装
3. **定数の一元管理**: バックエンドのマジックナンバーと文字列を constants に移行

## 実装内容

### 1. Tailwind CSS v4移行

#### 新規・変更ファイル
- `frontend/vite.config.ts` - Tailwind Viteプラグイン追加
- `frontend/src/index.css` - Tailwind import追加
- `frontend/src/App.tsx` - Tailwindクラスでスタイリング
- `frontend/src/components/TestCaseTable.tsx` - テーブルとセルのTailwindスタイル
- `frontend/src/components/Sidebar.tsx` - サイドバーのTailwindスタイル  
- `frontend/src/components/ProjectSelector.tsx` - フォームのTailwindスタイル
- `frontend/src/App.css` - 削除（既存CSS不要に）

#### 主な変更点
- ダークテーマ（gray-800, gray-900系）でモダンなデザイン
- ホバーエフェクトやトランジションを追加
- レスポンシブ対応のTailwindクラス使用
- 編集可能セルの視覚的改善

### 2. バックエンド自動テスト追加

#### 新規作成ファイル
- `backend/tests/testcases.test.js` - テストケースAPI用20件のテスト
- `backend/tests/projects.test.js` - プロジェクトAPI用10件のテスト
- `backend/package.json` - Jest設定とテストスクリプト追加

#### テスト内容
**TestCases API (20件):**
- 基本CRUD操作（作成、取得、更新、削除）
- エラーハンドリング（404、500エラー）
- プロジェクトIDフィルタリング
- タグ配列処理
- 部分更新とデフォルト値
- Unicode文字処理
- 大量データ処理
- JSON構造妥当性確認

**Projects API (10件):**
- プロジェクトCRUD操作
- 重複名前処理
- 長い文字列処理
- バリデーション確認

### 3. バックエンド定数移行

#### 新規作成ファイル
- `backend/src/constants/http.js` - HTTPステータス、メソッド、ヘッダー
- `backend/src/constants/messages.js` - エラー・成功・ログメッセージ
- `backend/src/constants/defaults.js` - デフォルト値、制限値、フォーマット

#### 変更ファイル
- `backend/src/routes/testcases.js` - 定数インポートと使用
- `backend/src/routes/projects.js` - 定数インポートと使用

これにより、フロントエンドの見た目が現代的になり、バックエンドの品質と保守性が大幅に向上した。
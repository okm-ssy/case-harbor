# titleフィールド削除とprojectID解決機能の実装

## 実装方針
テストケースからtitleフィールドを削除し、MCPサーバーでプロジェクト名からプロジェクトIDへの自動解決機能を実装する。

## 問題
1. **フロントエンドでテストケースが表示されない**
   - MCPサーバーがプロジェクト名（`"crm-test"`）を使用
   - フロントエンドがプロジェクトID（UUID）を期待
   
2. **titleフィールドが不要**
   - ユーザーからtitleフィールドが不要との要求

## 実装内容

### MCPサーバーの改善
1. **プロジェクトID解決機能**
   - `resolveProjectId`メソッドを追加
   - プロジェクト名をUUIDに自動変換
   - UUID形式の場合はそのまま使用

2. **titleフィールド削除**
   - 型定義からtitle削除
   - ツール定義更新（titleパラメータ削除）
   - ストレージ処理からtitle削除
   - 表示ロジック更新

### フロントエンドの改善
1. **型定義更新**
   - TestCase interfaceからtitle削除
   
2. **UI調整**
   - 仕様欄の幅を30% → 20%に縮小
   - 手順欄の幅を30% → 35%に拡大
   - ExportPanelでtitle → idに変更

3. **TypeScriptエラー修正**
   - title参照箇所を削除・修正

### データ修正
- 既存テストケースファイルの修正
  - projectIdを`"crm-test"` → `"4ea7d93c-d9dc-4791-b192-6e8e3e81dde3"`に修正
  - titleフィールドを削除

## 変更ファイル
- `mcp-server/src/types.ts`: title削除、プロジェクトID解決
- `mcp-server/src/storage.ts`: resolveProjectId実装、title削除
- `mcp-server/src/index.ts`: ツール定義・実装更新
- `frontend/src/types.ts`: title削除
- `frontend/src/components/TestCaseTable.tsx`: title削除、幅調整
- `frontend/src/components/ExportPanel.tsx`: title → id変更
- `data/testcases/tc-*.json`: データ修正

## 効果
- MCPサーバーで作成したテストケースがフロントエンドで正常表示
- プロジェクト名での指定が可能（自動でUUIDに変換）
- UIがよりコンパクトで使いやすく
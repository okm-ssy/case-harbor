# プロジェクトIDと名前の統一

## 実装方針

プロジェクトIDとプロジェクト名が重複していた構造を簡素化し、IDを単一の識別子として使用するように変更。

## 実装内容

### 修正対象
- 型定義：`frontend/src/types.ts`, `mcp-server/src/types.ts`, `backend/src/types/index.ts`
- バックエンド：`backend/src/routes/projects.ts`, `backend/src/constants/defaults.ts`
- フロントエンド：`frontend/src/components/ProjectSelector.tsx`, `frontend/src/App.tsx`
- MCPサーバー：`mcp-server/src/index.ts`, `mcp-server/src/storage.ts`
- データファイル：全プロジェクトJSONファイル

### 変更内容

1. **型定義の修正**
   - `Project`インターフェースから`name`フィールドを削除
   - `id`フィールドのみを使用して識別とタイトル表示を行う

2. **API修正**
   - プロジェクト作成時に`name`パラメータを削除
   - デフォルト値定数から`PROJECT_NAME_MAX_LENGTH`を削除

3. **フロントエンド修正**
   - プロジェクトセレクターでIDのみを表示
   - プロジェクト作成フォームからname入力フィールドを削除
   - `getProjectName`関数を簡素化してIDをそのまま返す

4. **MCPサーバー修正**
   - プロジェクト作成・表示でnameフィールドを使用しない
   - `toggleProject`メソッドからnameパラメータを削除

5. **既存データ修正**
   - 全プロジェクトJSONファイルから`name`フィールドを削除

これにより、プロジェクトIDとプロジェクト名の重複が解消され、シンプルで一貫性のある構造になる。
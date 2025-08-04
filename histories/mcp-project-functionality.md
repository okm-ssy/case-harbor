# MCPサーバーにプロジェクト機能を追加

## 実装方針
既存のMCPサーバーにプロジェクト管理機能を追加し、プロジェクト単位でテストケースを管理できるようにする。

## 実装内容

### 新機能
1. **プロジェクト一覧取得** (`list_projects`) - 全プロジェクトの表示
2. **プロジェクト作成/削除** (`toggle_project`) - プロジェクトID指定で作成または削除
3. **プロジェクト指定テストケース作成** - `create_test_case`にprojectIdパラメータ追加
4. **プロジェクト指定テストケース一覧** - `list_test_cases`にprojectIdフィルタ追加
5. **プロジェクト指定テストケース取得/削除** - projectIdによる検証機能付き

### 変更ファイル
- `mcp-server/src/types.ts`: プロジェクト型定義とテストケースにprojectId追加
- `mcp-server/src/storage.ts`: プロジェクト管理メソッド群とストレージディレクトリ分離
- `mcp-server/src/index.ts`: 新ツール定義と実装

### データ構造
- プロジェクト: `data/projects/{id}.json`
- テストケース: `data/testcases/{id}.json` (projectIdフィールド付き)
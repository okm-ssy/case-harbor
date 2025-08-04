# データ保存先の統一とGit管理の改善

## 実装方針
MCPサーバー、バックエンド、フロントエンドのデータ保存先を${REPOSITORY_ROOT}/dataに統一し、Gitでの管理を適切に設定する。

## 実装内容

### データ保存先の統一
1. **MCPサーバー** - 環境変数REPOSITORY_ROOTまたはprocess.cwd()から相対的に/dataを参照
2. **バックエンド** - 環境変数REPOSITORY_ROOTまたは相対パス`../../../`から/dataを参照  
3. **フロントエンド** - バックエンドAPI経由でデータアクセス（変更なし）

### Git管理の改善
- `.gitignore`を更新してdata/*をignore、`.gitkeep`ファイルのみtrack
- 各ディレクトリに`.gitkeep`ファイルを配置：
  - `data/.gitkeep`
  - `data/projects/.gitkeep` 
  - `data/testcases/.gitkeep`

## 変更ファイル
- `mcp-server/src/storage.ts`: REPOSITORY_ROOT環境変数対応
- `backend/src/utils/fileStorage.js`: REPOSITORY_ROOT環境変数対応
- `backend/src/utils/projectStorage.js`: REPOSITORY_ROOT環境変数対応
- `.gitignore`: data/*を除外、.gitkeepのみ追跡するよう設定
- `data/.gitkeep`: ディレクトリ構造保持用ファイル追加

## 効果
- 全コンポーネントが同一のデータディレクトリを参照
- 開発環境でのデータ共有が確実
- Gitリポジトリにデータファイルが含まれずディレクトリ構造は保持
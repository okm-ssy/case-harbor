# MCPサーバーによるCase Harborプロジェクト自動検出機能

## 実装方針
環境変数設定なしで、どこからMCPサーバーを実行してもCase Harborプロジェクトを自動検出し、適切なdata/ディレクトリにデータを保存する。

## 問題
- devcontainer外部から利用する際に環境変数設定が複雑
- プロジェクト場所が環境によって異なる
- 設定なしでシンプルに使いたい

## 実装内容

### 自動検出ロジック（3段階の優先度）
1. **環境変数優先** - `CASE_HARBOR_DATA_DIR` / `CASE_HARBOR_ROOT`
2. **自動検出** - プロジェクト特徴ファイルによる検出
3. **フォールバック** - MCPサーバー位置からの相対パス

### 検出方法
1. **MCPサーバー位置から** - `mcp-server/dist/` → `../../`
2. **カレントディレクトリから上向き検索** - 最大10階層まで
3. **共通プロジェクト場所** - `~/case-harbor`, `~/projects/case-harbor`, `/workspace`等

### プロジェクト判定条件
- `CLAUDE.md` (必須) - プロジェクト固有ファイル
- `cli/ch.sh` (必須) - Case Harbor特有のCLI
- `mcp-server/package.json` (必須) - MCPサーバー存在確認
- package.jsonまたはCLAUDE.mdに「case-harbor」キーワード

## 変更ファイル
- `mcp-server/src/storage.ts`: 自動検出ロジック実装
- `cli/mcp-build.sh`: 環境変数不要を明記

## 効果
- **設定不要** - 環境変数なしで即座に利用可能
- **クロス環境対応** - devcontainer内外、異なるOS間で一貫動作
- **エラー耐性** - 複数の検出方法でフォールバック
- **ユーザビリティ向上** - シンプルな1コマンド登録

## 使用例
```bash
# どこから実行しても自動でCase Harborを検出
claude mcp add case-harbor node /path/to/case-harbor/mcp-server/dist/index.js

# 他のプロジェクトから実行
cd ~/other-project
# ↑ Case Harborを自動検出してdata/に保存
```
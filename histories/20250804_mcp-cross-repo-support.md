# 他リポジトリからのMCPサーバー実行サポート

## 実装方針
他のプロジェクトからMCPサーバーを実行してもcase-harborプロジェクトのデータディレクトリを正しく参照できるように環境変数サポートを強化する。

## 問題
別のリポジトリからMCPサーバーを実行すると、相対パス計算が間違ったディレクトリを指してしまい、case-harbor/data/にテストケースが保存されない問題があった。

## 実装内容

### 環境変数優先度の実装
1. **CASE_HARBOR_DATA_DIR** - データディレクトリの直接指定（最優先）
2. **CASE_HARBOR_ROOT** - case-harborプロジェクトルートの指定
3. **相対パス計算** - MCP serverファイル位置からの推定（フォールバック）

### mcp-buildコマンドの改善
- 他プロジェクトからの実行例を追加
- 環境変数設定の具体例を表示

## 変更ファイル
- `mcp-server/src/storage.ts`: 3段階の優先度でデータディレクトリを決定
- `cli/mcp-build.sh`: 他プロジェクトからの実行手順を追加

## 使用例

**Case-Harborプロジェクト内から:**
```bash
claude mcp add case-harbor node /workspace/mcp-server/dist/index.js
```

**他のプロジェクトから:**
```bash
CASE_HARBOR_ROOT=/workspace claude mcp add case-harbor node /workspace/mcp-server/dist/index.js
```

## 効果
- どのプロジェクトからMCPサーバーを実行してもcase-harborのデータを正しく参照
- 環境変数による柔軟な設定サポート
- クロスプロジェクト開発での利便性向上
# Case Harbor

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

テストケースを効率的に管理できる現代的なWebアプリケーションです。

**なぜCase Harborなのか？**

確かにテストケースの単純な編集であればスプレッドシートで十分です。しかし、Case Harborの真価は**LLMとの構造化されたデータやり取り**にあります。MCPサーバーを通じてAIアシスタントがテストケースの文脈を理解し、以下のような高度な支援が可能になります：

- **テスト設計の自動生成**: 要求仕様からテストケースを自動作成
- **テストカバレッジ分析**: 不足している観点を洗い出し
- **品質向上提案**: 既存テストケースの改善案を提示
- **仕様書との整合性チェック**: 要求仕様とテストケースの齟齬を発見

単なるデータ管理ツールではなく、AIと協働するテスト設計プラットフォームとして機能します。

## 特徴

### 🤖 AI連携対応（MCP サーバー）

- **Claude Code との完全統合**: MCPサーバーを通じて、Claudeから直接テストケースを操作可能
- プロジェクトの作成、テストケースの追加・編集・削除をAIアシスタントに依頼できます
- 複雑なテスト設計や要求仕様の整理をAIがサポート

### 📊 効率的なテストケース管理

- **プロジェクトベース管理**: テストケースをプロジェクト単位で整理
- **インライン編集**: テーブル内で直接編集可能な直感的UI
- **ドラッグ&ドロップ並び替え**: テストケースの順序を直感的に変更
- **リアルタイム保存**: 入力と同時に自動保存される楽観的更新
- **キーボードナビゲーション**: Tab/Shift+Tab、Ctrl+Enterでの高速移動
- **動的ブラウザタイトル**: プロジェクトID表示で複数プロジェクトの管理が効率的

### 🔧 主な機能

- **テスト項目の管理**: 仕様、事前条件、手順、確認事項を体系的に記録
- **タグ機能**: テストケースの分類とフィルタリング
- **複数フォーマット対応**: JSON、CSV、Markdownでのエクスポート
- **レスポンシブデザイン**: デスクトップ・タブレット対応
- **TypeScript完全対応**: 型安全な開発環境

## アーキテクチャ

```
Case Harbor/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
├── mcp-server/        # MCP Protocol Server
├── bin/               # シェルスクリプト集
└── data/              # JSONファイル形式のデータストレージ
```

## セットアップ

### 前提条件

- Node.js 24.4.1
- npm または yarn

### CLIコマンドのセットアップ

`ch` コマンドを使用するために、binディレクトリにPATHを通します：

```bash
# ~/.bashrc または ~/.zshrc に追加
export PATH="$PATH:/path/to/case-harbor/bin"

# 設定を反映
source ~/.bashrc  # または source ~/.zshrc
```

## 使い方

### システムの起動

```bash
# 開発サーバーを起動（依存関係の自動インストール + フロントエンド + バックエンド）
ch run
```

- フロントエンド: http://localhost:5656
- バックエンド API: http://localhost:9696

### 基本操作

1. **プロジェクト作成**: サイドバーから新しいプロジェクトを作成
2. **テストケース追加**: 「追加」ボタンまたは最終行への入力で自動追加
3. **編集**: セルをクリックしてインライン編集
4. **並び替え**: IDカラムをドラッグ&ドロップしてテストケースの順序を変更
5. **ナビゲーション**: Tab/Shift+Tab、Ctrl+Enterで項目間移動
6. **エクスポート**: エクスポートパネルから形式を選択してダウンロード

## 開発コマンド

```bash
# コードエディタで開く
ch edit

# システムを起動
ch run

# コードの品質チェック（全コンポーネント）
ch lint

# バックエンドのテストを実行
ch test

# MCPサーバーをビルド
ch mcp-build
```

### 個別コンポーネントの操作

```bash
# フロントエンド開発サーバー
cd frontend && npm run dev

# バックエンド開発サーバー
cd backend && npm run dev

# MCPサーバーの開発
cd mcp-server && npm run dev
```

## MCP Server 連携

Claude Code と連携して、AIアシスタントからテストケースを直接操作できます。

### セットアップ

1. MCPサーバーをビルド：
   ```bash
   ch mcp-build
   ```

2. Claude Desktop に MCP サーバーを追加：
   ```bash
   claude mcp add case-harbor node /path/to/case-harbor/mcp-server/dist/index.js --env REPOSITORY_ROOT=/path/to/case-harbor
   ```

### AI アシスタントでの利用例

```
「新しいプロジェクト『ユーザー認証機能』を作成して、
ログイン、ログアウト、パスワードリセットのテストケースを追加してください」

「既存のテストケースをレビューして、不足している観点があれば追加してください」
```

## データ形式

### プロジェクト

```json
{
  "id": "uuid",
  "name": "プロジェクト名",
  "description": "説明",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### テストケース

```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "specification": "仕様・要求事項",
  "preconditions": "事前条件",
  "steps": "実行手順",
  "verification": "確認事項",
  "tags": ["tag1", "tag2"],
  "order": 0,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## API エンドポイント

### プロジェクト

- `GET /api/projects` - 全プロジェクト取得
- `GET /api/projects/:id` - プロジェクト詳細取得
- `POST /api/projects` - プロジェクト作成
- `PUT /api/projects/:id` - プロジェクト更新
- `DELETE /api/projects/:id` - プロジェクト削除

### テストケース

- `GET /api/testcases?projectId=:id` - プロジェクトのテストケース取得（order順でソート）
- `GET /api/testcases/:id` - テストケース詳細取得
- `POST /api/testcases` - テストケース作成
- `PUT /api/testcases/:id` - テストケース更新
- `PUT /api/testcases/reorder` - テストケース順序変更
- `DELETE /api/testcases/:id` - テストケース削除

### エクスポート

- `POST /api/export/json` - JSON形式でエクスポート
- `POST /api/export/csv` - CSV形式でエクスポート
- `POST /api/export/markdown` - Markdown形式でエクスポート

## トラブルシューティング

### ポートが使用中の場合

```bash
# プロセスを確認
lsof -i :5656  # フロントエンド
lsof -i :9696  # バックエンド

# プロセスを終了
kill -9 <PID>
```

### MCPサーバーが動作しない場合

1. ビルドが完了しているか確認：
   ```bash
   cd mcp-server && npm run build
   ```

2. Claude Desktop の設定パスが正しいか確認
3. Node.js のバージョンが対応しているか確認

### データが保存されない場合

- バックエンド API サーバーが起動しているか確認
- `data/` ディレクトリの書き込み権限を確認
- ブラウザの Developer Tools でネットワークエラーを確認

## 貢献

プルリクエストや Issue の報告を歓迎します。

### 開発時の注意点

- コミット前に `ch lint` でコードスタイルを確認
- `ch test` でテストを実行
- TypeScript の型エラーを解決してからコミット

## ライセンス

このプロジェクトのライセンス情報については、`LICENSE` ファイルを参照してください。

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Tailwind CSS, Vite, @dnd-kit (ドラッグ&ドロップ)
- **バックエンド**: Node.js, Express, TypeScript
- **データストレージ**: JSON ファイル
- **MCP サーバー**: Model Context Protocol
- **開発ツール**: ESLint, Jest, Claude Code Integration
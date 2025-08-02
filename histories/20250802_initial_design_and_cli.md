# CaseHarbor 初期設計とCLI実装

## 実装方針

個人用のテストケース管理ツールとして、以下の方針で設計・実装を行いました：

1. **シンプルな構成**: DBを使わずローカルファイルで管理
2. **Claude Code連携**: MCPサーバー経由でテストケースを保存
3. **エクスポート機能**: JSON、CSV、Excel等への変換

## 実装内容

### 1. 設計書の作成 (design.md)

#### 技術スタック
- Frontend: React + TypeScript
- Backend: Node.js + Express.js
- Storage: ローカルファイルシステム（JSON）
- Build: Vite

#### 主要機能
- MCPサーバー連携によるテストケース保存
- ファイルベースのデータ管理
- 各種形式へのエクスポート機能

### 2. CLIコマンドの実装

taskgraph-editorのCLI構造を参考に、`ch`コマンドを実装：

```
bin/
└── ch              # エントリポイント
cli/
├── ch.sh           # コマンドディスパッチャー
├── lint.sh         # lint実行
├── run.sh          # システム起動
└── mcp-build.sh    # MCPビルド
```

#### コマンド一覧
- `ch lint`: 全コンポーネントのlint実行
- `ch run`: システム起動（フロントエンド＋バックエンド）
- `ch mcp-build`: MCPサーバーのビルド

#### 特徴
- プロセス管理（バックグラウンド実行、Ctrl+Cで一括停止）
- 未セットアップ時の親切な警告メッセージ
- MCP設定例の自動表示

## 次のステップ

1. Backend API実装（Express.js）
2. Frontend実装（React）
3. MCPサーバー実装
4. エクスポート機能の実装

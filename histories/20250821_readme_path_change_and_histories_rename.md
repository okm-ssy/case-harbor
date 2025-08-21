# README.mdのパス変更とhistoriesディレクトリのファイル名整理

## 実装方針
1. README.mdの`cli`ディレクトリへの参照を`bin`に変更
2. historiesディレクトリのファイル名にyyyymmdd形式の日付プレフィックスを追加

## 実装内容
### README.md更新
- アーキテクチャ図のディレクトリ表記を`cli/`から`bin/`に変更
- CLIコマンドセットアップ説明を`CLIディレクトリ`から`binディレクトリ`に変更  
- PATHの例を`/path/to/case-harbor/cli`から`/path/to/case-harbor/bin`に変更

### historiesディレクトリ整理
- 全ファイルにyyyymmdd形式の作成日プレフィックスを追加
- 既存の日付形式（2025-08-02-）を統一形式（20250802_）に変換
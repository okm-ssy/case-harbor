#!/bin/sh

# CaseHarbor 自動テスト実行スクリプト
# 目的: バックエンドの自動テストを実行してコードの品質を確認

set -e

# 色付きログ出力用の関数
log_info() {
  echo "\033[34m[INFO]\033[0m $1"
}

log_success() {
  echo "\033[32m[SUCCESS]\033[0m $1"
}

log_error() {
  echo "\033[31m[ERROR]\033[0m $1"
}

log_warning() {
  echo "\033[33m[WARNING]\033[0m $1"
}

# リポジトリルートを取得
repository_root="${REPOSITORY_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

log_info "CaseHarbor自動テスト実行を開始します..."

# バックエンドディレクトリの存在確認
backend_dir="${repository_root}/backend"
if [ ! -d "$backend_dir" ]; then
  log_error "バックエンドディレクトリが見つかりません: $backend_dir"
  exit 1
fi

# package.jsonの存在確認
if [ ! -f "$backend_dir/package.json" ]; then
  log_error "package.jsonが見つかりません: $backend_dir/package.json"
  exit 1
fi

# バックエンドディレクトリに移動
cd "$backend_dir"

# Node.jsとnpmの存在確認
if ! command -v node > /dev/null 2>&1; then
  log_error "Node.jsがインストールされていません"
  exit 1
fi

if ! command -v npm > /dev/null 2>&1; then
  log_error "npmがインストールされていません"
  exit 1
fi

# 依存関係のインストール確認（node_modulesが存在しない場合）
if [ ! -d "node_modules" ]; then
  log_warning "依存関係がインストールされていません。npm installを実行します..."
  npm install
fi

# Jestとsupertestの存在確認
log_info "テスト用パッケージの存在を確認しています..."
if ! npm list jest > /dev/null 2>&1; then
  log_warning "Jestがインストールされていません。インストールします..."
  npm install --save-dev jest@^29.7.0
fi

if ! npm list supertest > /dev/null 2>&1; then
  log_warning "Supertestがインストールされていません。インストールします..."
  npm install --save-dev supertest@^6.3.3
fi

# テストディレクトリの存在確認
if [ ! -d "tests" ]; then
  log_error "testsディレクトリが見つかりません: $backend_dir/tests"
  log_error "自動テストファイルが存在しません"
  exit 1
fi

# テストファイルの存在確認
test_files_count=$(find tests -name "*.test.js" | wc -l)
if [ "$test_files_count" -eq 0 ]; then
  log_error "テストファイル（*.test.js）が見つかりません"
  exit 1
fi

log_info "テストファイル数: $test_files_count 件"

# 実際にテストを実行
log_info "自動テストを実行しています..."
echo "=================================="

# Jest設定の確認とテスト実行
if npm run test 2>&1; then
  echo "=================================="
  log_success "すべてのテストが正常に完了しました！"
  
  # テスト結果の簡易サマリーを表示
  log_info "テスト実行完了"
  log_info "詳細なカバレッジ情報を確認するには 'npm run test:coverage' を実行してください"
else
  echo "=================================="
  log_error "テストが失敗しました"
  log_error "上記のエラーメッセージを確認して問題を修正してください"
  exit 1
fi

log_success "ch test コマンドが正常に完了しました"
#!/bin/sh

set -eu

run() {
  echo "🚀 CaseHarbor 起動"
  echo "=================="

  # プロセスを管理するためのPIDファイル
  PID_DIR="${REPOSITORY_ROOT}/.pids"
  mkdir -p "$PID_DIR"

  # バックエンドサーバー起動
  if [ -d "${REPOSITORY_ROOT}/backend" ]; then
    echo ""
    echo "📦 バックエンドサーバー起動 (Port: 9696)"
    echo "---------------------------------------"
    cd "${REPOSITORY_ROOT}/backend"
    
    if [ -f "package.json" ]; then
      npm set progress=false
      npm i
      
      # 既存のプロセスを停止
      if [ -f "$PID_DIR/backend.pid" ]; then
        old_pid=$(cat "$PID_DIR/backend.pid")
        if kill -0 "$old_pid" 2>/dev/null; then
          echo "既存のバックエンドプロセス (PID: $old_pid) を停止します..."
          kill "$old_pid"
          sleep 1
        fi
      fi
      
      # バックエンドを起動（バックグラウンド）
      echo "🔧 バックエンドサーバーを起動しています..."
      npm run dev > "${REPOSITORY_ROOT}/backend.log" 2>&1 &
      backend_pid=$!
      echo $backend_pid > "$PID_DIR/backend.pid"
      echo "✅ バックエンドサーバー起動 (PID: $backend_pid)"
    else
      echo "⚠️  バックエンドがまだセットアップされていません"
      echo "   backend/ディレクトリにpackage.jsonを作成してください"
    fi
  else
    echo "⚠️  backendディレクトリが存在しません"
  fi

  # フロントエンドサーバー起動
  if [ -d "${REPOSITORY_ROOT}/frontend" ]; then
    echo ""
    echo "📦 フロントエンドサーバー起動 (Port: 5656)"
    echo "-----------------------------------------"
    cd "${REPOSITORY_ROOT}/frontend"
    
    if [ -f "package.json" ]; then
      npm set progress=false
      npm i
      
      echo "🔧 フロントエンドサーバーを起動しています..."
      echo ""
      echo "================================"
      echo "🌐 アプリケーション URL:"
      echo "   http://localhost:5656"
      echo "================================"
      echo ""
      echo "終了するには Ctrl+C を押してください"
      echo ""
      
      # フロントエンドを起動（フォアグラウンド）
      npm run dev
    else
      echo "⚠️  フロントエンドがまだセットアップされていません"
      echo "   frontend/ディレクトリにpackage.jsonを作成してください"
    fi
  else
    echo "⚠️  frontendディレクトリが存在しません"
  fi
}

# 終了時のクリーンアップ
cleanup() {
  echo ""
  echo "🛑 CaseHarborを停止しています..."
  
  PID_DIR="${REPOSITORY_ROOT}/.pids"
  
  # バックエンドプロセスを停止
  if [ -f "$PID_DIR/backend.pid" ]; then
    backend_pid=$(cat "$PID_DIR/backend.pid")
    if kill -0 "$backend_pid" 2>/dev/null; then
      kill "$backend_pid"
      echo "✅ バックエンドサーバーを停止しました (PID: $backend_pid)"
    fi
    rm -f "$PID_DIR/backend.pid"
  fi
  
  echo "👋 CaseHarborを終了しました"
  exit 0
}

# Ctrl+Cでのクリーンアップを設定
trap cleanup INT TERM

run "$@"
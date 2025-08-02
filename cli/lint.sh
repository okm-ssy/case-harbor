#!/bin/sh

set -eu

lint() {
  echo "🧪 CaseHarbor Lint"
  echo "=================="

  # フロントエンドのlint
  if [ -d "${REPOSITORY_ROOT}/frontend" ]; then
    echo ""
    echo "📦 フロントエンド (React + TypeScript)"
    echo "-------------------------------------"
    cd "${REPOSITORY_ROOT}/frontend"
    
    if [ -f "package.json" ]; then
      npm set progress=false
      npm i
      
      echo "🔧 ESLint実行..."
      npm run lint || echo "⚠️  フロントエンドのlintに失敗しました"
      
      echo "🔧 TypeScript型チェック..."
      npm run type-check || echo "⚠️  TypeScriptの型チェックに失敗しました"
    else
      echo "⚠️  フロントエンドがまだセットアップされていません"
    fi
  fi

  # バックエンドのlint
  if [ -d "${REPOSITORY_ROOT}/backend" ]; then
    echo ""
    echo "📦 バックエンド (Node.js + Express)"
    echo "-----------------------------------"
    cd "${REPOSITORY_ROOT}/backend"
    
    if [ -f "package.json" ]; then
      npm set progress=false
      npm i
      
      echo "🔧 ESLint実行..."
      npm run lint || echo "⚠️  バックエンドのlintに失敗しました"
    else
      echo "⚠️  バックエンドがまだセットアップされていません"
    fi
  fi

  # MCPサーバーのlint
  if [ -d "${REPOSITORY_ROOT}/mcp-server" ]; then
    echo ""
    echo "📦 MCPサーバー (TypeScript)"
    echo "---------------------------"
    cd "${REPOSITORY_ROOT}/mcp-server"
    
    if [ -f "package.json" ]; then
      npm set progress=false
      npm i
      
      echo "🔧 ESLint実行..."
      npm run lint || echo "⚠️  MCPサーバーのlintに失敗しました"
      
      echo "🔧 TypeScript型チェック..."
      npm run type-check || echo "⚠️  TypeScriptの型チェックに失敗しました"
    else
      echo "⚠️  MCPサーバーがまだセットアップされていません"
    fi
  fi

  echo ""
  echo "✅ Lint完了"
}

lint "$@"
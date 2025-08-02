#!/bin/sh

set -eu

mcp_build() {
  echo "🔨 MCP Server Build"
  echo "==================="

  if [ -d "${REPOSITORY_ROOT}/mcp-server" ]; then
    cd "${REPOSITORY_ROOT}/mcp-server"
    
    if [ -f "package.json" ]; then
      echo "📦 依存関係をインストール..."
      npm set progress=false
      npm i
      
      echo ""
      echo "🔧 TypeScriptをコンパイル..."
      npm run build
      
      echo ""
      echo "📋 ビルド結果:"
      if [ -d "dist" ]; then
        echo "✅ ビルド成功"
        echo ""
        echo "ビルドされたファイル:"
        find dist -type f -name "*.js" | sed 's/^/  - /'
        
        echo ""
        echo "📝 MCP設定例:"
        echo "-------------------"
        cat <<-CONFIG
{
  "mcpServers": {
    "case-harbor": {
      "command": "node",
      "args": ["${REPOSITORY_ROOT}/mcp-server/dist/index.js"],
      "env": {
        "CASE_HARBOR_DATA_DIR": "${REPOSITORY_ROOT}/data/testcases"
      }
    }
  }
}
CONFIG
      else
        echo "❌ ビルドに失敗しました"
        echo "   distディレクトリが作成されませんでした"
        exit 1
      fi
    else
      echo "⚠️  MCPサーバーがまだセットアップされていません"
      echo "   mcp-server/ディレクトリにpackage.jsonを作成してください"
      echo ""
      echo "📝 package.jsonの例:"
      cat <<-PACKAGE
{
  "name": "case-harbor-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for CaseHarbor test case management",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  }
}
PACKAGE
    fi
  else
    echo "⚠️  mcp-serverディレクトリが存在しません"
    echo "   以下のコマンドでディレクトリを作成してください:"
    echo "   mkdir -p ${REPOSITORY_ROOT}/mcp-server"
  fi
}

mcp_build "$@"
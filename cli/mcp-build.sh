#!/bin/sh

set -eu

mcp_build() {
  if [ -d "${REPOSITORY_ROOT}/mcp-server" ]; then
    cd "${REPOSITORY_ROOT}/mcp-server"
    
    if [ -f "package.json" ]; then
      npm set progress=false
      npm i
      
      npm run build
      
      echo ""
      echo "🎉 MCPサーバーのビルドが完了しました！"
      echo ""
      echo "📋 Claude Codeに登録するには以下のコマンドを実行してください："
      echo ""
      echo "■ Case-Harborプロジェクト内から実行する場合："
      echo "  claude mcp add case-harbor node ${REPOSITORY_ROOT}/mcp-server/dist/index.js"
      echo ""
      echo "■ 他のプロジェクトから実行する場合："
      echo "  CASE_HARBOR_ROOT=${REPOSITORY_ROOT} claude mcp add case-harbor node ${REPOSITORY_ROOT}/mcp-server/dist/index.js"
      echo ""
      echo "📋 登録確認："
      echo ""
      echo "  claude mcp list"
      echo ""
      echo "📋 削除したい場合："
      echo ""
      echo "  claude mcp remove case-harbor"
      echo ""
      echo "💡 Claude Codeで以下のように質問してテストできます："
      echo "   「テストケース一覧を表示して」"
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
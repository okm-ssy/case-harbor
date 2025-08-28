# 未使用パッケージの削除

## 実装方針
depcheckを使用して未使用パッケージを検出し、不要なものを削除

## 実装内容
- npx depcheck で各ディレクトリの未使用パッケージを検出
- バックエンドから以下のパッケージを削除：
  - @types/jest
  - @types/supertest 
  - @typescript-eslint/eslint-plugin
- フロントエンドのautoprefixer、postcss、tailwindcssはTailwind CSS動作に必要なため保持
- MCPサーバーには未使用パッケージなし

## 変更ファイル
- backend/package.json: 未使用のdevDependencies 3つを削除
- backend/package-lock.json: 関連する依存関係を更新
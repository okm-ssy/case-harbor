# バックエンドJavaScriptからTypeScript移行

## 実装方針
バックエンドの全JSファイルをTypeScriptに移行し、型安全性を向上させる

## 実装内容

### 1. 変換されたファイル一覧
- **メインファイル**: `src/index.js` → `src/index.ts`
- **定数ファイル**: 
  - `src/constants/http.js` → `src/constants/http.ts`
  - `src/constants/defaults.js` → `src/constants/defaults.ts`
  - `src/constants/messages.js` → `src/constants/messages.ts`
- **ユーティリティ**: 
  - `src/utils/fileStorage.js` → `src/utils/fileStorage.ts`
  - `src/utils/projectStorage.js` → `src/utils/projectStorage.ts`
- **ルート**: 
  - `src/routes/projects.js` → `src/routes/projects.ts`
  - `src/routes/testcases.js` → `src/routes/testcases.ts`
  - `src/routes/export.js` → `src/routes/export.ts`

### 2. 新規作成されたファイル
- **型定義**: `src/types/index.ts` - TestCase, Project, ApiResponseなどの共通型
- **TypeScript設定**: `tsconfig.json`
- **Git設定**: `.gitignore` (distフォルダ追加)

### 3. 型の改善点
- **as const** アサーションで定数オブジェクトを厳密に型付け
- **型定義**: TestCase, Project, ApiResponse, ExportFormatなどの明確な型
- **エラーハンドリング**: NodeErrorインターフェースでエラーオブジェクトを型付け
- **Express型**: Request, Response, NextFunctionの適切な型付け
- **HTTP定数**: HTTP_STATUSを使用してマジックナンバーを排除

### 4. 設定ファイル更新
- **package.json**: TypeScript依存関係とビルドスクリプト追加
- **ESLint**: TypeScript対応とルール追加
- **tsconfig.json**: 厳密な型チェック設定
- **型定義パッケージ**: @types/express, @types/nodeなど追加

### 5. ビルドシステム
- **開発**: `tsx watch`でホットリロード対応
- **ビルド**: `tsc`でJavaScriptにコンパイル
- **配布**: `dist/`フォルダに出力

## 利点
- **型安全性**: コンパイル時のエラー検出
- **IDE支援**: 自動補完と型チェック
- **保守性**: 明確な型定義による可読性向上
- **開発効率**: 型エラーによる早期バグ発見

## 変更ファイル
- `backend/src/` 配下の全JSファイル → TSファイル
- `backend/package.json`: 依存関係とスクリプト更新
- `backend/tsconfig.json`: TypeScript設定
- `backend/.eslintrc.json`: TypeScript対応
- `backend/.gitignore`: distフォルダ追加
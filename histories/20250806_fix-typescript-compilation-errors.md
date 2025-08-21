# TypeScript Compilation Errors Fix

## 実装方針

バックエンドコードのTypeScriptコンパイルエラーを最小限の変更で修正する。
特に以下の2つのエラータイプに対応：

1. "Not all code paths return a value" エラー
2. ExportFormat型の互換性エラー

## 実装内容

### 1. ExportFormat型の拡張 (`/workspace/backend/src/types/index.ts`)

```typescript
// 修正前
export type ExportFormat = 'json' | 'csv' | 'xml';

// 修正後  
export type ExportFormat = 'json' | 'csv' | 'xml' | 'markdown' | 'md';
```

`markdown`と`md`を型定義に追加し、export.tsでの使用との互換性を確保。

### 2. return文の追加 (`/workspace/backend/src/routes/projects.ts`)

全てのルートハンドラーで適切なreturn文を追加：

- GET `/` - 正常応答とエラー応答にreturn追加
- GET `/:id` - 正常応答とエラー応答にreturn追加  
- POST `/` - 正常応答とエラー応答にreturn追加
- PUT `/:id` - 正常応答とエラー応答にreturn追加
- DELETE `/:id` - 正常応答とエラー応答にreturn追加

### 3. return文の追加 (`/workspace/backend/src/routes/export.ts`)

- switch文の各caseにreturn文を追加
- catch文のエラー応答にreturn追加
- default caseにreturn追加

## 結果

- TypeScriptコンパイルエラー: 0件
- ESLintエラー: 0件
- 機能的変更: なし（純粋なTypeScript型修正）
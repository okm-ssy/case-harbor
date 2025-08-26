# TSVコピー時のセルをダブルクォートで囲む機能を追加

## 実装方針

TSVコピー機能を改善し、各セルをダブルクォートで囲むようにしてspreadsheetでの貼り付けを容易にする。

## 実装内容

### 変更ファイル
- `frontend/src/hooks/useClipboard.ts`

### 修正内容

1. **コピー処理の改善**
   - `copyRowToTSV`関数で各フィールドを`"${value}"`形式でダブルクォートで囲むように変更

2. **ペースト処理の改善**
   - `pasteFromTSV`関数でダブルクォートで囲まれた値を適切に処理
   - 先頭と末尾のダブルクォートを除去する処理を追加

### 変更詳細

**コピー処理**:
```typescript
.map(field => `"${testCase[field] || ''}"`)
```

**ペースト処理**:
```typescript
const value = values[i] || '';
result[i] = value.startsWith('"') && value.endsWith('"') 
  ? value.slice(1, -1) 
  : value;
```

これにより、Excelやその他のspreadsheetアプリケーションでの貼り付けが適切に動作する。
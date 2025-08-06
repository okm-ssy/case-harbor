# テストケース並び替えの永続化問題修正

## 問題

ドラッグ&ドロップで並び替えた後、リロードすると順番が元に戻ってしまう

## 原因

フロントエンドの `fetchTestCases` 関数で、バックエンドから取得したデータを `createdAt` で再ソートしていた。
バックエンドは `order` フィールドでソート済みのデータを返しているのに、フロントエンドで上書きしていた。

## 修正内容

### frontend/src/App.tsx

```typescript
// 修正前
const sortedData = data.sort((a: TestCase, b: TestCase) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
setTestCases(sortedData);

// 修正後
// バックエンドで既にソート済みなので、そのまま使用
setTestCases(data);
```

## 確認結果

- バックエンドの order フィールド保存: ✅ 正常に動作
- バックエンドのソート処理: ✅ order → createdAt の優先順位で実装済み
- フロントエンドの不要なソート: ❌ → ✅ 修正完了

## 結果

リロード後も並び替えた順番が維持されるようになった。
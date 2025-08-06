# ドラッグ&ドロップUX改善

## 改善内容

### 1. ドラッグ可能エリアの拡大
- **変更前**: 小さなドラッグハンドルボタンのみ
- **変更後**: IDカラム全体がドラッグ可能

### 2. IDカラムの幅拡大
- 5% (50px) → 7% (70px) に拡大
- ドラッグしやすいよう余裕を持たせた

### 3. 視覚的フィードバックの改善
- **ホバー効果**: IDカラムにホバー時の背景色変化
- **ドラッグオーバーレイ**: 青いボーダーとアイコンを追加
- **カーソル**: grab/grabbingカーソルで操作感を向上

## 実装詳細

### TestCaseTable.tsx
```jsx
// IDカラム全体をドラッグ可能に
<td 
  className="p-4 text-center border-b border-gray-600 align-top pt-6 text-gray-200 relative cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors duration-200"
  {...attributes}
  {...listeners}
  title="Drag to reorder"
>
```

### constants/ui.ts
```typescript
// カラム幅の調整
ID_CELL_WIDTH: '7%',
ID_CELL_MIN_WIDTH: '70px',
```

### ドラッグオーバーレイ
```jsx
<div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500">
  <div className="p-4 text-gray-200 flex items-center gap-3">
    <span className="text-blue-400 text-lg">⋮⋮</span>
    <span>テストケース #{index + 1}</span>
  </div>
</div>
```

## 結果
- ドラッグ操作がより直感的に
- 上下方向の操作範囲が拡大
- 視覚的フィードバックが向上
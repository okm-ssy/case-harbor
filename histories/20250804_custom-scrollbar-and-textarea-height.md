# カスタムスクロールバーとtextarea高さ調整

## 実装方針
スクロールバーを目立たない黒っぽいデザインにカスタマイズし、編集時のtextarea高さを表示時と同じに調整

## 実装内容

### 1. カスタムスクロールバーの実装
- **新規CSSクラス**: `custom-scrollbar`を追加
- **デザイン**: 
  - 幅: 6px（細め）
  - 色: rgba(156, 163, 175, 0.3)（半透明グレー）
  - ホバー時: rgba(156, 163, 175, 0.5)（少し濃く）
  - 背景: transparent
- **対応ブラウザ**:
  - Webkit系（Chrome, Safari, Edge）: `::-webkit-scrollbar`
  - Firefox: `scrollbar-width: thin`

### 2. textarea高さの調整
- **min-height**: 6rem → 7.5rem
- 表示時のセル高さ（7.5rem）と同じ高さに設定
- 編集モード切り替え時の視覚的な違和感を解消

### 3. 適用箇所
- テストケースのセル表示部分（overflow-y-auto）
- 編集時のtextarea

## 変更ファイル
- `frontend/src/index.css`: カスタムスクロールバーのスタイル定義
- `frontend/src/components/TestCaseTable.tsx`: custom-scrollbarクラスの適用
- `frontend/src/constants/ui.ts`: TEXTAREA_MIN_HEIGHT定数の更新
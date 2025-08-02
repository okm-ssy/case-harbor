# IDと削除ボタンのセル位置調整

## 実装方針

IDセルと削除ボタンセルの上余白を調整して、仕様内容などの編集可能セルと高さを揃える。

## 実装内容

### 変更ファイル
- `frontend/src/App.css`

### 修正詳細

1. **IDセル（.id-cell）の調整**
   - `vertical-align: bottom` → `vertical-align: top` に変更
   - `padding-top: 1.5rem` を追加

2. **削除ボタンセル（.actions-cell）の調整**
   - `vertical-align: bottom` → `vertical-align: top` に変更
   - `padding-top: 1.5rem` を追加

これにより、IDと削除ボタンが仕様内容などの編集可能セルと同じ高さ位置に配置され、テーブル全体の見た目が統一された。
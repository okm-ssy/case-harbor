# サイドバーリサイズ機能の削除

## 実装方針

サイドバー開閉時の二段階アニメーション問題を解決するため、リサイズ機能を削除し固定幅に変更した。

## 実装内容

### Sidebar.tsx の修正

1. **リサイズ関連のstate削除**
   - `sidebarWidth` state削除
   - `isResizing` state削除
   - `useEffect` でのマウスイベント処理削除
   - `handleResizeStart` 関数削除

2. **リサイザー要素の削除**
   - `sidebar-resizer` 要素を完全に削除

3. **import文の整理**
   - `useEffect` のインポートを削除

### CSS の修正

1. **固定幅の適用**
   - `min-width`, `max-width` → `width: 320px` に変更
   - `.collapsed` クラスでは `width: 40px` 固定

## 修正された問題

- 開閉時の二段階アニメーション解決
- 滑らかな単一トランジション実現
- 不要なリサイズ機能削除でシンプル化
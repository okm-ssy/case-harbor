# テーブルヘッダーのsticky修正

## 実装方針
テーブルヘッダーを画面スクロールに対してもstickyに動作するよう修正

## 実装内容

### 1. sticky設定の最適化
- **thead**: `z-20`に変更し、`bg-gray-800`を明示的に設定
- **各th**: 重複していた`sticky top-0 z-10`を削除（theadで制御）
- **理由**: 親要素のtheadでsticky制御を統一し、z-indexの競合を回避

### 2. テーブルコンテナの高さ制限
- **overflow設定**: `overflow-x-auto`に加えて`max-h-[80vh] overflow-y-auto`を追加
- **効果**: テーブル自体がスクロール可能になり、ヘッダーが正しくstickyに動作
- **高さ制限**: 画面の80%に制限してスクロールを発生させる

### 3. スタイルの簡略化
- 各thから冗長なsticky設定を削除
- theadレベルでの制御に統一

## 変更ファイル
- `frontend/src/components/TestCaseTable.tsx`: テーブルヘッダーのsticky設定とコンテナの高さ制限
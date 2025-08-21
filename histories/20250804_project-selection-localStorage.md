# プロジェクト選択状態のlocalStorage保存機能実装

## 実装方針
プロジェクト選択状態をlocalStorageに保存し、ページリロード時に最後に選択していたプロジェクトを自動復元する機能を実装する。

## 実装内容

### 1. LocalStorage用定数の追加
- `STORAGE_CONSTANTS.KEYS.SELECTED_PROJECT_ID`を追加
- プロジェクトIDを保存するキー名を定義

### 2. App.tsxの修正
1. **初期化時の復元処理**
   - useEffectでlocalStorageからプロジェクトIDを読み取り
   - 保存されていた場合は自動選択

2. **プロジェクト変更時の保存処理**
   - Sidebarのコールバック関数を修正
   - プロジェクト選択時にlocalStorageに保存

3. **不要なtitleフィールド削除**
   - 新規テストケース作成時のtitleプロパティを削除

## 変更ファイル
- `frontend/src/constants/ui.ts`: STORAGE_CONSTANTS追加
- `frontend/src/App.tsx`: localStorage処理追加、titleフィールド削除

## 効果
- 初回表示時にプロジェクトがlocalStorageに保存される
- ページリロード時に最後に開いていたプロジェクトが自動選択される
- ユーザビリティが向上し、作業継続性が改善される
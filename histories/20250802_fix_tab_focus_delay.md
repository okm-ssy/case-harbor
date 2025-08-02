# Tab移動時のフォーカス遅延問題の修正

## 問題

Tab移動時にフォーカスが移動するが、その後`onBlur`イベントと`setTimeout`の競合により編集モードが終了してしまう問題があった。

## 実装方針

`isTabNavigating`フラグを導入してTab移動中は`onBlur`イベントを無効化し、スムーズなフィールド移動を実現する。

## 実装内容

### TestCaseTable.tsx の修正

1. **フラグの追加**
   - `isTabNavigating` stateを追加
   - Tab移動中かどうかを管理

2. **Tab処理の改善**
   - `setTimeout`を削除
   - 直接的なフィールド移動を実装
   - Tab移動中はフラグをtrueに設定

3. **onBlurイベントの制御**
   - `onBlur={() => !isTabNavigating && saveEdit()}`
   - Tab移動中は`onBlur`を無効化

4. **型安全性の向上**
   - パラメータ名を`currentTestCase`に変更
   - undefinedチェックを追加

## 結果

- Tab移動時にフォーカスが途切れない
- スムーズなフィールド間移動
- 編集内容の自動保存は維持
- 型安全性が向上
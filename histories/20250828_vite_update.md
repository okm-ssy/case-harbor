# Viteバージョンアップデート

## 実装方針
Viteを現行の5.0.8から最新バージョンの5.4.19にアップデート

## 実装内容
- frontend/package.json の vite を ^5.0.8 から ^5.4.19 に更新
- npm update vite --save コマンドで最新バージョンに更新
- 依存関係の整合性を確認
- lint実行でエラーがないことを確認

## 変更ファイル
- frontend/package.json: viteバージョンを5.4.19に更新
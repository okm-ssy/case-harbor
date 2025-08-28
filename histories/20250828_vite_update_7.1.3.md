# Vite 7.1.3へのアップデート

## 実装方針
Viteを5.4.19から7.1.3へアップデート

## 実装内容
- npm install vite@7.1.3 --save-dev でVite 7.1.3を指定インストール
- 依存関係の整合性を確認
- lint実行でエラーがないことを確認

## 変更ファイル
- frontend/package.json: viteバージョンを7.1.3に更新
- frontend/package-lock.json: 関連する依存関係を更新
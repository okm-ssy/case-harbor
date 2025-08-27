# ストレージディレクトリ名の変更

## 実装方針
新しいプロジェクトベースのファイル構造で使用するディレクトリ名を `storage` から `data` に変更。

## 実装内容

1. projectFileStorage.ts の変更
   - `STORAGE_DIR` を `DATA_DIR` に変更
   - `ensureStorageDir()` を `ensureDataDir()` に変更
   - 全ての関数で新しい名前を使用

2. storageAdapter.ts の更新
   - 新しい関数名 `ensureDataDir()` を参照

3. migrate.ts の更新
   - import と関数呼び出しを更新

4. ディレクトリ構造の移動
   - `storage/` の内容を `data/` に移動
   - `data/test-cases/` にプロジェクトごとのJSONファイル
   - `data/projects.json` にプロジェクトインデックス

## 結果
- 既存の `data` ディレクトリと統一された構造
- APIは正常に動作し、27件のテストケースを正しく返す
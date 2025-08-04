# localStorage値上書き問題の修正

## 問題
ProjectSelectorの`fetchProjects`関数内で、プロジェクトが選択されていない場合に常に最初のプロジェクトを自動選択する処理があり、localStorage に保存された値が開き直すたびに上書きされてしまっていた。

## 実装方針
デフォルトプロジェクト選択の条件を修正し、localStorage値を優先するように変更する。

## 実装内容

### ProjectSelector.tsxの修正
1. **STORAGE_CONSTANTSのインポート追加**
   - localStorage定数を使用するためのインポートを追加

2. **デフォルト選択条件の修正**
   - `!selectedProjectId && data.length > 0` から
   - `!selectedProjectId && !savedProjectId && data.length > 0` に変更
   - localStorage値が存在する場合はデフォルト選択を回避

## 変更ファイル
- `frontend/src/components/ProjectSelector.tsx`: localStorage確認追加

## 効果
- localStorage値が存在する場合、デフォルトプロジェクトによる上書きを防止
- ページリロード時に正しく保存された値が復元される
- 初回利用時のみデフォルトプロジェクトが選択される
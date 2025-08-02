# マジックナンバーと文字列定数の移行

## 実装方針

CLAUDE.mdの開発ルールに従い、ハードコードされたマジックナンバーや文字列を `frontend/src/constants/` の定数に移行した。

## 実装内容

### 新規作成ファイル
- `frontend/src/constants/ui.ts`

### 変更ファイル
- `frontend/src/components/TestCaseTable.tsx`
- `frontend/src/App.tsx`

### 定数化した項目

#### UI_CONSTANTS
- フォーカス遅延時間: `FOCUS_DELAY_MS: 10`
- セル寸法: 各種幅、高さ設定

#### API_CONSTANTS
- エンドポイント: `/api/testcases`, `/api/projects`
- HTTPメソッド: GET, POST, PUT, DELETE

#### TEXT_CONSTANTS
- プレースホルダー: "Click to edit", "Loading test cases..." など
- ヘッダー: "テストケース", "ID", "仕様" など
- ボタン: "追加", "🗑️" など
- メッセージ: エラーメッセージ、確認ダイアログ文言
- デフォルト値: "新しいテストケース"

#### DISPLAY_CONSTANTS
- 最大表示行数: `MAX_DISPLAY_LINES: 3`
- 省略記号: `ELLIPSIS: '...'`

これにより、文字列やマジックナンバーの一元管理を実現し、保守性が向上した。
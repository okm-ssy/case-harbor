# 船をモチーフにしたfavicon作成

## 実装方針
CaseHarborのブランドアイデンティティに合わせて、船をモチーフにしたfaviconを作成し、フロントエンドに設定する。

## 実装内容

### 1. favicon.svgの作成
- 32x32pxのSVGファイル
- 船のデザイン要素:
  - 紺色の船体（グラデーション）
  - 白い帆（2枚構成）
  - マスト
  - 赤い旗
  - 青い波
- ダークな背景色で統一感を保持

### 2. favicon.icoの作成  
- SVGからImageMagickで変換
- ブラウザ互換性を向上

### 3. index.htmlの更新
- SVGとICO両方のfaviconリンクを追加
- 現代ブラウザ（SVG）と旧ブラウザ（ICO）に対応

## 変更ファイル
- `frontend/public/favicon.svg`: 新規作成（船のSVGアイコン）
- `frontend/public/favicon.ico`: 新規作成（ICO形式）
- `frontend/index.html`: faviconリンク更新

## デザイン特徴
- CaseHarborの🚢アイコンと一致
- テストケース管理という「航海」をイメージ
- ダークテーマに調和する配色
- 小さなサイズでも識別可能なシンプルなデザイン
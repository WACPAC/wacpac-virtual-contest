# WACPAC Virtual Contest

AtCoderバーチャルコンテスト順位表システム

## 概要

AtCoderバーチャルコンテスト順位表システムです。AtCoderの問題を使用して独自のコンテストを開催し、リアルタイムで順位表を管理できます。

## セットアップ・起動方法

リポジトリのクローン後、以下の操作を行うとサイトが立ち上がります。

### 1. 依存関係のインストール
```bash
cd wacpac-virtual-app
npm ci
```

### 2. 環境変数の設定
**.envファイルは絶対にcommitしないこと！！！**
```bash
# .envファイルを作成
cp env.sample .env

# AtCoderのセッションクッキーの取得方法
# 1. ブラウザでAtCoderにログイン
# 2. 開発者ツール(F12) → Application/Storage → Cookies → https://atcoder.jp
# 3. REVEL_SESSIONの値をコピーして.env内に貼り付け
```

### 3. データベースの起動
```bash
# PostgreSQLをDockerで起動
docker-compose up db -d
```

### 4. データベースのマイグレーション
```bash
# Prismaマイグレーション実行
npx prisma migrate dev
```

### 5. アプリケーションの起動
```bash
# 開発サーバー起動（ポート5050）
npm run dev
```

**アクセス**: http://localhost:5050

## 使用方法

### 1. コンテスト作成
1. 「新しいコンテスト」ボタンクリック
2. コンテスト名とコンテスト時間を設定
3. 「作成」ボタンで作成完了

### 2. 問題・ユーザー登録
1. コンテストカードの「管理」ボタンクリック
2. **問題追加**: AtCoderの問題URLを入力（例: `https://atcoder.jp/contests/abc123/tasks/abc123_a`）
3. **ユーザー追加**: 参加者のAtCoder IDを入力

### 3. コンテスト開始
1. コンテストカードの「開始」ボタンクリック
2. ステータスが「実行中」に変更される

### 4. 順位表確認
1. 「順位表」ボタンで順位表画面へ
2. **自動更新**: コンテスト実行中は3分毎に自動更新
3. **手動更新**: いつでも最新データを取得可能
4. **CSV出力**: データをダウンロード


## ライセンス

このプロジェクトは WACPAC のサークル内使用を目的としています。

# WACPAC Virtual Contest

AtCoderバーチャルコンテスト順位表システム

## 概要

AtCoderバーチャルコンテスト順位表システムです。AtCoderの問題を使用して独自のコンテストを開催し、リアルタイムで順位表を管理できます。

## セットアップ・起動方法

リポジトリのクローン後、以下の操作を行うとサイトが立ち上がります。

### 必要コマンド全部をまとめたもの
- 以下の一連のコマンドを実行すれば、環境が立ち上がるはずですが、例えばnpmやdocker等が入っていない場合にエラーが発生します。エラーが発生した時には適宜、以下の1-5の手順を見てください。

```bash
cd wacpac-virtual-app
npm ci
docker-compose up -d db
npx prisma migrate dev
npm run dev
```

### 1. 依存関係のクリーンインストール
```bash
cd wacpac-virtual-app
npm ci
```

<details>
<summary>トラブルシューティング</summary>

- もしもnpmが入っていない場合、以下の手順でnpmをインストールしてください。
```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt install -y nodejs
```
- 以下のコマンドで、npmのインストールを確認できます(正常にインストールできている場合、versionが表示される)
```bash
node -v
npm -v
```

</details>

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
docker-compose up -d db
```

<details>
<summary>トラブルシューティング</summary>

- もしもdockerが入っていない場合、以下の手順でdocker-composeをインストールしてください。
```bash
sudo apt update
sudo apt install docker-compose
```
- 以下のコマンドで、docker-composeのインストールを確認できます(正常にインストールできている場合、versionが表示される)
```bash
docker-compose --version
```
- dockerのpermissonの問題でdocker daemonにアクセスできない場合、以下の手順で現在のユーザをdockerグループに追加してください。
```
sudo usermod -aG docker $USER
newgrp docker
```

</details>

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
3. **ユーザー追加**: 参加者のAtCoder IDを入力 (正しいIDの場合、ユーザー一覧の名前からatcoderのページに飛べるはず)

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

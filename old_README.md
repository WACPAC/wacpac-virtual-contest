# WACPAC Virtual Contest

AtCoder仮想コンテスト管理システム

## 概要

WACPAC（早稲田競技プログラミング同好会）のためのAtCoder仮想コンテスト管理システムです。AtCoderの問題を使用して独自のコンテストを開催し、リアルタイムで順位表を管理できます。

## 主な機能

### コンテスト管理
- **コンテスト作成**: 名前とコンテスト時間（1〜5時間）を設定して新しいコンテストを作成
- **コンテストステータス管理**: 開始前 → 実行中 → 終了 の自動ステータス管理
- **ワンクリック開始**: 開始ボタンでコンテストを即座に開始
- **自動終了**: 設定した時間経過後に自動でコンテスト終了

### 問題管理
- **AtCoder問題の自動取得**: 問題URLから問題名と提出URLを自動抽出
- **問題の順序変更**: ドラッグ&ドロップで問題順を変更（実装予定）
- **得点設定**: 問題ごとに得点を設定（デフォルト100点）

### ユーザー管理  
- **AtCoder ID登録**: 参加者のAtCoder IDを登録
- **一括管理**: コンテストごとにユーザーを管理

### 順位表機能
- **リアルタイム更新**: 実行中コンテストは3分毎に自動更新
- **スマート更新**: 開始前・終了後は自動更新停止でサーバー負荷軽減
- **AtCoderスクレイピング**: 実際のAtCoder提出データを自動取得
- **競技プログラミング式採点**: 
  - 得点: AC問題の合計点
  - ペナルティ: WA/TLE/RE等の回数 × 5分
  - 順位決定: 得点降順 → 時間昇順
- **CSV出力**: 順位表データをCSVファイルでダウンロード

### UI/UX
- **Material-UI**: モダンで美しいデザイン
- **レスポンシブ**: モバイル・デスクトップ対応
- **ステータス表示**: コンテスト状態が一目でわかるチップ表示
- **自動更新通知**: 更新状況をリアルタイム表示

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Material-UI (MUI) 6** - UIコンポーネント
- **Axios** - API通信
- **date-fns** - 日付処理

### バックエンド
- **Next.js API Routes** - RESTful API
- **PostgreSQL** - メインデータベース
- **Prisma** - ORM・データベースマイグレーション
- **Cheerio** - AtCoderウェブスクレイピング

### インフラ・開発環境
- **Docker & Docker Compose** - 本番環境・開発環境
- **TypeScript** - 型安全性
- **ESLint** - コード品質管理

## セットアップ・起動方法

### ローカル開発環境

#### 1. 依存関係のインストール
```bash
cd wacpac-virtual-app
npm ci
```

#### 2. 環境変数の設定
```bash
# .envファイルを作成
echo 'DATABASE_URL="postgresql://wacpac_user:wacpac_password@localhost:5432/wacpac_virtual_contest"
REVEL_SESSION=""' > .env

# AtCoderのセッションクッキーを設定する場合（オプション）
# 1. ブラウザでAtCoderにログイン
# 2. 開発者ツール(F12) → Application/Storage → Cookies → https://atcoder.jp
# 3. REVEL_SESSIONの値をコピーして上記の""内に貼り付け
```

#### 3. データベースの起動
```bash
# PostgreSQLをDockerで起動
docker-compose up db -d
```

#### 4. データベースのマイグレーション
```bash
# Prismaマイグレーション実行
npx prisma migrate dev
```

#### 5. アプリケーションの起動
```bash
# 開発サーバー起動（ポート5050）
npm run dev
```

**アクセス**: http://localhost:5050

### Docker環境（本番想定）

#### 1. ローカルビルド準備
```bash
cd wacpac-virtual-app
npm ci  # ローカルでnode_modulesを準備
```

#### 2. Docker環境起動
```bash
# すべてのサービスを起動
docker-compose up -d

# ログ確認
docker-compose logs -f app
```

**アクセス**: http://localhost:5050

#### 3. 停止・クリーンアップ
```bash
# サービス停止
docker-compose down

# データも含めて完全削除
docker-compose down -v
```

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
2. ステータスが「実行中」に変更
3. 自動で順位表の更新開始

### 4. 順位表確認
1. 「順位表」ボタンで順位表画面へ
2. **自動更新**: 実行中は3分毎に自動更新
3. **手動更新**: いつでも最新データを取得可能
4. **CSV出力**: データをダウンロード

### 5. コンテスト終了
- 設定した時間経過後に自動で「終了」ステータスに変更
- 終了後は順位表の更新停止（サーバー負荷軽減）

## 開発・保守

### データベース操作
```bash
# Prismaスタジオでデータ確認
npx prisma studio

# マイグレーション作成
npx prisma migrate dev --name your_migration_name

# スキーマリセット（開発時のみ）
npx prisma migrate reset
```

### Docker操作
```bash
# ログ確認
docker-compose logs app
docker-compose logs db

# コンテナ内でコマンド実行
docker-compose exec app bash
docker-compose exec db psql -U wacpac_user -d wacpac_virtual_contest
```

### トラブルシューティング

#### データベース接続エラー
- Dockerコンテナが起動しているか確認: `docker-compose ps`
- ポート5432が使用中でないか確認: `lsof -i :5432`

#### マイグレーションエラー
- データベースリセット: `npx prisma migrate reset`
- 手動でマイグレーション適用: `npx prisma migrate deploy`

#### ファビコンが表示されない
- ブラウザキャッシュをクリア
- `/public/favicon.png`の存在確認

## セキュリティ注意事項

- **重要**: xlsxライブラリの脆弱性は解決済み（CSV出力に変更）
- 本番環境では適切な環境変数設定が必要
- AtCoderサーバーへの過度なリクエストを避けるため、適切な間隔での更新を実装済み

## ライセンス

このプロジェクトは早稲田競技プログラミング同好会（WACPAC）の内部使用を目的としています。

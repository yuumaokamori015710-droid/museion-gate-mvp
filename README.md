# MUSEION Gate MVP

MUSEION Gate（ムセイオン・ゲート）は、知性、探究心、実績、次の一手を軸にした審査制キャリアコミュニティです。

ブランドコピーは「知性が、次に動く入口。」です。学歴や年収は審査要素の一部に留め、UI上では「知性」「探究」「意思決定」「クローズドな信頼」を前面に出しています。

## ブランドコンセプト

かつてムセイオンは、知性と探究が集まる場所でした。MUSEION Gateは、その現代版として、キャリア、起業、副業、投資、学びに向き合うハイポテンシャル層が、次の一手を共有する場所です。

露骨な限定表現ではなく、以下の価値観を重視します。

- 知性
- 実績
- 探究心
- 野心
- 次の一手
- 本音の意思決定
- 審査制による信頼
- クローズドな知的社交場

## Gate審査の考え方

MUSEION Gateは「高学歴・高収入限定SNS」として見せるのではなく、審査の裏側で信頼を担保します。
学歴や収入は審査要素の一部に留め、UI上では知性、探究心、実績、次の一手、クローズドな信頼を前面に出します。

MVPでは以下を審査素材として扱います。

- 本人性: メール、氏名、外部プロフィール
- 学びの軌跡: 大学、大学院、研究機関、継続的な学習
- 実績: 職業実績、制作物、研究、登壇、受賞、事業経験
- 経済的実績: 年収レンジなどの任意参考情報
- 探究心: いま深く考えている問い
- 次の一手: これから向かう方向とコミュニティへの貢献可能性

公開プロフィールには年収確認のような露骨な表示は出さず、運営管理画面だけで参考情報として確認します。

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / Row Level Security
- Lucide React

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` に以下を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabaseセットアップ

1. Supabaseで新規プロジェクトを作成します。
2. SQL Editorで `supabase/migrations/001_schema_rls_seed.sql` を実行します。
3. Authentication > URL Configuration で Site URL を `http://localhost:3000` にします。
4. Redirect URLs に `http://localhost:3000/auth/callback` を追加します。
5. `.env.local` にProject URLとanon keyを設定します。

Magic Linkログインを本番で使う場合は、Vercelの本番URLも追加してください。

```text
Site URL: https://your-vercel-domain.vercel.app
Redirect URLs:
- http://localhost:3000/auth/callback
- https://your-vercel-domain.vercel.app/auth/callback
```

## Vercelデプロイ

VercelでGitHubリポジトリ `yuumaokamori015710-droid/museion-gate-mvp` をImportします。

Environment Variablesに以下を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

Deploy後、Supabase側のSite URLとRedirect URLsをVercelの本番URLに合わせます。

## 管理者ユーザーの作り方

1. `/login` からユーザー登録します。
2. `/apply` から新規登録します。
3. Supabase SQL Editorで対象ユーザーをAdminかつ承認済みにします。

```sql
update public.profiles
set status = 'approved', is_admin = true
where email = 'admin@example.com';
```

以後、`/admin` から新規登録審査、メンバー管理、Agora管理、Symposia管理、通報確認ができます。

## 実装済み機能

- LP
- Magic Linkログイン
- Magic Linkログイン、新規登録、ログアウト
- 新規登録フロー
- pending / approved / rejected / suspended のステータス制御
- 承認済みメンバー向けアプリレイアウト
- Home
- Signal — 注目の意思決定
- Agora — 次の一手
- Stoa — テーマ別ルーム
- Symposia — 限定イベント
- Identity — プロフィール
- コメント、いいね、通報
- Admin — Gate運営コンソール
- Supabaseテーブル、RLS、Seed

## 主要ファイル

- `app/page.tsx`: LP
- `app/login/page.tsx`: ログイン/登録
- `app/apply/page.tsx`: Gate Application
- `app/app/*`: 承認済みメンバー向け画面
- `app/admin/page.tsx`: Admin
- `components/app-shell.tsx`: ログイン後ナビゲーション
- `lib/actions.ts`: サーバーアクション
- `supabase/migrations/001_schema_rls_seed.sql`: DB/RLS/Seed SQL

## 動作確認

1. 未ログインで `/` が表示されることを確認します。
2. `/login` で登録します。
3. `/apply` で新規登録します。
4. `profiles.status = 'pending'` の状態で `/app` にアクセスし、登録審査中画面へ移動することを確認します。
5. 管理者SQLで自分を `approved` にします。
6. `/app`、`/app/feed`、`/app/rooms`、`/app/events`、`/app/profile` を確認します。
7. 投稿、コメント、いいね、通報、イベント申込を試します。
8. Adminで `/admin` にアクセスし、新規登録審査・投稿非表示・Symposia作成を確認します。

## 注意点

- 決済、本人確認、DM、求人掲載、AI要約、レコメンド、プッシュ通知はMVP対象外です。
- イベント申込の重複はDBのunique制約で防止しています。UI上の申込済み表示は今後の改善対象です。
- AdminのSymposia編集は、MVPでは作成・削除中心です。既存イベントの編集フォームは次の改善候補です。
- メール確認を有効にする場合、SupabaseのAuth設定に応じてログイン体験が変わります。

## 今後の改善案

- 新規登録審査詳細モーダルとReview Note
- Symposia編集UIと申込者一覧
- Stoa参加/お気に入り
- Agora検索、タグ検索
- 通報対応ステータス更新
- 招待コード運用
- 本人確認/所属確認の任意アップロード

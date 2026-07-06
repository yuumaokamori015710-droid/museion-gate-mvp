import { redirect } from "next/navigation";
import { deleteEvent, hidePost, reviewApplication, signOut, updateUserAdmin, upsertEvent } from "@/lib/actions";
import { statusLabels } from "@/lib/constants";
import { getSessionProfile } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { StatusBadge } from "@/components/status-badge";
import type { Event, Post, Profile } from "@/lib/types";

type Application = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  status: string | null;
  user_type: string | null;
  company: string | null;
  university: string | null;
  job_title: string | null;
  income_range: string | null;
  social_links: Record<string, string> | null;
  bio: string | null;
  interests: string[] | null;
  purpose: string | null;
};

type Report = {
  id: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  detail: string | null;
};

const reviewLabels: Record<string, string> = {
  approved: "Gateを開く",
  rejected: "見送り",
  suspended: "Gate停止"
};

export default async function AdminPage() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile?.is_admin) redirect("/app");

  const [{ data: applications }, { data: users }, { data: posts }, { data: events }, { data: reports }] = await Promise.all([
    supabase.from("applications").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("posts").select("*, profiles(display_name)").order("created_at", { ascending: false }).limit(30),
    supabase.from("events").select("*").order("starts_at"),
    supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50)
  ]);

  return (
    <main className="min-h-screen bg-smoke px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gold">Admin — 管理</p>
            <h1 className="mt-1 text-3xl font-bold">Gate運営コンソール</h1>
          </div>
          <form action={signOut}><Button variant="secondary">ログアウト</Button></form>
        </div>

        <div className="mt-8 grid gap-6">
          <Card>
            <h2 className="text-xl font-bold">Gate申請一覧</h2>
            <p className="mt-2 text-sm text-ink/60">
              本人性、学びの軌跡、職業・制作・研究実績、探究テーマ、貢献可能性をもとに審査します。
              学歴や収入は参考情報であり、表側には出しません。
            </p>
            <div className="mt-5 grid gap-4">
              {(applications as Application[] | null)?.map((app) => (
                <div key={app.id} className="rounded-md border border-line bg-smoke p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{app.display_name} / {app.full_name}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="mt-2 text-sm text-ink/65">{app.email} / {app.user_type}</p>
                      <div className="mt-3 grid gap-2 text-sm text-ink/65 md:grid-cols-2">
                        <p><span className="font-semibold text-ink">学び:</span> {app.university || "未入力"}</p>
                        <p><span className="font-semibold text-ink">所属:</span> {app.company || "未入力"}</p>
                        <p><span className="font-semibold text-ink">役割:</span> {app.job_title || "未入力"}</p>
                        <p><span className="font-semibold text-ink">経済的実績:</span> {app.income_range || "未回答"}</p>
                        <p className="md:col-span-2"><span className="font-semibold text-ink">確認URL:</span> {app.social_links?.url || "未入力"}</p>
                      </div>
                      <p className="mt-2 text-sm text-ink/65">関心: {(app.interests || []).join(", ")}</p>
                      <p className="mt-3 text-sm leading-6 text-ink/70">実績・制作・研究: {app.bio}</p>
                      <p className="mt-3 text-sm leading-6 text-ink/70">問い / 次の一手: {app.purpose}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["approved", "rejected", "suspended"].map((status) => (
                        <form key={status} action={reviewApplication}>
                          <input type="hidden" name="application_id" value={app.id} />
                          <input type="hidden" name="status" value={status} />
                          <Button variant={status === "approved" ? "primary" : "secondary"} type="submit">{reviewLabels[status]}</Button>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-xl font-bold">メンバー管理</h2>
              <div className="mt-5 grid gap-3">
                {(users as Profile[] | null)?.map((item) => (
                  <form key={item.id} action={updateUserAdmin} className="grid gap-3 rounded-md border border-line bg-smoke p-3">
                    <input type="hidden" name="user_id" value={item.id} />
                    <div className="font-semibold">{item.display_name || item.email}</div>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <select className={inputClass} name="status" defaultValue={item.status || "pending"}>
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_admin" defaultChecked={Boolean(item.is_admin)} /> Admin権限</label>
                    </div>
                    <Button type="submit" variant="secondary">更新</Button>
                  </form>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold">Agora管理</h2>
              <div className="mt-5 grid gap-3">
                {(posts as (Post & { profiles?: { display_name?: string | null } | null })[] | null)?.map((post) => (
                  <div key={post.id} className="rounded-md border border-line bg-smoke p-3">
                    <div className="font-semibold">{post.title}</div>
                    <p className="mt-1 text-xs text-ink/55">{post.profiles?.display_name} / {post.is_hidden ? "非表示" : "表示中"}</p>
                    <form action={hidePost} className="mt-3">
                      <input type="hidden" name="post_id" value={post.id} />
                      <Button type="submit" variant="secondary">非表示化</Button>
                    </form>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-xl font-bold">Symposia管理</h2>
              <form action={upsertEvent} className="mt-5 grid gap-3">
                <Field label="タイトル"><input className={inputClass} name="title" required /></Field>
                <Field label="説明"><textarea className={inputClass} name="description" rows={3} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="開催形式"><select className={inputClass} name="event_type"><option>オンライン</option><option>オフライン</option></select></Field>
                  <Field label="場所"><input className={inputClass} name="location" /></Field>
                  <Field label="開催日時"><input className={inputClass} name="starts_at" type="datetime-local" /></Field>
                  <Field label="定員"><input className={inputClass} name="capacity" type="number" /></Field>
                  <Field label="参加費"><input className={inputClass} name="price" type="number" /></Field>
                  <Field label="対象者"><input className={inputClass} name="target_audience" /></Field>
                </div>
                <Button type="submit">Symposiaを作成</Button>
              </form>
              <div className="mt-6 grid gap-2">
                {(events as Event[] | null)?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-3 rounded-md bg-smoke p-3 text-sm">
                    <span className="font-semibold">{event.title}</span>
                    <form action={deleteEvent}>
                      <input type="hidden" name="event_id" value={event.id} />
                      <Button type="submit" variant="danger">削除</Button>
                    </form>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold">通報確認</h2>
              <div className="mt-5 grid gap-3">
                {(reports as Report[] | null)?.map((report) => (
                  <div key={report.id} className="rounded-md border border-line bg-smoke p-3 text-sm">
                    <div className="font-semibold">{report.reason} / {report.target_type}</div>
                    <p className="mt-1 text-ink/55">{report.target_id}</p>
                    {report.detail ? <p className="mt-2 text-ink/70">{report.detail}</p> : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

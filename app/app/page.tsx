import Link from "next/link";
import { ArrowRight, CalendarDays, Gauge, LayoutGrid, SquarePen, UserRound } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Event, Post, Profile, Room } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AppHome() {
  const { supabase, profile } = await getSessionProfile();
  const [{ data: posts }, { data: rooms }, { data: events }, { data: users }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, profiles(id, display_name, user_type, anonymous_title), rooms(id, name), likes(count), comments(count)")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("rooms").select("*").limit(6),
    supabase.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3),
    supabase.from("profiles").select("*").eq("status", "approved").neq("id", profile?.id || "").limit(4)
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gold">Home</p>
          <h1 className="mt-1 text-3xl font-bold">ようこそ、MUSEION Gateへ。</h1>
          <p className="mt-2 text-sm text-ink/60">Signal、Agora、Stoa、Symposiaから今日の次の一手を見つけます。</p>
        </div>
        <ButtonLink href="/app/feed/new">
          <SquarePen size={16} /> 次の一手を投稿する
        </ButtonLink>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold text-gold">Signal — 注目の意思決定</p>
          <p className="mb-4 text-sm text-ink/60">いまMUSEION Gate内で注目されている投稿。</p>
          <div className="grid gap-4">
            {(posts as Post[] | null)?.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
        <div className="grid gap-5">
          <Card>
            <h2 className="flex items-center gap-2 font-bold"><LayoutGrid size={18} /> Stoa — 人気ルーム</h2>
            <div className="mt-4 grid gap-2">
              {(rooms as Room[] | null)?.map((room) => (
                <Link key={room.id} href={`/app/rooms/${room.id}`} className="flex items-center justify-between rounded-md bg-smoke px-3 py-2 text-sm font-semibold">
                  {room.name} <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 font-bold"><CalendarDays size={18} /> Symposia — 近日開催イベント</h2>
            <div className="mt-4 grid gap-3">
              {(events as Event[] | null)?.map((event) => (
                <Link key={event.id} href="/app/events" className="block border-b border-line pb-3 last:border-0">
                  <div className="font-semibold">{event.title}</div>
                  <div className="mt-1 text-xs text-ink/55">{formatDate(event.starts_at)}</div>
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 font-bold"><Gauge size={18} /> Identity — プロフィール完成度</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">現在地、関心領域、次に向かいたい方向を更新しておくと、より近い文脈のメンバーと出会いやすくなります。</p>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 font-bold"><UserRound size={18} /> 近い文脈のメンバー</h2>
            <div className="mt-4 grid gap-2">
              {(users as Profile[] | null)?.map((user) => (
                <Link key={user.id} href={`/app/users/${user.id}`} className="rounded-md bg-smoke px-3 py-2 text-sm">
                  <span className="font-semibold">{user.display_name}</span>
                  <span className="ml-2 text-ink/55">{user.user_type}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

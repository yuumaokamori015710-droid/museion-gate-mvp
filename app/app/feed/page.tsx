import { SquarePen } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { ButtonLink } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export default async function FeedPage() {
  const { supabase } = await getSessionProfile();
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(id, display_name, user_type, anonymous_title), rooms(id, name), likes(count), comments(count)")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gold">Agora</p>
          <h1 className="mt-1 text-3xl font-bold">Agora — 次の一手</h1>
          <p className="mt-2 text-sm text-ink/60">キャリア、起業、副業、投資、学びについて、メンバーの意思決定が集まる場所。</p>
        </div>
        <ButtonLink href="/app/feed/new">
          <SquarePen size={16} /> 次の一手を投稿する
        </ButtonLink>
      </div>
      <div className="mt-8 grid gap-4">
        {(posts as Post[] | null)?.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}

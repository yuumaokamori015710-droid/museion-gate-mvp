import { PostCard } from "@/components/post-card";
import { ButtonLink } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Post, Room } from "@/lib/types";

export default async function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const { supabase } = await getSessionProfile();
  const [{ data: room }, { data: posts }] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", roomId).single(),
    supabase
      .from("posts")
      .select("*, profiles(id, display_name, user_type, anonymous_title), rooms(id, name), likes(count), comments(count)")
      .eq("room_id", roomId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
  ]);
  const typedRoom = room as Room | null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gold">Stoa — {typedRoom?.category}</p>
          <h1 className="mt-1 text-3xl font-bold">{typedRoom?.name || "Stoa"}</h1>
          <p className="mt-3 text-sm leading-7 text-ink/65">{typedRoom?.description}</p>
        </div>
        <ButtonLink href="/app/feed/new">次の一手を投稿する</ButtonLink>
      </div>
      <div className="mt-8 grid gap-4">
        {(posts as Post[] | null)?.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}

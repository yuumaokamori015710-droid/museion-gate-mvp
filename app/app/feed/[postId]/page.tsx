import { addComment, reportTarget, toggleLike } from "@/lib/actions";
import { reportReasons } from "@/lib/constants";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { formatDate, publicAuthor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClass } from "@/components/ui/field";

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { supabase } = await getSessionProfile();
  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, profiles(id, display_name, user_type, anonymous_title), rooms(id, name), likes(count), comments(count)")
      .eq("id", postId)
      .single(),
    supabase.from("comments").select("*, profiles(display_name, user_type, anonymous_title)").eq("post_id", postId).eq("is_hidden", false).order("created_at")
  ]);

  if (!post) return <div className="p-8">投稿が見つかりません。</div>;
  const typedPost = post as Post;
  const author = publicAuthor(typedPost);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <Card>
        <div className="flex flex-wrap gap-2 text-xs text-ink/60">
          <span className="rounded-full bg-smoke px-2 py-1 font-semibold text-navy">{typedPost.category}</span>
          <span>{formatDate(typedPost.created_at)}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold">{typedPost.title}</h1>
        <p className="mt-3 text-sm text-ink/60">{author.name} / {author.meta}</p>
        <p className="mt-6 whitespace-pre-wrap leading-8 text-ink/80">{typedPost.body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {(typedPost.tags || []).map((tag) => <span key={tag} className="text-sm text-ink/50">#{tag}</span>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-5">
          <form action={toggleLike}>
            <input type="hidden" name="post_id" value={typedPost.id} />
            <Button variant="secondary" type="submit">いいね {typedPost.likes?.[0]?.count ?? 0}</Button>
          </form>
          <form action={reportTarget} className="flex flex-wrap gap-2">
            <input type="hidden" name="target_type" value="post" />
            <input type="hidden" name="target_id" value={typedPost.id} />
            <select className={inputClass} name="reason">
              {reportReasons.map((reason) => <option key={reason}>{reason}</option>)}
            </select>
            <Button variant="secondary" type="submit">通報</Button>
          </form>
        </div>
      </Card>
      <Card className="mt-5">
        <h2 className="font-bold">コメント</h2>
        <form action={addComment} className="mt-4 grid gap-3">
          <input type="hidden" name="post_id" value={typedPost.id} />
          <textarea className={inputClass} name="body" rows={3} placeholder="建設的なコメントを書く" required />
          <label className="flex items-center gap-2 text-sm text-ink/65">
            <input type="checkbox" name="is_anonymous" /> 匿名でコメント
          </label>
          <Button type="submit">コメントする</Button>
        </form>
        <div className="mt-6 grid gap-4">
          {(comments || []).map((comment: any) => (
            <div key={comment.id} className="border-t border-line pt-4">
              <div className="text-sm font-semibold">
                {comment.is_anonymous ? "匿名メンバー" : comment.profiles?.display_name || "メンバー"}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/70">{comment.body}</p>
              <form action={reportTarget} className="mt-2 flex flex-wrap gap-2">
                <input type="hidden" name="target_type" value="comment" />
                <input type="hidden" name="target_id" value={comment.id} />
                <select className="rounded-md border border-line bg-white px-2 py-1 text-xs" name="reason">
                  {reportReasons.map((reason) => <option key={reason}>{reason}</option>)}
                </select>
                <button className="text-xs font-semibold text-ink/50" type="submit">通報</button>
              </form>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

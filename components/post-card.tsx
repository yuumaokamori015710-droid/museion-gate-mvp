import Link from "next/link";
import { MessageSquare, ThumbsUp } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate, publicAuthor } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
  const author = publicAuthor(post);
  const likeCount = post.likes?.[0]?.count ?? 0;
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <article className="rounded-lg border border-line bg-[#fffaf2] p-5 transition hover:border-navy">
      <Link href={`/app/feed/${post.id}`} className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
          <span className="rounded-full bg-smoke px-2 py-1 font-semibold text-navy">{post.category}</span>
          {post.rooms?.name ? <span>{post.rooms.name}</span> : null}
          <span>{formatDate(post.created_at)}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/70">{post.body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((tag) => (
            <span key={tag} className="text-xs text-ink/50">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3 text-sm text-ink/60">
          <span>
            {author.name} / {author.meta}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ThumbsUp size={15} /> {likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={15} /> {commentCount}
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

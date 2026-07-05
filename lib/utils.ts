import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toArray(value: FormDataEntryValue | null) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "未定";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function publicAuthor(post: { is_anonymous?: boolean | null; profiles?: { display_name?: string | null; user_type?: string | null; anonymous_title?: string | null } | null }) {
  if (post.is_anonymous) {
    return {
      name: "匿名メンバー",
      meta: post.profiles?.anonymous_title || "MUSEION Gate member"
    };
  }
  return {
    name: post.profiles?.display_name || "メンバー",
    meta: post.profiles?.user_type || "若手プロフェッショナル"
  };
}

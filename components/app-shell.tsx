import Link from "next/link";
import { CalendarDays, Home, LayoutGrid, LogOut, ShieldCheck, SquarePen, UserRound } from "lucide-react";
import { signOut } from "@/lib/actions";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/app", label: "Home", sublabel: "ホーム", icon: Home },
  { href: "/app/feed", label: "Agora", sublabel: "次の一手", icon: SquarePen },
  { href: "/app/rooms", label: "Stoa", sublabel: "ルーム", icon: LayoutGrid },
  { href: "/app/events", label: "Symposia", sublabel: "イベント", icon: CalendarDays },
  { href: "/app/profile", label: "Identity", sublabel: "プロフィール", icon: UserRound }
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const items = profile.is_admin ? [...nav, { href: "/admin", label: "Admin", sublabel: "管理", icon: ShieldCheck }] : nav;

  return (
    <div className="min-h-screen bg-smoke text-ink">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-line bg-white px-4 py-6 md:block">
        <Link href="/app" className="block text-lg font-black tracking-[0.16em] text-navy">
          MUSEION Gate
        </Link>
        <p className="mt-2 text-xs leading-5 text-ink/50">知性が、次に動く入口。</p>
        <nav className="mt-9 grid gap-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-smoke hover:text-ink">
              <item.icon size={18} />
              <span>
                <span className="block">{item.label}</span>
                <span className="block text-[11px] font-medium text-ink/45">{item.sublabel}</span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <div className="mb-4 rounded-md bg-smoke p-3 text-sm">
            <div className="font-bold">{profile.display_name || "メンバー"}</div>
            <div className="mt-1 text-xs text-ink/55">{profile.user_type || "学び続ける人"}</div>
          </div>
          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut size={16} /> ログアウト
            </Button>
          </form>
        </div>
      </aside>
      <main className="pb-24 md:ml-64 md:pb-0">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-line bg-white md:hidden">
        {items.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="grid justify-items-center gap-1 px-1 py-2 text-[11px] font-semibold text-ink/70">
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Room } from "@/lib/types";

export default async function RoomsPage() {
  const { supabase } = await getSessionProfile();
  const { data: rooms } = await supabase.from("rooms").select("*").order("name");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <p className="text-sm font-semibold text-gold">Stoa</p>
      <h1 className="mt-1 text-3xl font-bold">Stoa — テーマ別ルーム</h1>
      <p className="mt-2 text-sm text-ink/60">関心領域ごとに深く語るためのクローズドルーム。</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {(rooms as Room[] | null)?.map((room) => (
          <Link key={room.id} href={`/app/rooms/${room.id}`}>
            <Card className="h-full shadow-none transition hover:border-navy">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gold">{room.category}</p>
                  <h2 className="mt-2 text-lg font-bold">{room.name}</h2>
                </div>
                <ArrowRight size={17} />
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/65">{room.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

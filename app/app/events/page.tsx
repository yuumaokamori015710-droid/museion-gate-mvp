import { registerEvent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function EventsPage() {
  const { supabase } = await getSessionProfile();
  const { data: events } = await supabase.from("events").select("*").order("starts_at");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <p className="text-sm font-semibold text-gold">Symposia</p>
      <h1 className="mt-1 text-3xl font-bold">Symposia — 限定イベント</h1>
      <p className="mt-2 text-sm text-ink/60">知性と経験が交差する、メンバー限定の対話・交流イベント。</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(events as Event[] | null)?.map((event) => (
          <Card key={event.id} className="shadow-none">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
              <span className="rounded-full bg-smoke px-2 py-1 font-semibold text-navy">{event.event_type}</span>
              <span>{formatDate(event.starts_at)}</span>
            </div>
            <h2 className="mt-4 text-xl font-bold">{event.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">{event.description}</p>
            <div className="mt-5 grid gap-1 text-sm text-ink/65">
              <p>場所: {event.location || "未定"}</p>
              <p>定員: {event.capacity || "未定"} / 参加費: {event.price ? `${event.price.toLocaleString()}円` : "無料"}</p>
              <p>対象: {event.target_audience}</p>
            </div>
            <form action={registerEvent} className="mt-5">
              <input type="hidden" name="event_id" value={event.id} />
              <Button type="submit">申し込む</Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createPost } from "@/lib/actions";
import { categories } from "@/lib/constants";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";

export default async function NewPostPage() {
  const { supabase } = await getSessionProfile();
  const { data: rooms } = await supabase.from("rooms").select("*").order("name");

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <p className="text-sm font-semibold text-gold">Agora</p>
      <h1 className="mt-1 text-3xl font-bold">次の一手を投稿する</h1>
      <Card className="mt-8">
        <form action={createPost} className="grid gap-5">
          <Field label="タイトル"><input className={inputClass} name="title" required /></Field>
          <Field label="本文">
            <textarea className={inputClass} name="body" rows={8} placeholder="いま考えていること、迷っていること、次に動こうとしていることを書いてください。" required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="カテゴリ">
              <select className={inputClass} name="category">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="公開範囲 / Stoa">
              <select className={inputClass} name="room_id">
                <option value="">全体</option>
                {(rooms as Room[] | null)?.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="投稿形式">
              <select className={inputClass} name="post_type">
                <option value="real">実名</option>
                <option value="anonymous">匿名</option>
              </select>
            </Field>
            <Field label="タグ" hint="カンマ区切りで入力"><input className={inputClass} name="tags" placeholder="転職, AI, 起業準備" /></Field>
          </div>
          <Button type="submit">投稿する</Button>
        </form>
      </Card>
    </div>
  );
}

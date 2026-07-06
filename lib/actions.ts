"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getSessionProfile } from "@/lib/supabase/server";
import { toArray } from "@/lib/utils";

function requireText(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = requireText(formData, "email");
  const password = requireText(formData, "password");
  const displayName = String(formData.get("display_name") || "").trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { display_name: displayName }
    }
  });
  if (error) throw error;
  redirect("/apply");
}

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = requireText(formData, "email");
  const password = requireText(formData, "password");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  redirect("/app");
}

export async function sendMagicLink(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = requireText(formData, "email");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      shouldCreateUser: true
    }
  });
  if (error) throw error;
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function submitApplication(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  const email = requireText(formData, "email");
  const payload = {
    user_id: user?.id || null,
    full_name: requireText(formData, "full_name"),
    display_name: requireText(formData, "display_name"),
    email,
    user_type: String(formData.get("user_type") || ""),
    university: String(formData.get("university") || ""),
    company: String(formData.get("company") || ""),
    job_title: String(formData.get("job_title") || ""),
    income_range: String(formData.get("income_range") || "未回答"),
    interests: formData.getAll("interests").map(String),
    bio: String(formData.get("bio") || ""),
    purpose: String(formData.get("purpose") || ""),
    invitation_code: String(formData.get("invitation_code") || ""),
    social_links: { url: String(formData.get("social_url") || "") },
    status: "pending"
  };

  if (user) {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email,
      display_name: payload.display_name,
      full_name: payload.full_name,
      status: "pending",
      user_type: payload.user_type,
      university: payload.university,
      company: payload.company,
      job_title: payload.job_title,
      income_range: payload.income_range,
      interests: payload.interests,
      bio: payload.bio,
      purpose: payload.purpose,
      invitation_code: payload.invitation_code,
      social_links: payload.social_links,
      updated_at: new Date().toISOString()
    });
    if (error) redirect("/apply?error=db_setup");
  }

  const { error } = await supabase.from("applications").insert(payload);
  if (error) redirect("/apply?error=db_setup");
  redirect("/apply?submitted=1");
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const payload = {
    display_name: requireText(formData, "display_name"),
    avatar_url: String(formData.get("avatar_url") || ""),
    user_type: String(formData.get("user_type") || ""),
    university: String(formData.get("university") || ""),
    company: String(formData.get("company") || ""),
    job_title: String(formData.get("job_title") || ""),
    income_range: String(formData.get("income_range") || "未回答"),
    interests: toArray(formData.get("interests")),
    bio: String(formData.get("bio") || ""),
    social_links: { url: String(formData.get("social_url") || "") },
    anonymous_title: String(formData.get("anonymous_title") || ""),
    show_income: formData.get("show_income") === "on",
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
  if (error) throw error;
  revalidatePath("/app/profile");
}

export async function createPost(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const roomId = String(formData.get("room_id") || "");
  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    room_id: roomId || null,
    title: requireText(formData, "title"),
    body: requireText(formData, "body"),
    category: String(formData.get("category") || "キャリア"),
    tags: toArray(formData.get("tags")),
    is_anonymous: formData.get("post_type") === "anonymous",
    visibility: roomId ? "room" : "public"
  });
  if (error) throw error;
  redirect("/app/feed");
}

export async function addComment(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const postId = requireText(formData, "post_id");
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    body: requireText(formData, "body"),
    is_anonymous: formData.get("is_anonymous") === "on"
  });
  if (error) throw error;
  revalidatePath(`/app/feed/${postId}`);
}

export async function toggleLike(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const postId = requireText(formData, "post_id");
  const { data } = await supabase.from("likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  if (data) {
    await supabase.from("likes").delete().eq("id", data.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath(`/app/feed/${postId}`);
}

export async function reportTarget(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: requireText(formData, "target_type"),
    target_id: requireText(formData, "target_id"),
    reason: requireText(formData, "reason"),
    detail: String(formData.get("detail") || "")
  });
  if (error) throw error;
  revalidatePath("/app/feed");
}

export async function registerEvent(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const eventId = requireText(formData, "event_id");
  await supabase.from("event_registrations").insert({ event_id: eventId, user_id: user.id });
  revalidatePath("/app/events");
}

export async function reviewApplication(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const applicationId = requireText(formData, "application_id");
  const status = requireText(formData, "status");
  const { data: application, error } = await supabase
    .from("applications")
    .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select("*")
    .single();
  if (error) throw error;
  if (application.user_id) {
    await supabase.from("profiles").update({ status }).eq("id", application.user_id);
  }
  revalidatePath("/admin");
}

export async function updateUserAdmin(formData: FormData) {
  const { supabase } = await getSessionProfile();
  await supabase
    .from("profiles")
    .update({
      status: requireText(formData, "status"),
      is_admin: formData.get("is_admin") === "on"
    })
    .eq("id", requireText(formData, "user_id"));
  revalidatePath("/admin");
}

export async function upsertEvent(formData: FormData) {
  const { supabase, user } = await getSessionProfile();
  if (!user) redirect("/login");
  const id = String(formData.get("event_id") || "");
  const payload = {
    title: requireText(formData, "title"),
    description: String(formData.get("description") || ""),
    event_type: String(formData.get("event_type") || "オンライン"),
    location: String(formData.get("location") || ""),
    starts_at: String(formData.get("starts_at") || ""),
    capacity: Number(formData.get("capacity") || 0),
    price: Number(formData.get("price") || 0),
    target_audience: String(formData.get("target_audience") || ""),
    created_by: user.id
  };
  const result = id ? await supabase.from("events").update(payload).eq("id", id) : await supabase.from("events").insert(payload);
  if (result.error) throw result.error;
  revalidatePath("/admin");
  revalidatePath("/app/events");
}

export async function deleteEvent(formData: FormData) {
  const { supabase } = await getSessionProfile();
  await supabase.from("events").delete().eq("id", requireText(formData, "event_id"));
  revalidatePath("/admin");
  revalidatePath("/app/events");
}

export async function hidePost(formData: FormData) {
  const { supabase } = await getSessionProfile();
  await supabase.from("posts").update({ is_hidden: true }).eq("id", requireText(formData, "post_id"));
  revalidatePath("/admin");
}

export type Profile = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  status: "pending" | "approved" | "rejected" | "suspended" | string | null;
  is_admin: boolean | null;
  user_type: string | null;
  university: string | null;
  company: string | null;
  job_title: string | null;
  income_range: string | null;
  interests: string[] | null;
  bio: string | null;
  purpose: string | null;
  invitation_code: string | null;
  social_links: Record<string, string> | null;
  anonymous_title: string | null;
  show_income: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Room = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string | null;
  created_at: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  room_id: string | null;
  title: string;
  body: string;
  category: string | null;
  tags: string[] | null;
  is_anonymous: boolean | null;
  visibility: string | null;
  is_hidden: boolean | null;
  created_at: string | null;
  profiles?: Pick<Profile, "id" | "display_name" | "user_type" | "anonymous_title"> | null;
  rooms?: Pick<Room, "id" | "name"> | null;
  likes?: { count: number }[];
  comments?: { count: number }[];
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  location: string | null;
  starts_at: string | null;
  capacity: number | null;
  price: number | null;
  target_audience: string | null;
  created_by: string | null;
  created_at: string | null;
};

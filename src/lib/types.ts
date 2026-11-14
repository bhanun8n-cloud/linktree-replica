export type Plan = "free" | "starter" | "pro" | "premium";

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  plan: Plan;
  theme: string;
  button_style: string;
  corner_style: string;
  font: string;
  layout: string;
  title_style: string;
  wallpaper: string;
  show_footer: number;
  created_at: string;
};

export type Link = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  type: string;
  position: number;
  visible: number;
  thumbnail: string;
  created_at: string;
};

export type Social = {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  position: number;
};

export type SessionRow = {
  token: string;
  user_id: string;
  expires_at: string;
};

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  source: string;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price_cents: number;
  sales: number;
  created_at: string;
};

export type ShortLink = {
  id: string;
  user_id: string;
  code: string;
  target: string;
  clicks: number;
  created_at: string;
};

export type ActionState = {
  error?: string;
  ok?: boolean;
  message?: string;
};

export type AnalyticsPoint = {
  date: string;
  label: string;
  views: number;
  clicks: number;
};

export type TopLink = {
  id: string;
  title: string;
  clicks: number;
};
